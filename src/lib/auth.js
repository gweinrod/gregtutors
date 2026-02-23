import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import { supabase, dataService } from './supabase';

// Create context for authentication
const AuthContext = createContext();

export function Authenticator({ children, context }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for authentication on mount and auth changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await dataService.getUserProfile(session.user.id);
        const name = profile?.name || session.user.email;
        setUser({
          id: session.user.id,
          email: session.user.email,
          name
        });
        await dataService.upsertClient({
          id: session.user.id,
          email: session.user.email,
          name
        });
        if (session.access_token && name) {
          fetch('/api/backfill-schedule-name', {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
          }).catch(() => {});
        }
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await dataService.getUserProfile(session.user.id);
          const name = profile?.name || session.user.email;
          setUser({
            id: session.user.id,
            email: session.user.email,
            name
          });
          await dataService.upsertClient({
            id: session.user.id,
            email: session.user.email,
            name
          });
          if (session.access_token && name) {
            fetch('/api/backfill-schedule-name', {
              method: 'POST',
              headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ name })
            }).catch(() => {});
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Login with Google using our domain only (no redirect to supabase.co).
  // Call this with the id_token from Google Identity Services callback.
  const signInWithGoogleIdToken = async (idToken) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.session?.user) {
        const u = data.session.user;
        const nameFromMeta = u.user_metadata?.full_name || u.user_metadata?.name;
        setUser({
          id: u.id,
          email: u.email,
          name: nameFromMeta || u.email,
        });
        setLoading(false);
        // Run profile + clients sync in background so login modal closes immediately
        (async () => {
          try {
            const profile = await dataService.getUserProfile(u.id);
            const name = profile?.name || nameFromMeta || u.email;
            setUser((prev) => (prev ? { ...prev, name } : null));
            await dataService.upsertClient({ id: u.id, email: u.email, name });
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token && name) {
              fetch('/api/backfill-schedule-name', {
                method: 'POST',
                headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
              }).catch(() => {});
            }
          } catch (e) {
            console.error('Post-login sync:', e);
          }
        })();
        return { success: true };
      }
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Google sign-in error:', error);
      setLoading(false);
      return { error: error.message || 'An unexpected error occurred' };
    }
  };

  // Legacy OAuth redirect (not used for Google when using signInWithGoogleIdToken)
  const loginWithProvider = async (provider) => {
    if (provider === 'google') {
      return { error: 'Use the Google button above to sign in.' };
    }
    try {
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4200'}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });

      if (error) return { error: error.message };
      if (data?.url) {
        window.location.href = data.url;
        return { success: true };
      }
      return { error: 'Could not start sign-in' };
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      
      // Route to Home
      if (router.pathname !== '/') {
        router.replace('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Application context is user dependent
  const authContextValue = {
    user,
    loginWithProvider,
    signInWithGoogleIdToken,
    logout,
    loading,
    context
  };

  // Authorize and return the updated context
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook passed directly above, refresh authentication and use it to perform an action
export function updateContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('updateContext must be used within an Authenticator');
  }
  return context;
}

// Helper for interacting with local authentication
export async function fillContext(context) {
  try {
    // For server-side rendering, we need to check if there's a session
    // This is a simplified version - in production you'd want to verify the session server-side
    return { user: null };
  } catch (error) {
    console.error('Auth validation error:', error);
    return { user: null };
  }
}