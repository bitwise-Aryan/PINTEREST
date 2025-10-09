// In src/routes/similarPinsPage/SimilarPinsPage.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import apiRequest from '../../utils/apiRequest';
import Gallery from '../../components/gallery/gallery';
import Skeleton from '../../components/skeleton/skeleton';
import './SimilarPinsPage.css';
import '../../components/gallery/gallery.css';

const SimilarPinsPage = () => {
  const { id } = useParams(); // Get the original pin's ID from the URL

  const { data: similarPins, isLoading, error } = useQuery({
    queryKey: ['similarPins', id],
    queryFn: () => apiRequest.get(`/pins/${id}/similar`).then(res => res.data),
    enabled: !!id, // Only run the query if the ID exists
  });

  return (
    <div className="similarPinsPage">
      <Link to={`/pin/${id}`} className="backLink">
        &larr; Back to Pin
      </Link>
      <h1>Visually Similar Pins</h1>
      
      {isLoading && <Skeleton />}
      {error && <p className="error-message">Could not find similar pins.</p>}
      
      {similarPins && similarPins.length > 0 && (
        <Gallery pins={similarPins} />
      )}

      {similarPins && similarPins.length === 0 && (
        <p className="info-message">No similar pins found. Try uploading more images to improve results!</p>
      )}
    </div>
  );
};

export default SimilarPinsPage;