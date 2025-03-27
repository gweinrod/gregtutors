import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import { parseCookies, setCookie, destroyCookie } from 'nookies';

//Create context for authentication
const AuthContext = createContext();

export function Authenticator({ children, context }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  //Check for client cookie authentication
  useEffect(() => {
    const { token } = parseCookies();
    
    if (token) {
      //Client side update authentication
      fetch('/api/token', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (data.user) { setUser(data.user); }
                      else { setUser(null); }})
      .catch(() => { setUser(null) });
    } else { 
      setUser(null); 
    } 
  }, []);

  //Login
  const login = async (credentials) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (res.ok) {
        const data = await res.json();
        
        //Set authentication for 14 days, or end of session
        setCookie(null, 'token', data.token, {
          maxAge: 7 * 24 * 60 * 60, // 14 days, or end of session
          path: '/',
        });
        
        setUser(data.user);
        return { success: true };
      } else {
        const error = await res.json();
        return { error: error.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  //Logout function
  const logout = async () => {
    try {
      //Delete current session's cookie
      destroyCookie(null, 'token', { path: '/' });
      
      //Notify server of logout
      await fetch('/api/logout', {
        method: 'POST'
      });
      
      setUser(null);
      
      //Route to Home
	if (router.pathname !== '/') {
        router.replace('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  //Application context is user dependent
  const authContextValue = {
    user,
    login,
    logout,
    context
  };

  //Authorize and return the updated context
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

//Hook passed directly above, refresh authentication and use it to perform an action
export function updateContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('updateContext must be used within an Authenticator');
  }
  return context;
}

//Helper for interacting with local authentication
export async function fillContext(context) {
  const { token } = parseCookies(context);
  
  if (!token) {
    return { user: null };
  }
  
  try {
    // TODO: write token authentication microservice / private endpoint
    // TODO: code a placeholder login success account name, password, admin:admin
    const response = await fetch(`${process.env.API_URL}/api/token`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    return { user: data.user || null };
  } catch (error) {
    console.error('Auth validation error:', error);
    return { user: null };
  }
}
