/**
 * Expand schedule_events (one-off + recurring) into flat instances over a date range.
 * Used by Classes page for past/future lists.
 */

function timeToHHmm(t) {
  if (!t) return '09:00';
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

function dateFromStr(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d;
}

function getMonday(d) {
  const day = new Date(d);
  const diff = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - diff);
  day.setHours(0, 0, 0, 0);
  return day;
}

function getRecurrenceWeekIndex(dateObj, row) {
  const anchorStr = (row.date && String(row.date).slice(0, 10)) || (row.created_at && String(row.created_at).slice(0, 10));
  const anchorMs = anchorStr ? getMonday(dateFromStr(anchorStr)).getTime() : 0;
  const weekMs = getMonday(dateObj).getTime();
  return Math.floor((weekMs - anchorMs) / (7 * 24 * 60 * 60 * 1000));
}

// Map DB day_of_week to JS getDay(): normalize to number; DB may use 1=Mon..7=Sun (ISO) or 0=Sun..6=Sat (JS)
function toJsDay(dbDay) {
  if (dbDay == null || dbDay === '') return null;
  const n = Number(dbDay);
  if (Number.isNaN(n)) return null;
  return n === 7 ? 0 : n;
}

function isRecurring(row) {
  const v = row.is_recurring;
  return v === true || v === "t" || v === 1 || v === "1" || String(v).toLowerCase() === "true";
}

/** First date on which this recurring event should appear (no instances before this). */
function getRecurrenceStartDateStr(row) {
  if (row.date && String(row.date).trim()) return String(row.date).slice(0, 10);
  if (row.created_at && String(row.created_at).trim()) return String(row.created_at).slice(0, 10);
  return fmtDate(new Date());
}

/** Expand rows into flat events between startDate and endDate (Date objects or YYYY-MM-DD). */
export function expandScheduleEventsForRange(rows, startDate, endDate) {
  if (!rows?.length) return [];
  const start = typeof startDate === 'string' ? startDate : fmtDate(startDate);
  const end = typeof endDate === 'string' ? endDate : fmtDate(endDate);
  const result = [];

  const startD = dateFromStr(start);
  const endD = dateFromStr(end);

  for (const row of rows) {
    const jsDay = row.day_of_week != null && row.day_of_week !== "" ? toJsDay(row.day_of_week) : null;
    if (isRecurring(row) && jsDay != null) {
      const recurrenceStart = getRecurrenceStartDateStr(row);
      const endDateStr = row.recurrence_end_date ? String(row.recurrence_end_date).slice(0, 10) : null;
      const interval = row.recurrence_interval === 2 ? 2 : 1;
      const startTime = timeToHHmm(row.start_time);
      const endTime = timeToHHmm(row.end_time);
      const d = new Date(startD);
      while (d <= endD) {
        if (Number(d.getDay()) === Number(jsDay)) {
          const dateStr = fmtDate(d);
          if (dateStr < recurrenceStart) {
            d.setDate(d.getDate() + 1);
            continue;
          }
          if (endDateStr && dateStr > endDateStr) {
            d.setDate(d.getDate() + 1);
            continue;
          }
          if (interval === 2) {
            const weekIndex = getRecurrenceWeekIndex(d, row);
            if (weekIndex % 2 !== 0) { d.setDate(d.getDate() + 1); continue; }
          }
          result.push({
            date: dateStr,
            start: startTime,
            end: endTime,
            title: row.title,
            cat: row.category,
          });
        }
        d.setDate(d.getDate() + 1);
      }
    } else if (row.date) {
      const dateStr = row.date.slice(0, 10);
      if (dateStr >= start && dateStr <= end) {
        result.push({
          date: dateStr,
          start: timeToHHmm(row.start_time),
          end: timeToHHmm(row.end_time),
          title: row.title,
          cat: row.category,
        });
      }
    }
  }
  return result;
}

/** Format time "HH:mm" to "9:00 AM" style. */
export function formatTimeHHMM(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Format date string YYYY-MM-DD to "Mon, Jan 15, 2024". */
export function formatDateLong(dateStr) {
  if (!dateStr) return '';
  const d = dateFromStr(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
