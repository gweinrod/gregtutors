-- Add optional end date for recurring events. When set, only instances on or before this date are shown.
-- Deleting "this and future" sets recurrence_end_date = (instance date - 1) to preserve history.

alter table public.schedule_events
  add column if not exists recurrence_end_date date;

comment on column public.schedule_events.recurrence_end_date is 'For recurring events: last date (inclusive) on which the recurrence appears. Null = no end. Set when user deletes "this and future" to preserve past instances.';
