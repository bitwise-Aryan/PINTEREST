// src/components/ExploreCard/ExploreCard.jsx
import React from 'react';
import './ExploreCard.css'; // New styles for the card

const ExploreCard = ({ title, imagePath }) => {
  return (
    <div className="explore-card">
      {/* Use Imagekit (IKContext) if available, otherwise standard img */}
      <img src={imagePath} alt={title} className="explore-card-image" />
      <span className="explore-card-title">{title}</span>
    </div>
  );
};

export default ExploreCard;