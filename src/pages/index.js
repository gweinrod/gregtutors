// Next Navigation
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// Layout
import Header from '../components/Header';
import Content from '../components/Content';
import Footer from '../components/Footer';
import Modal from '../components/Modal';

// Custom Auth and Data
import { updateContext, fillContext } from '../lib/auth';
import Data from '../lib/Data';

// Dynamic Home Page
/* Header is Login State and User Information */
/* Content is promotional if not logged in or not signed up - reviews and quotes */
/* Content is useful if logged in and signed up - scheduling and payment */
export default function Home({ reviews, quotes, schedule }) {
  
  // Get the context of the user's experienced if authorized, else display defaults
  const { user, login, logout, context } = updateContext();
  
  // Modal is set to the current use case of the modal when active
  const [modal, setModal] = useState(null);
  
  // Return Dynamic Head, Header, Content, Footer, Modal Login
  return (
    <div className="page-container">
      <Head>
        <title>{context.siteTitle}</title>
        <meta name="description" content={process.env.SITE_DESCRIPTION || ""} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header 
        user={user} 
        openModal={() => setModal('login')} 
        logout={logout}
        theme={context.theme}
      />
      
      <Content 
        reviews={reviews} 
        quotes={quotes} 
        user={user}
        schedule={schedule}
      />
      
      <Footer />
      
      {modal === 'login' && (
        <Modal 
          onClose={() => setModal(null)}
          login={login}
        />
      )}
    </div>
  );
}

// Abstracted database fetching
export async function getServerSideProps(context) {
  
  // Pre-check user
  const { user } = await fillContext(context);
  
  // Then fetch data
  const { reviews, quotes, schedule } = await Data.api.getHome(context, user);
  
  // Return props (context) to the page
  return {
    props: {
      reviews,
      quotes,
      schedule
    }
  };
}
