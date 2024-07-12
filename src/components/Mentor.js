import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './comp.css';
import ReportDisplayForMentor from './ReportDisplayForMentor';

function Mentor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dept: initialDept } = location.state || {};
  const { mentorName: initialMentorName } = location.state || {};

  const [dept, setDept] = useState(() => localStorage.getItem('dept') || 'Department');
  const [mentorName, setMentorName] = useState(() => localStorage.getItem('mentorName') || 'mentor');
  const [defaulterType, setDefaulterType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentView, setCurrentView] = useState('');

  useEffect(() => {
    if (initialDept) {
      setDept(initialDept);
      localStorage.setItem('dept', initialDept);
    }
    if (initialMentorName) {
      setMentorName(initialMentorName);
      localStorage.setItem('mentorName', initialMentorName);
    }
    const storedMentorName = localStorage.getItem('mentorName');
    setMentorName(storedMentorName);
  }, [initialDept]);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    navigate(`/mentorReport/${mentorName}/${defaulterType}/${fromDate}/${toDate}`);
  };

  const handleRepeatedDefaultersSubmit = (e) => {
    e.preventDefault();
    navigate(`/mentorRepeatedDefaulters/${mentorName}/${defaulterType}/${fromDate}/${toDate}`);
  };

  return (
    <div className="compContainer">
      <div className="compHeader">
        <img src="image.png" alt="VCET Logo" />
        <h1>VELAMMAL COLLEGE OF ENGINEERING AND TECHNOLOGY <br /><span>(Autonomous)</span></h1>
        <a href="/" onClick={() => { localStorage.removeItem('dept'); localStorage.removeItem('mentorName'); }}>Sign Out</a>
      </div>
      <div className="contentWrapper">
        <div className="sidebar">
          <h2>Menus</h2>
          <a href="/mentor">Home</a>
          <a href="#generateReport" onClick={() => setCurrentView('generateReport')}>Generate Report</a>
          <a href="#repeatedDefaulters" onClick={() => setCurrentView('repeatedDefaulters')}>Repeated Defaulters</a>
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
          {currentView === 'repeatedDefaulters' && (
            <div className="welcomeform">
              <form className="formContainer outlinedForm" onSubmit={handleRepeatedDefaultersSubmit}>
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
                  <button type="submit">View Repeated Defaulters</button>
                </div>
              </form>
            </div>
          )}
          {currentView === 'report' && (
            <ReportDisplayForMentor mentorName={mentorName} defaulterType={defaulterType} fromDate={fromDate} toDate={toDate} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Mentor;
