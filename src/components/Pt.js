import React from 'react';
import { useLocation } from 'react-router-dom';
import './comp.css';

function Pt() {
  const location = useLocation();
  const { username } = location.state || { username: 'PT User' };

  return (
    <div className="compContainer">
      <div className="compHeader">
        <img src="/image.png" alt="VCET Logo" />
        <h1>VELAMMAL COLLEGE OF ENGINEERING AND TECHNOLOGY</h1>
        <a href="/">Sign Out</a>
      </div>
      <div className="contentWrapper">
        <div className="sidebar">
          <h2>Menus</h2>
          <a href="/">Home</a>
          <a href="/attendance">Generate Report</a>
        </div>
        <div className="mainContent">
          <div className="welcome">
            Welcome "{username}" of PT Department
          </div>
          <div className="">
            {/* Additional content can go here */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pt;
