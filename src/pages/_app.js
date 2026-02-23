import { useState } from 'react';
import { Authenticator } from '../lib/auth';
import '../styles/globals.css';

function App({ Component, pageProps }) {
  const [theme, setTheme] = useState('light');
  const context = { theme, setTheme, siteTitle: process.env.NEXT_PUBLIC_SITE_TITLE || "Greg Tutors" };

  return (
    <Authenticator context={context}>
      <Component {...pageProps} />
    </Authenticator>
  );
}

export default App;
