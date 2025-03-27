import React from 'react';

//Reviews portion of promotional material
const Reviews = ({ reviews }) => {
  const defaultReviews = [
    { quote: process.env.NEXT_PUBLIC_REVIEW_1 || "", client: process.env.NEXT_PUBLIC_REVIEWER_1 || "" },
    { quote: process.env.NEXT_PUBLIC_REVIEW_2 || "", client: process.env.NEXT_PUBLIC_REVIEWER_2 || "" },
    { quote: process.env.NEXT_PUBLIC_REVIEW_3 || "", client: process.env.NEXT_PUBLIC_REVIEWER_3 || "" }
  ];

  return (
    <section id="reviews" className="reviews">
      <h2>Reviews</h2>
      <div className="reviews-list">
        {reviews && reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="review">
              <p className="text">{review.quote}</p>
              <p className="author">- {review.client}</p>
            </div>
          ))
        ) : (
          defaultReviews.map((review, index) => (
            <div key={index} className="review">
              <p className="text">{review.quote}</p>
              <p className="author">- {review.client}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Reviews;
