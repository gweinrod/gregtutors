// Next
import Head from 'next/head';
import { useRouter } from 'next/router';

// Layout
import Header from '../components/Header';
import Footer from '../components/Footer';

// Auth and Data
import { updateContext, fillContext } from '../lib/auth';
import Data from '../lib/Data';

export default function Classes({ schedule }) {
  const router = useRouter();
  const { user, logout, context } = updateContext();

  // Users not logged in are redirected to the home page, client side redirect
  if (!user && typeof window !== 'undefined') {
    router.push('/');
    return null; // Don't render anything while redirecting
  }

  // Logged in users are shown the calendar of classes, but only those with permission set in the database have a schedule class link rendered
  return (
    <div className="page-container">
      <Head>
        <title>Classes | {context.siteTitle}</title>
        <meta name="description" content="Manage your tutoring classes" />
      </Head>

      <Header 
        user={user} 
        logout={logout}
        page="classes"
        theme={context.theme}
      />
      
      <main className="content">
        <section className="classes">
          <h1>Classes</h1>
          {user ? (
            <>
              <p>Welcome, {user.name}!</p>
              
              {schedule ? (
                <div className="scheduler">
                  <h2>Your Schedule</h2>
                  <p>{schedule.message}</p>
                  <div className="scheduler-links">
                    <a 
                      href={process.env.CALENDAR_URL || schedule.calendarUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="button"
                    >
                      {process.env.SCHEDULE_SESSION_TEXT || "Schedule a Session"}
                    </a>
                    {schedule.paymentUrl && (
                      <a 
                        href={process.env.PAYMENT_URL || schedule.paymentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="button"
                      >
                        {process.env.PAYMENT_TEXT || "Make a Payment"}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p>This page is currently under construction.</p>
              )}
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

// Get the user's context before rendering
export async function getServerSideProps(context) {
  
  // Update authentication
  const { user } = await fillContext(context);
  
  // Users not logged in are redirected to the home page, server side redirect
  if (!user) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    };
  }
  
  // User is logged in, get the calendar
  const schedule = await Data.api.getSchedule(user, context);
  
  // Return props to the page
  return {
    props: { 
      schedule
    }
  };
}
