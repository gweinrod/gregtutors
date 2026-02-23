import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

//Dynamic rendering for the header, displays login status and user information, applies theme, routes page
const Header = ({ user, openModal, logout, theme, page }) => {
  const router = useRouter();
  
  return (
    <header className={`site-header ${theme}`}>
      <div className="logo">
        <Link href="/">
          <img
            src="/logo.png"
            alt="Greg Tutors"
            className="logo-img"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.nextElementSibling;
              if (fallback) fallback.style.display = 'inline';
            }}
          />
          <span className="logo-fallback" style={{ display: 'none' }}>Greg Tutors</span>
        </Link>
      </div>
      
      <nav className="main-nav">
        <ul>
          <li>
            {user ? (
              <a
                href="/schedule"
                className={router.pathname === '/schedule' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/schedule');
                }}
              >
                Schedule
              </a>
            ) : (
              <a href="/#contact" className={router.asPath === '/#contact' ? 'active' : ''}>
                Schedule
              </a>
            )}
          </li>
          <li>
            <Link href="/contact" className={router.pathname === '/contact' ? 'active' : ''}>
              Contact
            </Link>
          </li>
          {user && (
            <li>
              <Link href="/classes" className={router.pathname === '/classes' ? 'active' : ''}>
                Classes
              </Link>
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
