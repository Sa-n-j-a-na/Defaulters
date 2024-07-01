import React from 'react';
import { useLocation } from 'react-router-dom';

function Hod() {
  const location = useLocation();
  const { username } = location.state;

  return (
    <div>
      <h1>Welcome, {username} (HOD)</h1>
    </div>
  );
}

export default Hod;
