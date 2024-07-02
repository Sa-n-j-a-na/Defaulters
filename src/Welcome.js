import React from 'react';
import { useLocation } from 'react-router-dom';

function Welcome() {
  const location = useLocation();
  const { role, username } = location.state || {};

  return (
    <div className="welcome-container">
      <h2>Welcome, {username}!</h2>
      <p>You are logged in as {role.toUpperCase()}.</p>
    </div>
  );
}

export default Welcome;

