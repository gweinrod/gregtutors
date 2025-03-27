import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

//Dynamic rendering for the header, displays login status and user information, applies theme, routes page
const Header = ({ user, openModal, logout, theme, page }) => {
  const router = useRouter();
  
  return (
    <header className={`site-header ${theme}`}>
      <div className="logo">
        <Link href="/" passHref>Greg Tutors</Link>
      </div>
      
      <nav className="main-nav">
        <ul>
          <li>
            <a href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1--meUbXKA2NolTHv1GRyNIC7PzpJhRHrVeJfm5HpptANsZhB6r3mlLPpcKAxB3PfyayMWzmR0" target="_blank" rel="noopener noreferrer">
              Schedule
            </a>
          </li>
          <li>
            <a href="https://docs.google.com/forms/d/1lxRlkC5CUUhBPAGlBGpmEx5Lg_WiHPM4Axlmnae5FNg/" target="_blank" rel="noopener noreferrer">
              Contact
            </a>
          </li>
          
          {/* Only show Classes link if user is logged in */}
          {user && (
            <li>
              <Link href="/classes" passHref className={router.pathname === '/classes' ? 'active' : ''}>Classes</Link>
            </li>
          )}
        </ul>
      </nav>
      
      <div className="auth-controls">
        {user ? (
          <div className="user-controls">
            <span className="welcome">Welcome, {user.name}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        ) : (
          <button onClick={openModal} className="login-btn">Login</button>
        )}
      </div>
    </header>
  );
};

export default Header;
