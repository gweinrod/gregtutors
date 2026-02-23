// Next
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// Layout
import Header from '../components/Header';
import Footer from '../components/Footer';

// Auth and Data
import { updateContext, fillContext } from '../lib/auth';
import Data from '../lib/Data';
import { dataService } from '../lib/supabase';
import { checkActionAllowed } from '../lib/recaptcha';
import {
  expandScheduleEventsForRange,
  formatTimeHHMM,
  formatDateLong,
} from '../lib/scheduleExpand';

const CAT_LABELS = { inperson: 'In Person', remote: 'Remote', unavailable: 'Unavailable' };

export default function Classes({ schedule }) {
  const router = useRouter();
  const { user, logout, context, loading } = updateContext();
  const [scheduleRows, setScheduleRows] = useState([]);
  const [showPast, setShowPast] = useState(false);
  const [classesAllowed, setClassesAllowed] = useState(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    checkActionAllowed('classes').then(({ allowed }) => {
      if (!cancelled) setClassesAllowed(allowed);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (classesAllowed === false && typeof window !== 'undefined') {
      router.replace('/');
    }
  }, [classesAllowed, router]);

  const handleLogout = async () => {
    const { allowed } = await checkActionAllowed('logout');
    if (allowed) logout();
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const email = user.email || '';
    dataService.getScheduleEvents(email).then((rows) => {
      if (!cancelled) setScheduleRows(rows || []);
    });
    return () => { cancelled = true; };
  }, [user]);

  const rangeStart = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d;
  }, []);

  const rangeEnd = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d;
  }, []);

  const expanded = useMemo(
    () => expandScheduleEventsForRange(scheduleRows, rangeStart, rangeEnd),
    [scheduleRows, rangeStart, rangeEnd]
  );

  // Event has ended iff current time is after the event's end (date + end time). Keeps class in Upcoming for full duration.
  const eventEndedAt = (e) => {
    const endTime = (e.end || '23:59').length >= 5 ? (e.end || '23:59').slice(0, 5) : (e.end || '23:59');
    const endStr = `${e.date}T${endTime}:00`;
    return new Date(endStr).getTime();
  };

  const now = useMemo(() => Date.now(), [tick]);

  const future = useMemo(
    () =>
      expanded
        .filter((e) => eventEndedAt(e) > now)
        .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)),
    [expanded, now]
  );

  const past = useMemo(
    () =>
      expanded
        .filter((e) => eventEndedAt(e) <= now)
        .sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start)),
    [expanded, now]
  );

  const list = showPast ? past : future;
  const listLabel = showPast ? 'Past classes' : 'Upcoming classes';

  if (typeof window !== 'undefined' && !loading && !user) {
    router.push('/');
    return null;
  }

  return (
    <div className="page-container">
      <Head>
        <title>Classes | {context.siteTitle}</title>
        <meta name="description" content="Manage your tutoring classes" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </Head>

      <Header user={user} logout={handleLogout} page="classes" theme={context.theme} />

      <main className="content">
        <section className="classes">
          <h1>Classes</h1>
          {loading ? (
            <p>Loading…</p>
          ) : user ? (
            <>
              <p>Welcome, {user.name}!</p>

              {schedule && (
                <div className="scheduler" style={{ marginBottom: '1.5rem' }}>
                  <h2>Your Schedule</h2>
                  <p>{schedule.message}</p>
                  <div className="scheduler-links">
                    <Link href="/schedule" className="button">
                      {process.env.NEXT_PUBLIC_SCHEDULE_SESSION_TEXT || 'Open Schedule'}
                    </Link>
                    {schedule.paymentUrl && (
                      <a
                        href={process.env.NEXT_PUBLIC_PAYMENT_URL || schedule.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button"
                      >
                        {process.env.NEXT_PUBLIC_PAYMENT_TEXT || 'Make a Payment'}
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="classes-list-section">
                <h2>{listLabel}</h2>
                <div className="classes-toggle-wrap" style={{ marginBottom: '1rem' }}>
                  <button
                    type="button"
                    className={`classes-toggle-btn ${!showPast ? 'active' : ''}`}
                    onClick={() => setShowPast(false)}
                  >
                    Upcoming
                  </button>
                  <button
                    type="button"
                    className={`classes-toggle-btn ${showPast ? 'active' : ''}`}
                    onClick={() => setShowPast(true)}
                  >
                    Past
                  </button>
                </div>
                {list.length === 0 ? (
                  <p className="classes-empty">
                    {showPast ? 'No past classes in this range.' : 'No upcoming classes.'}
                  </p>
                ) : (
                  <ul className="classes-list">
                    {list.map((ev, i) => (
                      <li key={`${ev.date}-${ev.start}-${ev.title}-${i}`} className="classes-list-item">
                        <span className="classes-date">{formatDateLong(ev.date)}</span>
                        <span className="classes-time">
                          {formatTimeHHMM(ev.start)} – {formatTimeHHMM(ev.end)}
                        </span>
                        <span className="classes-title">{ev.title}</span>
                        <span className={`classes-cat classes-cat-${ev.cat}`}>{CAT_LABELS[ev.cat] || ev.cat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <p>Please log in to access this page.</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

// No server-side redirect: fillContext has no session on server (client-only auth),
// so let the client decide. Logged-in users see the Classes page; others redirect in the component.
export async function getServerSideProps(context) {
  const { user } = await fillContext(context);
  const schedule = user ? await Data.api.getSchedule(user, context) : null;
  return { props: { schedule: schedule || null } };
}
