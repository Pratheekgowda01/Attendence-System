import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium' }) => {
  return (
    <div className={`logo logo-${size}`}>
      <div className="logo-container">
        {/* Checkmark Circle */}
        <div className="logo-checkmark-circle">
          <div className="checkmark-circle">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M8 12 L11 15 L16 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        {/* Three People */}
        <div className="logo-people">
          {/* Left Person */}
          <div className="person person-left">
            <div className="person-head"></div>
            <div className="person-body"></div>
          </div>
          
          {/* Center Person (larger, in front) */}
          <div className="person person-center">
            <div className="person-head"></div>
            <div className="person-body"></div>
          </div>
          
          {/* Right Person */}
          <div className="person person-right">
            <div className="person-head"></div>
            <div className="person-body"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logo;

