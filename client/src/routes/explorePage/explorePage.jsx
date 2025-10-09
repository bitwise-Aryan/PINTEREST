// In src/pages/explorePage/ExplorePage.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiRequest from '../../utils/apiRequest';
import GalleryItem from '../../components/galleryitem/Galleryitems'; // Re-use your GalleryItem
import Skeleton from '../../components/skeleton/skeleton'; // Re-use your Skeleton
import useAuthStore from '../../utils/authStore';
import '../../components/gallery/gallery.css';
import './ExplorePage.css';

const ExplorePage = () => {
  const { currentUser } = useAuthStore();
  // Query 1: Fetch popular tags
  // const { data: popularTags, isLoading: tagsLoading } = useQuery({
  //   queryKey: ['popularTags'],
  //   queryFn: () => apiRequest.get('/pins/tags/popular').then(res => res.data),
  // });


  // This query is now dynamic:
  // - If a user is logged in, it fetches their personal "related" tags.
  // - If no user is logged in, it falls back to "popular" tags.

  const { data: interestTags, isLoading: tagsLoading } = useQuery({
    queryKey: currentUser ? ['relatedTags', currentUser._id] : ['popularTags'],
    queryFn: () => {
      const url = currentUser ? '/pins/related-tags' : '/pins/tags/popular';
      return apiRequest.get(url).then(res => res.data);
    },
  });

  // Query 2: Fetch trending pins
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trendingPins'],
    queryFn: () => apiRequest.get('/pins/trending').then(res => res.data),
  });

  return (
    <div className="explorePage">
      <div className="artBanner">
        <div className="bannerContent">
          <h2>Explore Art</h2>
          <p>Art has the power to move you. Discover new artists and inspire your next project.</p>
          <button>Explore</button>
        </div>
      </div>

      <div className="relatedInterests">
        <h3>{currentUser ? "Related Interests" : "Popular Topics"}</h3>
        <div className="tagList">
          {tagsLoading ? (
            <p>Loading tags...</p>
          ) : (
            interestTags?.map((tag, index) => (
              <Link to={`/search?search=${tag}`} key={index} className="tagItem">
                {tag}
              </Link>
            ))
          )}
        </div>
      </div>
      <div className="trendingPins">
        <h3>Trending Pins</h3>
        {trendingLoading ? (
          <Skeleton />
        ) : (
          <div className="gallery">
            {trendingData?.pins?.map(item => (
              <GalleryItem key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;