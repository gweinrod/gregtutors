import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="copyright">
        © {currentYear} {process.env.NEXT_PUBLIC_SITE_TITLE || ""} - All Rights Reserved
      </div>
      <div className="contact">
        Greg - <a href="https://docs.google.com/forms/d/1lxRlkC5CUUhBPAGlBGpmEx5Lg_WiHPM4Axlmnae5FNg">Contact me</a>
      </div>
    </footer>
  );
};

export default Footer;
