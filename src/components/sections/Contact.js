import React from 'react';
import Link from 'next/link';

//Contact form links dynamically rendered based on context
const Contact = ({ user, schedule }) => {
  const render = () => {
    if (!schedule) {
      return <p>{process.env.NEXT_PUBLIC_NO_SCHEDULE_TEXT || ""}</p>;
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
            {process.env.NEXT_PUBLIC_SCHEDULE_SESSION_TEXT || ""}
          </a>
          {schedule.paymentUrl && (
            <a 
              href={process.env.NEXT_PUBLIC_PAYMENT_URL || schedule.paymentUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="button"
            >
              {process.env.NEXT_PUBLIC_PAYMENT_TEXT || ""}
            </a>
          )}
        </div>
      </div>
    );
  };
    
};

export default Contact;
