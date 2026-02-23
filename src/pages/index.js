// Next Navigation
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Link from 'next/link';

// Layout
import Header from '../components/Header';
import Content from '../components/Content';
import Footer from '../components/Footer';
import Modal from '../components/Modal';

// Custom Auth and Data
import { updateContext, fillContext } from '../lib/auth';
import Data from '../lib/Data';
import { getRecaptchaSiteKey, executeAndVerify, checkActionAllowed } from '../lib/recaptcha';

// Dynamic Home Page
/* Header is Login State and User Information */
/* Content is promotional if not logged in or not signed up - reviews and quotes */
/* Content is useful if logged in and signed up - scheduling and payment */
export default function Home({ reviews, quotes, schedule }) {
  
  // Get the context of the user's experienced if authorized, else display defaults
  const { user, loginWithProvider, signInWithGoogleIdToken, logout, context } = updateContext();
  
  // Modal is set to the current use case of the modal when active
  const [modal, setModal] = useState(null);
  const [recaptchaScore, setRecaptchaScore] = useState(null);

  const siteKey = getRecaptchaSiteKey();

  useEffect(() => {
    if (!siteKey || typeof window === 'undefined') {
      setRecaptchaScore(1);
      return;
    }
    let cancelled = false;
    executeAndVerify('homepage').then(({ ok, score }) => {
      if (!cancelled) setRecaptchaScore(ok ? score : 0);
    });
    return () => { cancelled = true; };
  }, [siteKey]);

  const openLoginModal = async () => {
    if (recaptchaScore !== null && recaptchaScore < 0.5) return;
    const { allowed } = await checkActionAllowed('login');
    if (allowed) setModal('login');
  };

  const handleLogout = async () => {
    const { allowed } = await checkActionAllowed('logout');
    if (allowed) logout();
  };

  return (
    <div className="page-container">
      <Head>
        <title>{context.siteTitle}</title>
        <meta name="description" content={process.env.NEXT_PUBLIC_SITE_DESCRIPTION || ""} />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      {siteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
          strategy="afterInteractive"
        />
      )}
      <Header 
        user={user} 
        openModal={openLoginModal}
        logout={handleLogout}
        theme={context.theme}
      />
      
      <Content 
        reviews={reviews} 
        quotes={quotes} 
        user={user}
        schedule={schedule}
        onOpenLogin={openLoginModal}
      />
      
      <Footer />
      
      {modal === 'login' && (
        <Modal 
          onClose={() => setModal(null)}
          loginWithProvider={loginWithProvider}
          signInWithGoogleIdToken={signInWithGoogleIdToken}
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

/*
export async function getStaticProps() {
  // Return empty schedule for static build
  return {
    props: { 
      schedule: null
    }
  };
  }
  */
