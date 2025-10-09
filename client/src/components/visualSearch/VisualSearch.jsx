// In src/components/visualSearch/VisualSearch.jsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiRequest from '../../utils/apiRequest';
import Gallery from '../gallery/gallery';
import './VisualSearch.css';

// The API function for our mutation
const searchWithImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('media', imageFile);

  const res = await apiRequest.post('/pins/search-by-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

const VisualSearch = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const mutation = useMutation({
    mutationFn: searchWithImage,
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSearch = () => {
    if (file) {
      mutation.mutate(file);
    }
  };

  return (
    <div className="visualSearch">
      <h2>Looking for your next inspiration?</h2>
      <p>Upload an image to find visually similar ideas from our community.</p>
      
      <div className="uploader">
        <label htmlFor="inspiration-upload" className="uploadLabel">
          {preview ? <img src={preview} alt="Preview" className="previewImage" /> : "Click to Upload Image"}
        </label>
        <input id="inspiration-upload" type="file" accept="image/*" onChange={handleFileChange} />
        <button onClick={handleSearch} disabled={!file || mutation.isPending}>
          {mutation.isPending ? "Searching..." : "Find Similar"}
        </button>
      </div>

      {mutation.isSuccess && (
        <div className="resultsSection">
          <h3>Inspiration Found</h3>
          <Gallery pins={mutation.data} />
        </div>
      )}
      {mutation.isError && <p className="error">Could not find results. Please try another image.</p>}
    </div>
  );
};

export default VisualSearch;