import React from 'react';

//Informational section of promotional materials (inspiring quotes)
const Info = ({ quotes }) => {
  const defaultQuotes = [
    { text: process.env.NEXT_PUBLIC_QUOTE_1 || "", author: process.env.NEXT_PUBLIC_AUTHOR_1 || "" },
    { text: process.env.NEXT_PUBLIC_QUOTE_2 || "", author: process.env.NEXT_PUBLIC_AUTHOR_2 || "" },
    { text: process.env.NEXT_PUBLIC_QUOTE_3 || "", author: process.env.NEXT_PUBLIC_AUTHOR_3 || "" }
  ];

  return (
    <section id="info" className="info">
      <h2>{process.env.NEXT_PUBLIC_INFO || ""}</h2>
      <p>{process.env.NEXT_PUBLIC_INFO_TEXT || ""}</p>
      
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
