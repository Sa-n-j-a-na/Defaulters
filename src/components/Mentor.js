import React from 'react';
import { useLocation } from 'react-router-dom';

function Mentor() {
  const location = useLocation();
  const { username } = location.state;

  return (
    <div>
      <h1>Welcome, {username} (MENTOR)</h1>
    </div>
  );
}

export default Mentor;
