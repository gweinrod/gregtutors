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
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || session.user.email
        });
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await dataService.getUserProfile(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || session.user.email
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Login
  const login = async (credentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { error: error.message };
      }

      return { success: true };
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
    login,
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