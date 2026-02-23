import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

// OAuth callback - exchanges auth code for session, then redirects
export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;

    const { code, error: oauthError } = router.query;

    const handleCallback = async () => {
      if (oauthError) {
        setError(oauthError);
        setTimeout(() => router.replace('/'), 3000);
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          setTimeout(() => router.replace('/'), 3000);
          return;
        }
      }

      router.replace('/');
    };

    handleCallback();
  }, [router.isReady]);

  return (
    <div className="page-container">
      <main className="content" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        {error ? (
          <>
            <h1>Sign-in failed</h1>
            <p>{error}</p>
            <p>Redirecting you home...</p>
          </>
        ) : (
          <>
            <h1>Signing you in...</h1>
            <p>Please wait.</p>
          </>
        )}
      </main>
    </div>
  );
}
