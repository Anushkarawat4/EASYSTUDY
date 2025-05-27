import React from 'react';
import './navbar.css';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="bottom-navbar">
      <div className="wave-shape">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,64L1440,0L1440,100L0,100Z" fill="#b3e5fc" />
        </svg>
      </div>

      <button className="cute-button" onClick={() => navigate('/')}>
        📝 Daily To-Do
      </button>
      <button className="cute-button" onClick={() => navigate('/habits')}>
        📅 21-Day Tracker
      </button>
      <button className="cute-button" onClick={() => navigate('/reminders')}>
        🔔 Monthly Reminders
      </button>
    </div>
  );
}

export default Navbar;
