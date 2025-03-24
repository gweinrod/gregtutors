import React from 'react';

import About from './sections/About';
import Info from './sections/Info';
import Reviews from './sections/Reviews';
import Contact from './sections/Contact';

const Content = ({ reviews, quotes, user, schedule }) => {
  return (
    <main className="content">
      <About />
      <Info quotes={quotes} />
      <Reviews reviews={reviews} />
      <Contact user={user} schedule={schedule} />
    </main>
  );
};

export default Content;
