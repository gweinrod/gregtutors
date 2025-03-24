import React from 'react';

//Informational section of promotional materials (inspiring quotes)
const Info = ({ quotes }) => {
  const defaultQuotes = [
    { text: process.env.QUOTE_1 || "", author: process.env.AUTHOR_1 || "" },
    { text: process.env.QUOTE_2 || "", author: process.env.AUTHOR_2 || "" },
    { text: process.env.QUOTE_3 || "", author: process.env.AUTHOR_3 || "" }
  ];

  return (
    <section id="info" className="info">
      <h2>{process.env.INFO || ""}</h2>
      <p>{process.env.INFO_TEXT || ""}</p>
      
      {quotes && quotes.length > 0 ? (
        quotes.map((quote, index) => (
          <blockquote key={index}>
            "{quote.text}" - {quote.author}
          </blockquote>
        ))
      ) : (
        defaultQuotes.map((quote, index) => (
          <blockquote key={index}>
            "{quote.text}" - {quote.author}
          </blockquote>
        ))
      )}
    </section>
  );
};

export default Info;
