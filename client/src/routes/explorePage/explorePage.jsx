// src/routes/explorePage/explorePage.jsx
import React from 'react';
import ExploreCard from '../../components/ExploreCard/ExploreCard'; // Adjust path if needed
import './explorePage.css'; // New styles for the page

// Mock data for the related interests section
const relatedInterests = [
  { title: "Aesthetic Art", imagePath: "/images/aesthetic_art.jpg" },
  { title: "Funky Art", imagePath: "/images/funky_art.jpg" },
  { title: "Weird Art", imagePath: "/images/weird_art.jpg" },
  { title: "Art Inspo", imagePath: "/images/art_inspo.jpg" },
  { title: "Art Styles", imagePath: "/images/art_styles.jpg" },
];

const ExplorePage = () => {
  return (
    <div className="explore-page">
      {/* 1. Main Banner Section */}
      <div className="explore-banner">
        <div className="banner-image-container">
          {/* Use the Image component from your project or a standard img tag */}
          <img 
            src="/images/art_category_banner.jpg" 
            alt="Art Category Banner" 
            className="banner-bg-image" 
          />
        </div>
        <div className="banner-content">
          <button className="explore-button">Explore</button>
          <h1>Art</h1>
          <p>
            Art has the power to move you. Pinterest has everything you need to inspire your next
            project and discover new artists.
          </p>
        </div>
      </div>

      {/* 2. Related Interests Section */}
      <div className="related-interests-section">
        <h2>Related interests</h2>
        <div className="interest-cards-container">
          {relatedInterests.map((interest) => (
            <ExploreCard 
              key={interest.title} 
              title={interest.title} 
              imagePath={interest.imagePath} 
            />
          ))}
        </div>
        <button className="see-more-button">See more</button>
      </div>

      {/* Placeholder for the main feed/pin grid below the categories */}
      <div className="main-explore-feed">
        {/* Your PinGrid component or content list goes here */}
        <h3>Trending Pins</h3>
        {/* <PinGrid /> */}
      </div>
    </div>
  );
};

export default ExplorePage;