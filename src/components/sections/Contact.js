import React from 'react';
import Link from 'next/link';

// Contact section: only for non-logged-in visitors (logged-in clients use Schedule in header)
const Contact = ({ user, schedule, onOpenLogin }) => {
  if (user) {
    return null;
  }

  const defaultPrompt = 'Please log in or contact to schedule a session.';
  const promptText = process.env.NEXT_PUBLIC_LOGIN_PROMPT || defaultPrompt;
  const showClickableLinks = promptText === defaultPrompt && onOpenLogin;

  const renderLinks = () => {
    if (!schedule) {
      return null;
    }
    return (
      <div className="scheduler">
        <p>{schedule.message}</p>
        <div className="scheduler-links">
          <a
            href={process.env.NEXT_PUBLIC_CALENDAR_URL || schedule.calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button"
          >
            {process.env.NEXT_PUBLIC_SCHEDULE_SESSION_TEXT || "Schedule a Session"}
          </a>
          {schedule.paymentUrl && (
            <a
              href={process.env.NEXT_PUBLIC_PAYMENT_URL || schedule.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button"
            >
              {process.env.NEXT_PUBLIC_PAYMENT_TEXT || "Make a Payment"}
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <section id="contact" className="contact">
      <h2>{process.env.NEXT_PUBLIC_NEW_STUDENTS_TITLE || "New Students"}</h2>
      <p>
        {showClickableLinks ? (
          <>
            Please{' '}
            <button type="button" className="contact-inline-link" onClick={onOpenLogin}>
              log in
            </button>
            {' or '}
            <Link href="/contact" className="contact-inline-link">
              contact
            </Link>
            {' to schedule a session.'}
          </>
        ) : (
          promptText
        )}
      </p>
      {renderLinks()}
    </section>
  );
};

export default Contact;