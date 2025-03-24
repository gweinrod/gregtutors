import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

//Dynamic rendering for the header, displays login status and user information, applies theme, routes page
const Header = ({ user, openModal, logout, theme, page }) => {
  const router = useRouter();
  
  return (
    <header className={`site-header ${theme}`}>
      <div className="logo">
        <Link href="/" passHref>
          <a>Greg Tutors</a>
        </Link>
      </div>
      
      <nav className="main-nav">
        <ul>
          <li>
            <Link href="/#about" passHref>
              <a className={router.pathname === '/' ? 'active' : ''}>About</a>
            </Link>
          </li>
          <li>
            <Link href="/#info" passHref>
              <a>Info</a>
            </Link>
          </li>
          <li>
            <Link href="/#reviews" passHref>
              <a>Reviews</a>
            </Link>
          </li>
          <li>
            <a href="https://calendar.google.com/..." target="_blank" rel="noopener noreferrer">
              Schedule
            </a>
          </li>
          <li>
            <a href="https://forms.google.com/..." target="_blank" rel="noopener noreferrer">
              Contact
            </a>
          </li>
          
          {/* Only show Classes link if user is logged in */}
          {user && (
            <li>
              <Link href="/classes" passHref>
                <a className={router.pathname === '/classes' ? 'active' : ''}>Classes</a>
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
