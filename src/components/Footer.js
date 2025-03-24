import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="copyright">
        © {currentYear} {process.env.SITE_TITLE || ""} - All Rights Reserved
      </div>
      <div className="contact">
        Greg - <a href={`mailto:${process.env.CONTACT_EMAIL || ""}`}>Contact me</a>
      </div>
    </footer>
  );
};

export default Footer;
