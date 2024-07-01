import React from 'react';
import { useLocation } from 'react-router-dom';
import './pt.css';
import vcetLogo from '../vcetLogo.jpg'; // Adjust the path if the logo is in a different directory

function Pt() {
  const location = useLocation();
  const { username } = location.state || { username: 'PT User' };

  return (
    <div className="container">
      <div className="header">
        <img src={vcetLogo} alt="VCET Logo" />
        <h1>VELAMMAL COLLEGE OF ENGINEERING AND TECHNOLOGY</h1>
        <a href="/">Sign Out</a>
      </div>
      <div className="menu">
        <a href="/attendance">Defaulter Report</a>
     
      </div>
      <div className="welcome">
        Welcome "{username}" of PT Department
      </div>
      <div className="no-attendance">
        No attendance details found on {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}

export default Pt;