import React, { useState, useEffect, useRef } from 'react';

const OAUTH_PROVIDERS = [
  { id: 'google', label: 'Continue with Google' },
];

const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

// Modal to handle OAuth logins. Uses Google Identity Services on our domain so
// the user never sees supabase.co (no paid custom hostname needed).
const Modal = ({ onClose, loginWithProvider, signInWithGoogleIdToken }) => {
  const [error, setError] = useState('');
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [scriptReady, setScriptReady] = useState(false);
  const googleButtonRef = useRef(null);
  const clientId = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID : '';

  // Load Google Identity Services script
  useEffect(() => {
    if (!clientId) {
      setScriptReady(false);
      return;
    }
    if (window.google?.accounts?.id) {
      setScriptReady(true);
      return;
    }
    const existing = document.querySelector(`script[src="${GSI_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => setScriptReady(true));
      return;
    }
    const script = document.createElement('script');
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptReady(true);
    document.head.appendChild(script);
  }, [clientId]);

  // Initialize Google button when script is ready
  useEffect(() => {
    if (!scriptReady || !clientId || !googleButtonRef.current || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential,
      auto_select: false,
    });

    try {
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: 280,
      });
    } catch (e) {
      console.error('Google button render error:', e);
    }
  }, [scriptReady, clientId]);

  const handleGoogleCredential = async (response) => {
    if (!response?.credential || !signInWithGoogleIdToken) return;
    setError('');
    setLoadingProvider('google');
    const timeoutMs = 16000; // Slightly longer than auth.js timeout
    const timeoutId = setTimeout(() => {
      setLoadingProvider(null);
      setError('Sign-in is taking too long. Please try again or close and reopen the modal.');
    }, timeoutMs);
    try {
      const result = await signInWithGoogleIdToken(response.credential);
      clearTimeout(timeoutId);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    } catch (err) {
      clearTimeout(timeoutId);
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleFallbackGoogleClick = async () => {
    setError('');
    setLoadingProvider('google');
    try {
      const result = await loginWithProvider('google');
      if (result?.error) setError(result.error);
      else if (result?.success) onClose();
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoadingProvider(null);
    }
  };

  const useFallback = !clientId;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close" onClick={onClose} aria-label="Close">&times;</button>

        <h2>Login</h2>
        <p className="modal-subtitle">Sign in with your preferred account</p>

        {error && <div className="error">{error}</div>}

        <div className="oauth-buttons">
          {useFallback ? (
            <button
              type="button"
              className="oauth-btn oauth-btn-google"
              onClick={handleFallbackGoogleClick}
              disabled={!!loadingProvider}
            >
              {loadingProvider === 'google' ? 'Signing in...' : OAUTH_PROVIDERS[0].label}
            </button>
          ) : (
            <div ref={googleButtonRef} className="google-button-wrapper" />
          )}
        </div>
        {loadingProvider === 'google' && !useFallback && (
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--ink-muted, #666)' }}>Signing in...</p>
        )}
      </div>
    </div>
  );
};

export default Modal;
