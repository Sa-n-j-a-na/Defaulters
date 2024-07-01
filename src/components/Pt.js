import React from 'react';
import { useLocation } from 'react-router-dom';
import './comp.css';


function Pt() {
  const location = useLocation();
  const { username } = location.state;

  return (
    <div>
      <h1>Welcome, {username} (PT-SIR)</h1>
    </div>
  );
}

export default Pt;
