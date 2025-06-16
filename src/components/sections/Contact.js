import React from 'react';

// Contact form links dynamically rendered based on context
const Contact = ({ user, schedule }) => {
  const render = () => {
    if (!schedule) {
      return <p>{process.env.NEXT_PUBLIC_NO_SCHEDULE_TEXT || "Please contact us for scheduling options."}</p>;
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
      <h2>{user ? process.env.NEXT_PUBLIC_CURRENT_STUDENTS_TITLE || "Current Students" : process.env.NEXT_PUBLIC_NEW_STUDENTS_TITLE || "New Students"}</h2>
      {user ? (
        render()
      ) : (
        <>
          <p>{process.env.NEXT_PUBLIC_LOGIN_PROMPT || "Please log in to access scheduling."}</p>
          {render()}
        </>
      )}
    </section>
  );
};

export default Contact;