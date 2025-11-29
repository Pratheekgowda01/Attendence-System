import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <div className="loading-text">
        {message}<span className="loading-dots"></span>
      </div>
    </div>
  );
};

export default LoadingSpinner;

