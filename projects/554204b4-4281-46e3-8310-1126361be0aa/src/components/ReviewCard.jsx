import React from 'react';

const ReviewCard = ({ review, index }) => {
  // Render terracotta stars based on rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg 
        key={i} 
        className={`w-5 h-5 ${i < rating ? 'text-terracotta' : 'text-beige-300'}`} 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className={`
      min-w-[300px] md:min-w-[400px] snap-center
      bg-white p-8 md:p-12 shadow-sm relative group
      transition-all duration-500 hover:shadow-xl hover:-translate-y-2
      ${index % 2 !== 0 ? 'mt-8 md:mt-16' : ''}
    `}>
      {/* Quote Mark Decoration */}
      <span className="absolute top-4 right-6 text-7xl font-serif text-beige-300 opacity-50 group-hover:text-terracotta transition-colors duration-500">
        "
      </span>

      <div className="flex gap-1 mb-6">
        {renderStars(review.rating)}
      </div>

      <p className="font-serif text-forest-800 text-lg md:text-xl italic leading-relaxed mb-8 relative z-10">
        {review.text}
      </p>

      <div className="flex items-center gap-4 mt-auto">
        <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center overflow-hidden shrink-0">
          <span className="font-sans text-forest-600 font-medium text-sm">
            {review.name.charAt(0)}
          </span>
        </div>
        <div>
          <h4 className="font-sans font-medium text-forest-900 text-sm tracking-wide">
            {review.name}
          </h4>
          <span className="font-sans text-forest-400 text-xs block mt-1">
            {review.date}
          </span>
        </div>
      </div>
      
      {/* Decorative Bottom Border */}
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-terracotta group-hover:w-full transition-all duration-500 ease-out"></div>
    </div>
  );
};

export default ReviewCard;