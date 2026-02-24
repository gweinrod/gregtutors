import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { updateContext } from "../lib/auth";
import { supabase, dataService } from "../lib/supabase";
import { getAdminNotifyEmail } from "../lib/adminEmail";
import { checkActionAllowed } from "../lib/recaptcha";

// ── CONSTANTS ──
const HOURS_START = 8;
const HOURS_END   = 23;
const ROW_H       = 80;
const DAYS_SHORT  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const TOTAL_HOURS = HOURS_END - HOURS_START;

// ── HELPERS ──
function uid() { return Math.random().toString(36).slice(2); }

function getMonday(d) {
  const day = new Date(d);
  const diff = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - diff);
  day.setHours(0, 0, 0, 0);
  return day;
}

function offsetDate(n) {
  const d = new Date(getMonday(new Date()));
  d.setDate(d.getDate() + n);
  return fmtDate(d);
}

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmt12(time) {
  let [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

function addHour(time) {
  let [h, m] = time.split(":").map(Number);
  h = Math.min(h + 1, 23);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

function getWeekLabel(weekDays) {
  const first = weekDays[0], last = weekDays[6];
  const fmtShort = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const fmtYear  = d => d.getFullYear();
  if (first.getMonth() === last.getMonth())
    return `${fmtShort(first)} – ${last.getDate()}, ${fmtYear(last)}`;
  if (first.getFullYear() === last.getFullYear())
    return `${fmtShort(first)} – ${fmtShort(last)}, ${fmtYear(last)}`;
  return `${fmtShort(first)}, ${fmtYear(first)} – ${fmtShort(last)}, ${fmtYear(last)}`;
}

function nowLineY() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes();
  if (h < HOURS_START || h >= HOURS_END) return null;
  return ((h - HOURS_START) + m / 60) * ROW_H;
}

// True if the given date + start time is in the past or has already started (current day before/at current time, or earlier day)
function isSlotInPast(dateStr, startStr) {
  if (!dateStr || !startStr) return false;
  const [sh, sm] = startStr.split(":").map(Number);
  const slotStart = new Date(dateStr + "T" + String(sh).padStart(2, "0") + ":" + String(sm || 0).padStart(2, "0") + ":00");
  return slotStart.getTime() <= Date.now();
}

// True if the event has already started or is in the past (non-admin cannot delete)
function isEventPastOrInProgress(ev) {
  if (!ev?.date || !ev?.start) return false;
  const [sh, sm] = (ev.start + "").split(":").map(Number);
  const eventStart = new Date(ev.date + "T" + String(sh).padStart(2, "0") + ":" + String(sm || 0).padStart(2, "0") + ":00");
  return eventStart.getTime() < Date.now();
}

// Normalize time from DB "HH:mm:ss" to "HH:mm"
function timeToHHmm(t) {
  if (!t) return "09:00";
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

// Map DB day_of_week to JS getDay(): normalize to number; DB may use 1=Mon..7=Sun (ISO) or 0=Sun..6=Sat (JS)
function toJsDay(dbDay) {
  if (dbDay == null || dbDay === '') return null;
  const n = Number(dbDay);
  if (Number.isNaN(n)) return null;
  return n === 7 ? 0 : n; // 7 (ISO Sunday) -> 0 (JS Sunday)
}

// Normalize DB recurring flag (PostgreSQL can return true, "t", 1, etc.)
function isRecurring(row) {
  const v = row.is_recurring;
  return v === true || v === "t" || v === 1 || v === "1" || String(v).toLowerCase() === "true";
}

// Week index from anchor (row.date or row.created_at) for bi-weekly: 0, 2, 4... = show
function getRecurrenceWeekIndex(weekStart, row) {
  const anchorStr = row.date && String(row.date).slice(0, 10) || row.created_at && String(row.created_at).slice(0, 10);
  const anchorMs = anchorStr ? getMonday(new Date(anchorStr + "T12:00:00")).getTime() : 0;
  const weekMs = getMonday(weekStart).getTime();
  return Math.floor((weekMs - anchorMs) / (7 * 24 * 60 * 60 * 1000));
}

// First date on which this recurring event should appear (no instances before this)
function getRecurrenceStartDateStr(row) {
  if (row.date && String(row.date).trim()) return String(row.date).slice(0, 10);
  if (row.created_at && String(row.created_at).trim()) return String(row.created_at).slice(0, 10);
  return fmtDate(new Date());
}

// Expand DB rows into flat events for the visible week (one-off + recurring instances)
function expandScheduleEventsForWeek(rows, weekStart) {
  if (!rows || !rows.length) return [];
  const weekDays = getWeekDays(weekStart);
  const weekStartStr = fmtDate(weekDays[0]);
  const weekEndStr = fmtDate(weekDays[6]);
  const result = [];

  for (const row of rows) {
    const jsDay = row.day_of_week != null && row.day_of_week !== "" ? toJsDay(row.day_of_week) : null;
    if (isRecurring(row) && jsDay != null) {
      const recurrenceStart = getRecurrenceStartDateStr(row);
      const interval = row.recurrence_interval === 2 ? 2 : 1;
      const weekIndex = getRecurrenceWeekIndex(weekStart, row);
      if (interval === 2 && weekIndex % 2 !== 0) continue;
      const start = timeToHHmm(row.start_time);
      const end = timeToHHmm(row.end_time);
      const endDateStr = row.recurrence_end_date ? String(row.recurrence_end_date).slice(0, 10) : null;
      weekDays.forEach((d) => {
        if (Number(d.getDay()) === Number(jsDay)) {
          const dateStr = fmtDate(d);
          if (dateStr < recurrenceStart) return;
          if (endDateStr && dateStr > endDateStr) return;
          result.push({
            id: `recurring-${row.id}-${dateStr}`,
            dbId: row.id,
            title: row.title,
            date: dateStr,
            start: start,
            end: end,
            cat: row.category,
            user_email: row.user_email,
            isRecurring: true,
            recurrenceInterval: row.recurrence_interval ?? 1
          });
        }
      });
    } else if (row.date) {
      const dateStr = row.date.slice(0, 10);
      if (dateStr >= weekStartStr && dateStr <= weekEndStr) {
        result.push({
          id: row.id,
          title: row.title,
          date: dateStr,
          start: timeToHHmm(row.start_time),
          end: timeToHHmm(row.end_time),
          cat: row.category,
          user_email: row.user_email
        });
      }
    }
  }
  return result;
}

// ── STYLES ──
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

.ws-root {
  --cream: #f5f0e8;
  --cream-dark: #ede7d8;
  --ink: #1a1612;
  --ink-muted: #6b6258;
  --ink-faint: #c5bdb0;
  --accent: #2e7d32;
  --main-blue: #000080;
  --gold: #ffd700;
  --border: #ddd5c5;
  --shadow: rgba(26,22,18,0.08);
  font-family: 'Nunito', sans-serif;
  background: var(--cream);
  color: var(--ink);
  min-height: 100vh;
  margin: 1rem;
  border: 3px solid var(--gold);
  border-radius: 8px;
  overflow: hidden;
}

/* HEADER */
.ws-header {
  background: var(--cream);
  border-bottom: 1.5px solid var(--border);
  padding: 0 32px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}
.ws-brand {
  font-family: 'Nunito', sans-serif;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.01em;
}
.ws-week-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 24px;
  margin-right: 24px;
}
.ws-week-label {
  font-family: 'Nunito', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: var(--ink-muted);
  min-width: 160px;
  text-align: center;
  padding: 0 4px;
}
.ws-btn-nav {
  background: var(--cream-dark);
  border: 2px solid var(--border);
  width: 42px;
  height: 42px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
  transition: all 0.18s;
  flex-shrink: 0;
}
.ws-btn-nav svg {
  width: 22px; height: 22px;
  stroke: currentColor; stroke-width: 2.5;
  fill: none; stroke-linecap: round; stroke-linejoin: round;
}
.ws-btn-nav:hover { background: var(--main-blue); color: var(--cream); border-color: var(--main-blue); }

.ws-btn-today {
  background: var(--accent); color: var(--cream);
  border: none; padding: 7px 16px; border-radius: 20px;
  font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 500;
  cursor: pointer; letter-spacing: 0.04em; transition: opacity 0.18s;
  min-width: 130px; text-align: center;
}
.ws-btn-today:hover { opacity: 0.8; }

.ws-btn-add {
  background: var(--gold); color: var(--ink);
  border: none; padding: 7px 16px; border-radius: 20px;
  font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 500;
  cursor: pointer; letter-spacing: 0.04em;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: opacity 0.18s; min-width: 130px;
}
.ws-btn-add:hover { opacity: 0.9; }

/* LEGEND */
.ws-legend {
  display: flex; gap: 16px; align-items: center; justify-content: center;
  padding: 4px 32px 2px; flex-wrap: wrap;
}
.ws-legend-label {
  font-size: 13px; letter-spacing: .1em; text-transform: uppercase;
  color: var(--ink-faint); font-weight: 500;
}
.ws-legend-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 14px; color: var(--ink-muted); letter-spacing: 0.04em;
}
.ws-legend-dot {
  width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
}

/* PLANNER */
.ws-planner { padding: 0 32px 40px; overflow-x: auto; }
.ws-grid-wrap { min-width: 700px; }

/* CALENDAR WRAPPER — border wraps both header and grid together */
.ws-calendar-wrap {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* DAY HEADERS */
.ws-day-headers {
  display: grid;
  grid-template-columns: 56px repeat(7, 1fr);
  background: var(--cream);
  border-bottom: 1.5px solid var(--border);
  padding-bottom: 2px; padding-top: 2px;
  flex-shrink: 0;
  z-index: 10;
}
.ws-day-header { text-align: center; padding: 1px 4px; }
.ws-day-name {
  font-size: 13px; font-weight: 500; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--ink-muted);
}
.ws-day-num {
  font-family: 'Nunito', sans-serif;
  font-size: 24px; font-weight: 700; line-height: 1.1;
  color: var(--ink); margin-top: 0;
}
.ws-day-header.today .ws-day-num {
  background: var(--accent); color: #fff;
  width: 36px; height: 36px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.ws-day-header.today .ws-day-name { color: var(--accent); }

/* SCROLL GRID */
.ws-scroll-grid {
  max-height: calc(100vh - 280px); overflow-y: auto;
  background: var(--cream);
  flex-shrink: 0;
  padding-top: 4px;
}
.ws-scroll-grid::-webkit-scrollbar { width: 6px; }
.ws-scroll-grid::-webkit-scrollbar-track { background: transparent; }
.ws-scroll-grid::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

/* TIME GRID */
.ws-time-grid { display: flex; position: relative; }
.ws-time-labels { width: 56px; flex-shrink: 0; }
.ws-time-slot {
  height: ${ROW_H}px; display: flex; align-items: center;
  justify-content: flex-end; padding-right: 8px;
  color: var(--ink-faint); font-size: 12px; font-weight: 400;
  letter-spacing: 0.04em; user-select: none;
}
.ws-days-row { display: grid; grid-template-columns: repeat(7, 1fr); flex: 1; }
.ws-day-col {
  border-left: 1px solid var(--border); position: relative;
  height: ${TOTAL_HOURS * ROW_H}px; cursor: pointer;
}
.ws-day-col:hover { background: rgba(46,125,50,0.02); }
.ws-hour-line {
  position: absolute; left: 0; right: 0;
  border-top: 1px solid var(--border); height: 0; pointer-events: none;
}
.ws-half-line {
  position: absolute; left: 0; right: 0;
  border-top: 1px dashed var(--cream-dark); height: 0; pointer-events: none;
}

/* EVENTS */
.ws-event {
  position: absolute; left: 4px; right: 4px;
  border-radius: 6px; padding: 4px 8px; cursor: pointer;
  overflow: hidden; transition: transform 0.12s, box-shadow 0.12s;
  border-left: 3px solid transparent; z-index: 10;
}
.ws-event:hover { transform: translateY(-1px); box-shadow: 0 4px 16px var(--shadow); z-index: 20; }
.ws-event-title {
  font-size: 13px; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;
}
.cat-inperson    { background: #ddeeff; border-left-color: #1a6bbf; color: #0d3d73; }
.cat-remote      { background: #ede8fb; border-left-color: #7b3fa0; color: #3d1470; }
.cat-unavailable { background: #fde8e8; border-left-color: #c0392b; color: #7b1327; }

/* NOW LINE */
.ws-now-line {
  position: relative; left: 0; right: 0; width: 100%; height: 2px;
  background: var(--accent); z-index: 30; pointer-events: none;
}
.ws-now-line::before {
  content: ''; position: absolute; left: -4px; top: -4px;
  width: 10px; height: 10px; border-radius: 50%; background: var(--accent);
}

/* MODAL OVERLAY */
.ws-overlay {
  position: fixed; inset: 0; background: rgba(26,22,18,0.45);
  z-index: 200; display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(2px);
}
.ws-modal {
  background: var(--cream); border-radius: 16px;
  width: 420px; max-width: 95vw; padding: 32px;
  box-shadow: 0 24px 64px rgba(26,22,18,0.18);
  animation: ws-slide-in 0.22s ease;
}
@keyframes ws-slide-in {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.ws-modal-title {
  font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 20px;
  margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;
}
.ws-btn-close {
  background: none; border: none; font-size: 22px; cursor: pointer;
  color: var(--ink-muted); line-height: 1; padding: 0; transition: color 0.15s;
}
.ws-btn-close:hover { color: var(--ink); }
.ws-form-group { margin-bottom: 18px; }
.ws-label {
  display: block; font-size: 14px; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--ink-muted); margin-bottom: 6px;
}
.ws-input {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid var(--border); border-radius: 8px;
  background: #fff; font-family: 'Nunito', sans-serif;
  font-size: 16px; color: var(--ink); outline: none;
  transition: border-color 0.18s; appearance: none;
  box-sizing: border-box;
}
.ws-input:focus { border-color: var(--ink-muted); }
.ws-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ws-cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ws-cat-btn {
  border: 2px solid transparent; border-radius: 8px; padding: 11px 8px;
  cursor: pointer; font-size: 15px; font-weight: 600;
  text-align: center; transition: all 0.15s; letter-spacing: 0.03em;
}
.ws-cat-btn.active { border-color: var(--ink); transform: scale(1.04); }
.ws-cat-btn.inperson    { background: #ddeeff; color: #0d3d73; }
.ws-cat-btn.remote      { background: #ede8fb; color: #3d1470; }
.ws-cat-btn.unavailable { background: #fde8e8; color: #7b1327; }
.ws-modal-actions {
  display: flex; gap: 10px; justify-content: flex-end;
  margin-top: 24px; flex-wrap: wrap;
}
.ws-btn-cancel {
  background: none; border: 1.5px solid var(--border); padding: 9px 20px;
  border-radius: 20px; font-family: 'Nunito', sans-serif; font-size: 15px;
  cursor: pointer; color: var(--ink-muted); transition: all 0.15s;
}
.ws-btn-cancel:hover { background: var(--cream-dark); }
.ws-btn-delete {
  background: none; border: 1.5px solid #f5c6c2; padding: 9px 20px;
  border-radius: 20px; font-family: 'Nunito', sans-serif; font-size: 15px;
  cursor: pointer; color: #c0392b; transition: all 0.15s; margin-right: auto;
}
.ws-btn-delete:hover { background: #fce4ec; }
.ws-btn-save {
  background: var(--main-blue); color: var(--cream); border: none;
  padding: 9px 24px; border-radius: 20px;
  font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 500;
  cursor: pointer; transition: opacity 0.15s;
}
.ws-btn-save:hover { opacity: 0.8; }
.ws-checkbox-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.ws-checkbox-wrap input[type="checkbox"] { width: 20px; height: 20px; accent-color: var(--main-blue); cursor: pointer; }
.ws-recurrence-row { margin-top: 12px; padding-left: 0; }
.ws-radio-wrap { display: flex; gap: 16px; flex-wrap: wrap; }
.ws-radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 15px; font-weight: 500; }
.ws-radio-label input { width: 18px; height: 18px; accent-color: var(--main-blue); }

/* Mobile: shrink grid to fit all 7 days, reduce padding for horizontal space */
@media (max-width: 768px) {
  .ws-root { margin: 0.25rem; }
  .ws-header { padding: 0 12px; }
  .ws-planner { padding: 0 8px 24px; }
  .ws-grid-wrap { min-width: 0; }
  .ws-legend { padding: 4px 8px 2px; }
  .ws-time-labels { width: 44px; }
  .ws-day-headers { grid-template-columns: 44px repeat(7, minmax(0, 1fr)); }
  .ws-day-name { font-size: 11px; letter-spacing: 0.06em; }
  .ws-day-num { font-size: 18px; }
  .ws-day-header.today .ws-day-num { width: 28px; height: 28px; font-size: 14px; }
  .ws-days-row { grid-template-columns: repeat(7, minmax(0, 1fr)); }
  .ws-day-col { min-width: 0; }
}
/* Portrait: even tighter so all 7 days fit on narrow screens */
@media (max-width: 480px) {
  .ws-root { margin: 2px; }
  .ws-header { padding: 0 6px; }
  .ws-planner { padding: 0 4px 16px; }
  .ws-legend { padding: 2px 4px; }
  .ws-time-labels { width: 36px; }
  .ws-day-headers { grid-template-columns: 36px repeat(7, minmax(0, 1fr)); }
  .ws-day-name { font-size: 10px; letter-spacing: 0.04em; }
  .ws-day-num { font-size: 16px; }
  .ws-day-header.today .ws-day-num { width: 24px; height: 24px; font-size: 12px; }
}
`;

// ── MODAL COMPONENT ──
const NEW_CLIENT_VALUE = "__new__";

function EventModal({ editingEvent, defaultDate, defaultStart, userName, userEmail, adminEmail, registeredUsers = [], deleteError, onSave, onDelete, onClose }) {
  const isAdmin = userEmail === adminEmail;
  const canSelectUnavailable = isAdmin;
  const showClientSelector = isAdmin && !editingEvent;
  const isDeletable = isAdmin || !isEventPastOrInProgress(editingEvent);

  const initialCat = editingEvent?.cat === "unavailable" && !canSelectUnavailable ? "inperson" : (editingEvent?.cat || "inperson");
  const [date,     setDate]     = useState(editingEvent ? editingEvent.date  : defaultDate || fmtDate(new Date()));
  const [start,    setStart]    = useState(editingEvent ? editingEvent.start : defaultStart || "09:00");
  const [end,      setEnd]      = useState(editingEvent ? editingEvent.end   : addHour(defaultStart || "09:00"));
  const [cat,      setCat]      = useState(initialCat);
  const [isRecurring, setIsRecurring] = useState(!!editingEvent?.isRecurring);
  const [recurrenceInterval, setRecurrenceInterval] = useState((editingEvent?.recurrenceInterval === 2) ? "bi-weekly" : "weekly");

  // Client selection (admin new event only)
  const [clientChoice, setClientChoice] = useState(""); // "" | email | NEW_CLIENT_VALUE
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");

  // Title for non-admin or edit: single field
  const [title, setTitle] = useState(editingEvent ? editingEvent.title : userName || "");
  const [saveError, setSaveError] = useState("");

  const dateRef  = useRef(null);

  useEffect(() => { setTimeout(() => dateRef.current?.focus(), 100); }, []);
  useEffect(() => { setSaveError(""); }, [date, start]);

  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter")  { e.preventDefault(); handleSave(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function getTitleAndEmail() {
    if (showClientSelector) {
      if (clientChoice === NEW_CLIENT_VALUE) {
        return { title: newClientName.trim(), user_email: newClientEmail.trim() };
      }
      const selected = registeredUsers.find((u) => u.email === clientChoice);
      if (selected) return { title: selected.name || selected.email, user_email: selected.email };
      return { title: "", user_email: "" };
    }
    return { title: title.trim(), user_email: userEmail || "" };
  }

  function handleSave() {
    setSaveError("");
    if (!isAdmin && !editingEvent && isSlotInPast(date, start)) {
      setSaveError("The time selected is in the past and cannot be modified.");
      return;
    }
    const { title: saveTitle, user_email: saveEmail } = getTitleAndEmail();
    if (!saveTitle.trim()) return;
    if (showClientSelector && clientChoice === NEW_CLIENT_VALUE && !saveEmail.trim()) return;
    const dayOfWeek = new Date(date + "T12:00:00").getDay();
    onSave({
      title: saveTitle.trim(),
      user_email: saveEmail.trim() || undefined,
      date,
      start,
      end,
      cat,
      is_recurring: isRecurring,
      day_of_week: isRecurring ? dayOfWeek : undefined,
      recurrence_interval: isRecurring ? (recurrenceInterval === "bi-weekly" ? 2 : 1) : undefined
    });
  }

  return (
    <div className="ws-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ws-modal">
        <div className="ws-modal-title">
          <span>{editingEvent ? "Edit Event" : "New Event"}</span>
          <button className="ws-btn-close" onClick={onClose}>&times;</button>
        </div>

        {(deleteError || saveError) && (
          <div className="ws-form-group" style={{ color: "#c0392b", fontSize: 14, marginBottom: 12 }}>
            {deleteError || saveError}
          </div>
        )}

        {showClientSelector ? (
          <div className="ws-form-group">
            <label className="ws-label">Client</label>
            <select
              className="ws-input"
              value={clientChoice}
              onChange={(e) => setClientChoice(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              <option value="">Select client...</option>
              {(registeredUsers || []).map((u) => (
                <option key={u.email} value={u.email}>
                  {u.name ? `${u.name} (${u.email})` : u.email}
                </option>
              ))}
              <option value={NEW_CLIENT_VALUE}>+ New client...</option>
            </select>
            {clientChoice === NEW_CLIENT_VALUE && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className="ws-label">New client name</label>
                  <input
                    className="ws-input"
                    type="text"
                    placeholder="Name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="ws-label">New client email</label>
                  <input
                    className="ws-input"
                    type="email"
                    placeholder="email@example.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="ws-form-group">
            <label className="ws-label">Client</label>
            <input className="ws-input" type="text" value={title} readOnly
              style={{ background: "#f0ece3", cursor: "default", color: "var(--ink-muted)" }} />
          </div>
        )}

        <div className="ws-form-group">
          <label className="ws-label">Category</label>
          <div className="ws-cat-grid">
            {["inperson", "remote", ...(canSelectUnavailable ? ["unavailable"] : [])].map(c => (
              <button key={c}
                className={`ws-cat-btn ${c} ${cat === c ? "active" : ""}`}
                onClick={() => setCat(c)}>
                {c === "inperson" ? "In Person" : c === "remote" ? "Remote" : "Unavailable"}
              </button>
            ))}
          </div>
        </div>

        <div className="ws-form-group">
          <label className="ws-label">Date</label>
          <input ref={dateRef} className="ws-input" type="date" value={date}
            onChange={e => setDate(e.target.value)} />
          {isRecurring && (
            <p className="ws-recurrence-hint" style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6 }}>
              Repeats on this day of the week. For another day, create a separate recurring event.
            </p>
          )}
        </div>

        <div className="ws-form-group">
          <div className="ws-checkbox-wrap">
            <input
              type="checkbox"
              id="ws-recurring"
              checked={isRecurring}
              onChange={e => setIsRecurring(e.target.checked)}
            />
            <label htmlFor="ws-recurring" className="ws-radio-label" style={{ marginBottom: 0 }}>Recurring event</label>
          </div>
          {isRecurring && (
            <div className="ws-recurrence-row">
              <span className="ws-label" style={{ display: "block", marginBottom: 8 }}>Recurrence</span>
              <div className="ws-radio-wrap">
                <label className="ws-radio-label">
                  <input
                    type="radio"
                    name="recurrence"
                    checked={recurrenceInterval === "weekly"}
                    onChange={() => setRecurrenceInterval("weekly")}
                  />
                  Weekly
                </label>
                <label className="ws-radio-label">
                  <input
                    type="radio"
                    name="recurrence"
                    checked={recurrenceInterval === "bi-weekly"}
                    onChange={() => setRecurrenceInterval("bi-weekly")}
                  />
                  Bi-weekly
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="ws-form-group">
          <div className="ws-form-row">
            <div>
              <label className="ws-label">Start Time</label>
              <input className="ws-input" type="time" value={start}
                onChange={e => setStart(e.target.value)} />
            </div>
            <div>
              <label className="ws-label">End Time</label>
              <input className="ws-input" type="time" value={end}
                onChange={e => setEnd(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="ws-modal-actions">
          {editingEvent && (
            <button type="button" className="ws-btn-delete" onClick={() => onDelete(editingEvent)} disabled={!isDeletable} title={!isDeletable ? "Previous events may not be deleted." : undefined}>
              Delete
            </button>
          )}
          <button type="button" className="ws-btn-cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="ws-btn-save"   onClick={handleSave}>Save Event</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT (inner) ──
function WeeklySchedule({ user, adminEmail, initialScheduleRows = [] }) {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [scheduleRows, setScheduleRows] = useState(initialScheduleRows);
  const [modal,     setModal]     = useState(null); // null | { editingEvent, defaultDate, defaultStart }
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [nowY,      setNowY]      = useState(nowLineY);
  const scrollRef = useRef(null);
  const todayStr  = fmtDate(new Date());

  const weekDays    = getWeekDays(weekStart);
  const weekDayStrs = weekDays.map(fmtDate);
  const weekLabel   = getWeekLabel(weekDays);
  const userName    = user?.name || "";
  const userEmail   = user?.email || "";
  const isAdmin     = userEmail === adminEmail;

  const events = useMemo(
    () => expandScheduleEventsForWeek(scheduleRows, weekStart),
    [scheduleRows, weekStart]
  );

  const loadSchedule = useCallback(async () => {
    const rows = await dataService.getScheduleEvents();
    setScheduleRows(rows || []);
  }, []);

  useEffect(() => { loadSchedule(); }, [loadSchedule]);

  // When admin opens new-event modal, fetch registered users for client selector
  useEffect(() => {
    if (!modal || modal.editingEvent || !isAdmin) {
      if (!modal || !isAdmin) setRegisteredUsers([]);
      return;
    }
    let cancelled = false;
    const fetchUsers = async (retries = 1) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session?.access_token) {
        if (retries > 0) setTimeout(() => fetchUsers(0), 300);
        return;
      }
      const res = await fetch("/api/list-users", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (cancelled) return;
      const json = await res.json().catch(() => ({}));
      setRegisteredUsers(Array.isArray(json.users) ? json.users : []);
    };
    fetchUsers();
    return () => { cancelled = true; };
  }, [modal, isAdmin]);

  // Scroll to 2 PM on mount
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = (14 - HOURS_START) * ROW_H;
  }, []);

  // Tick now-line every minute
  useEffect(() => {
    const id = setInterval(() => setNowY(nowLineY()), 60000);
    return () => clearInterval(id);
  }, []);

  // Inject/update CSS every render
  useEffect(() => {
    let tag = document.getElementById("ws-styles");
    if (!tag) {
      tag = document.createElement("style");
      tag.id = "ws-styles";
      document.head.appendChild(tag);
    }
    tag.textContent = CSS;
  }, []);

  const goToPrevWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate()-7); return n; });
  const goToNextWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate()+7); return n; });
  const goToToday = () => {
    setWeekStart(getMonday(new Date()));
    // Scroll to current time (or 2 PM fallback if outside hours)
    setTimeout(() => {
      if (!scrollRef.current) return;
      const now = new Date();
      const h = now.getHours(), m = now.getMinutes();
      const inRange = h >= HOURS_START && h < HOURS_END;
      const targetY = inRange
        ? ((h - HOURS_START) + m / 60) * ROW_H - scrollRef.current.clientHeight / 2
        : (14 - HOURS_START) * ROW_H;
      scrollRef.current.scrollTop = Math.max(0, targetY);
    }, 50);
  };

  const [deleteError, setDeleteError] = useState(null);
  const openNew  = (date, start) => { setDeleteError(null); setModal({ editingEvent: null, defaultDate: date, defaultStart: start }); };
  const openEdit = (ev)          => { setDeleteError(null); setModal({ editingEvent: ev,   defaultDate: null, defaultStart: null }); };
  const closeModal = ()          => setModal(null);

  const notifyScheduleEvent = (action, data) => {
    fetch('/api/notify-schedule-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data }),
    }).catch(() => {});
  };

  const handleSave = async ({ title, date, start, end, cat, user_email: eventUserEmail, is_recurring, day_of_week, recurrence_interval }) => {
    const editing = modal?.editingEvent;
    if (editing) {
      const dbId = editing.dbId || editing.id;
      const payload = { title, start, end, cat };
      if (!editing.dbId) payload.date = date;
      if (is_recurring != null) payload.is_recurring = is_recurring;
      if (day_of_week != null) payload.day_of_week = day_of_week;
      if (recurrence_interval != null) payload.recurrence_interval = recurrence_interval;
      const updated = await dataService.updateScheduleEvent(dbId, payload);
      if (updated) await loadSchedule();
    } else {
      // When admin adds an event with a client email (e.g. "New client"), ensure that client is in the dropdown list for next time
      if (isAdmin && eventUserEmail?.trim()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            await fetch("/api/add-client", {
              method: "POST",
              headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ email: eventUserEmail.trim(), name: (title || "").trim() || eventUserEmail.trim() })
            });
          }
        } catch (e) {
          console.warn("Add client for dropdown failed:", e);
        }
      }
      const created = await dataService.createScheduleEvent({
        title,
        date,
        start,
        end,
        cat,
        user_email: eventUserEmail != null ? eventUserEmail : (user?.email || ""),
        is_recurring: is_recurring ?? false,
        day_of_week: is_recurring ? day_of_week : undefined,
        recurrence_interval: is_recurring ? (recurrence_interval ?? 1) : undefined
      });
      if (created) {
        await loadSchedule();
        notifyScheduleEvent('added', {
          userName: user?.name,
          userEmail: user?.email,
          title,
          date: is_recurring ? null : date,
          start,
          end,
          cat,
          is_recurring: is_recurring ?? false,
          recurrence_interval: is_recurring ? (recurrence_interval ?? 1) : undefined
        });
      }
    }
    closeModal();
  };

  const handleDelete = async (ev) => {
    if (!isAdmin && isEventPastOrInProgress(ev)) {
      setDeleteError("Previous events may not be deleted.");
      return;
    }
    setDeleteError(null);
    const dbId = ev.dbId || ev.id;
    try {
      let ok = false;
      if (ev.isRecurring && ev.date) {
        const instanceDate = new Date(ev.date + "T12:00:00");
        instanceDate.setDate(instanceDate.getDate() - 1);
        const lastShowDate = fmtDate(instanceDate);
        const recurrenceStart = scheduleRows.find((r) => r.id === dbId)
          ? getRecurrenceStartDateStr(scheduleRows.find((r) => r.id === dbId))
          : null;
        if (recurrenceStart && lastShowDate < recurrenceStart) {
          ok = await dataService.deleteScheduleEvent(dbId);
        } else {
          const updated = await dataService.updateScheduleEvent(dbId, { recurrence_end_date: lastShowDate });
          ok = !!updated;
        }
      } else {
        ok = await dataService.deleteScheduleEvent(dbId);
      }
      if (ok) {
        await loadSchedule();
        notifyScheduleEvent('deleted', {
          userName: user?.name,
          userEmail: user?.email,
          title: ev.title,
          date: ev.date,
          start: ev.start,
          end: ev.end,
          cat: ev.cat
        });
      }
    } catch (err) {
      console.error('Delete schedule event error:', err);
    } finally {
      closeModal();
    }
  };

  const handleColClick = useCallback((e, dateStr) => {
    if (e.target.closest(".ws-event")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hourOffset = Math.floor(y / ROW_H);
    const hour = String(HOURS_START + hourOffset).padStart(2, "0");
    const startStr = `${hour}:00`;
    if (!isAdmin && isSlotInPast(dateStr, startStr)) return;
    openNew(dateStr, startStr);
  }, [isAdmin]);

  const timeLabels = Array.from({ length: TOTAL_HOURS }, (_, i) => {
    const h = HOURS_START + i;
    return h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
  });

  const hourLines = Array.from({ length: TOTAL_HOURS }, (_, i) => i);

  return (
    <div className="ws-root">
      {/* ── HEADER ── */}
      <header className="ws-header">
        <div className="ws-brand">Schedule</div>

        <div className="ws-week-nav">
          <button className="ws-btn-nav" onClick={goToPrevWeek} aria-label="Previous week">
            <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="ws-week-label">{weekLabel}</span>
          <button className="ws-btn-nav" onClick={goToNextWeek} aria-label="Next week">
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="ws-btn-today" onClick={goToToday}>Jump to Now</button>
          <button className="ws-btn-add" onClick={() => openNew(todayStr, "09:00")}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;New&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </button>
        </div>
      </header>

      {/* ── LEGEND ── */}
      <div className="ws-legend">
        <span className="ws-legend-label">Categories</span>
        <div className="ws-legend-item">
          <div className="ws-legend-dot" style={{ background: "#1a6bbf" }}/>In Person
        </div>
        <div className="ws-legend-item">
          <div className="ws-legend-dot" style={{ background: "#7b3fa0" }}/>Remote
        </div>
        <div className="ws-legend-item">
          <div className="ws-legend-dot" style={{ background: "#c0392b" }}/>Unavailable
        </div>
      </div>

      {/* ── PLANNER ── */}
      <div className="ws-planner">
        <div className="ws-grid-wrap">

          <div className="ws-calendar-wrap">

            {/* Day headers — outside scroll, never moves */}
            <div className="ws-day-headers">
              <div/>
              {weekDays.map(d => {
                const ds = fmtDate(d);
                const isToday = ds === todayStr;
                return (
                  <div key={ds} className={`ws-day-header${isToday ? " today" : ""}`}>
                    <div className="ws-day-name">{DAYS_SHORT[d.getDay()]}</div>
                    <div className="ws-day-num">{d.getDate()}</div>
                  </div>
                );
              })}
            </div>

            {/* Only the time grid scrolls */}
            <div className="ws-scroll-grid" ref={scrollRef}>
            <div className="ws-time-grid">

              {/* Time labels */}
              <div className="ws-time-labels">
                {timeLabels.map(label => (
                  <div key={label} className="ws-time-slot">{label}</div>
                ))}
              </div>

              {/* Day columns */}
              <div className="ws-days-row">
                {weekDays.map(d => {
                  const ds = fmtDate(d);
                  const isToday = ds === todayStr;
                  const dayEvents = events.filter(ev => ev.date === ds);

                  return (
                    <div key={ds} className="ws-day-col"
                      onClick={e => handleColClick(e, ds)}>

                      {/* Hour lines */}
                      {hourLines.map(i => (
                        <div key={`h${i}`}>
                          <div className="ws-hour-line" style={{ top: i * ROW_H }}/>
                          <div className="ws-half-line" style={{ top: i * ROW_H + ROW_H / 2 }}/>
                        </div>
                      ))}

                      {/* Events */}
                      {dayEvents.map(ev => {
                        const [sh, sm] = ev.start.split(":").map(Number);
                        const [eh, em] = ev.end.split(":").map(Number);
                        const top    = ((sh - HOURS_START) + sm / 60) * ROW_H;
                        const height = Math.max(((eh * 60 + em) - (sh * 60 + sm)) / 60 * ROW_H, 4);
                        const isOtherClient = !isAdmin && ev.user_email && ev.user_email !== userEmail;
                        const displayCat = isOtherClient ? "unavailable" : ev.cat;
                        const displayTitle = isOtherClient ? "Unavailable" : ev.title;
                        return (
                          <div key={ev.id}
                            className={`ws-event cat-${displayCat}`}
                            style={{ top, height }}
                            onClick={e => {
                              e.stopPropagation();
                              if (!isOtherClient) openEdit(ev);
                            }}>
                            <div className="ws-event-title">{displayTitle}</div>
                          </div>
                        );
                      })}

                      {/* Now line */}
                      {isToday && nowY !== null && (
                        <div style={{ position: "absolute", top: nowY, left: 0, right: 0, zIndex: 30, pointerEvents: "none" }}>
                          <span style={{
                            position: "absolute",
                            left: 6,
                            top: -18,
                            fontSize: 11,
                            fontWeight: 800,
                            color: "#2e7d32",
                            fontFamily: "'Nunito', sans-serif",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            background: "var(--cream, #f5f0e8)",
                            padding: "1px 4px",
                            borderRadius: 3,
                            lineHeight: 1.4,
                          }}>NOW</span>
                          <div style={{ height: 2, background: "#2e7d32", width: "100%" }}/>
                          <div style={{
                            position: "absolute", left: -4, top: -4,
                            width: 10, height: 10, borderRadius: "50%", background: "#2e7d32"
                          }}/>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>{/* end ws-scroll-grid */}
          </div>{/* end ws-calendar-wrap */}
        </div>
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <EventModal
          editingEvent={modal.editingEvent}
          defaultDate={modal.defaultDate}
          defaultStart={modal.defaultStart}
          userName={userName}
          userEmail={userEmail}
          adminEmail={adminEmail}
          registeredUsers={registeredUsers}
          deleteError={deleteError}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

// ── PAGE (auth + layout) ──
export default function SchedulePage({ adminEmail, initialScheduleRows }) {
  const router = useRouter();
  const { user, logout, context, loading } = updateContext();
  const [scheduleAllowed, setScheduleAllowed] = useState(null);

  useEffect(() => {
    let cancelled = false;
    checkActionAllowed("schedule").then(({ allowed }) => {
      if (!cancelled) setScheduleAllowed(allowed);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (scheduleAllowed === false && typeof window !== "undefined") {
      router.replace("/");
    }
  }, [scheduleAllowed, router]);

  const handleLogout = async () => {
    const { allowed } = await checkActionAllowed("logout");
    if (allowed) logout();
  };

  if (typeof window !== "undefined" && !loading && !user) {
    router.push("/");
    return null;
  }

  return (
    <div className="page-container">
      <Head>
        <title>Schedule | {context.siteTitle}</title>
        <meta name="description" content="Weekly schedule" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <Header
        user={user}
        logout={handleLogout}
        page="schedule"
        theme={context.theme}
      />
      <main className="content" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", fontFamily: "Nunito, sans-serif" }}>Loading…</div>
        ) : user ? (
          <WeeklySchedule user={user} adminEmail={adminEmail || ""} initialScheduleRows={initialScheduleRows || []} />
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

// Fetch schedule events on the server so they're in the page payload (visible in schedule.json).
// Logged-in users see the schedule; others redirect on the client.
export async function getServerSideProps() {
  const adminEmail = getAdminNotifyEmail();
  const initialScheduleRows = await dataService.getScheduleEvents();
  return { props: { adminEmail, initialScheduleRows: initialScheduleRows || [] } };
}
