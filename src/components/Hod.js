import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './comp.css';

function Hod() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dept: initialDept } = location.state || {};
  
  const [dept, setDept] = useState('Department');
  const [currentView, setCurrentView] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [defaulterType, setDefaulterType] = useState('');

  useEffect(() => {
    if (initialDept) {
      setDept(initialDept);
    }
  }, [initialDept]);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    navigate(`/report/${defaulterType}?fromDate=${fromDate}&toDate=${toDate}`, {
      state: { dept }
    });
    console.log('Generating report from', fromDate, 'to', toDate);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="compContainer">
      <div className="compHeader">
        <img src="image.png" alt="VCET Logo" />
        <h1>VELAMMAL COLLEGE OF ENGINEERING AND TECHNOLOGY <br /><span>(Autonomous)</span></h1>
        <a href="/">Sign Out</a>
      </div>
      <div className="contentWrapper">
        <div className="sidebar">
          <h2>Menus</h2>
          <a href="/hod">Home</a>
          <a href="#generateReport" onClick={() => handleViewChange('generateReport')}>Generate Report</a>
        </div>
        <div className="mainContent">
          <div className="welcome">
            Welcome to the Department of {dept}
          </div>

          {currentView === 'generateReport' && (
            <div className="welcomeform">
              <form className="formContainer outlinedForm" onSubmit={handleGenerateReport}>
                <div className="borderContainer">
                  <div className="formGroup">
                    <label>Defaulters type:</label>
                    <select value={defaulterType} onChange={(e) => setDefaulterType(e.target.value)} required>
                      <option value="">--Select--</option>
                      <option value="dresscode">Dresscode and Discipline</option>
                      <option value="latecomers">Latecomers</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div className="formGroup">
                    <label htmlFor="fromDate">From Date:</label>
                    <input type="date" id="fromDate" name="fromDate" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
                  </div>
                  <div className="formGroup">
                    <label htmlFor="toDate">To Date:</label>
                    <input type="date" id="toDate" name="toDate" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
                  </div>
                </div>
                <div className="formGroup buttonGroup com-login-buttons">
                  <button type="submit">Generate Report</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Hod;
