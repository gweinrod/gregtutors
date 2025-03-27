import React from 'react';

//About section of promotional material
const About = () => {
  return (
    <section id="about" className="about">
      <h2>{process.env.NEXT_PUBLIC_ABOUT || ""}</h2>
      <p>{process.env.NEXT_PUBLIC_ABOUT_TEXT || ""}</p>
    </section>
  );
};

export default About;
