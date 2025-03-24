import React from 'react';
import Link from 'next/link';

//Contact form links dynamically rendered based on context
const Contact = ({ user, schedule }) => {
  const render = () => {
    if (!schedule) {
      return <p>{process.env.NO_SCHEDULE_TEXT || ""}</p>;
    }

    return (
      <div className="scheduler">
        <p>{schedule.message}</p>
        <div className="scheduler-links">
          <a 
            href={process.env.CALENDAR_URL || schedule.calendarUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="button"
          >
            {process.env.SCHEDULE_SESSION_TEXT || ""}
          </a>
          {schedule.paymentUrl && (
            <a 
              href={process.env.PAYMENT_URL || schedule.paymentUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="button"
            >
              {process.env.PAYMENT_TEXT || ""}
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <section id="contact-info" className="contact">
      <h2>{process.env.NEW_STUDENTS_TITLE || ""}</h2>
      <p>Inquire <a href={process.env.INQUIRE_URL || ""} target="_blank" rel="noopener noreferrer">here</a></p>
      
      <h2>{process.env.CURRENT_STUDENTS_TITLE || ""}</h2>
      {user ? render() : <p>{process.env.LOGIN_PROMPT || ""}</p>}
    </section>
  );
};

export default Contact;
