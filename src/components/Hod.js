import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './comp.css';

function Hod() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dept: initialDept } = location.state || {};
  const [mentorOverview, setMentorOverview] = useState([]); // Define the missing state

  const [dept, setDept] = useState(() => {
    return localStorage.getItem('dept') || 'Department';
  });
  const [currentView, setCurrentView] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [defaulterType, setDefaulterType] = useState('');

  useEffect(() => {
    if (initialDept) {
      setDept(initialDept);
      localStorage.setItem('dept', initialDept);
    }
  }, [initialDept]);
  useEffect(() => {
    if (currentView === 'mentoroverview') {
      fetchMentorOverviewData();
    }
  }, [currentView]);
  const fetchMentorOverviewData = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/mentorOverview?dept=${dept}`);
      const data = await response.json();
      setMentorOverview(data);
    } catch (error) {
      console.error('Error fetching mentor overview data:', error);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/defaulterreport/${defaulterType}/${fromDate}/${toDate}`, { state: { dept } });
  };

  const handleRepeatedDefaultersSubmit = (e) => {
    e.preventDefault();
    navigate(`/hodRepeatedDefaulters/${dept}/${defaulterType}/${fromDate}/${toDate}`, { state: { dept } });
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleSignOut = () => {
    localStorage.removeItem('dept');
    navigate('/');
  };

  return (
    <div className="compContainer">
      <div className="compHeader">
        <img src="image.png" alt="VCET Logo" />
        <h1>VELAMMAL COLLEGE OF ENGINEERING AND TECHNOLOGY <br /><span>(Autonomous)</span></h1>
        <a href="/" onClick={handleSignOut}>Sign Out</a>
      </div>
      <div className="contentWrapper">
        <div className="sidebar">
          <h2>Menus</h2>
          <a href="/hod">Home</a>
          <a href="#generateReport" onClick={() => handleViewChange('generateReport')}>Generate Report</a>
          <a href="#repeatedDefaulters" onClick={() => handleViewChange('repeatedDefaulters')}>Repeated Defaulters</a>
          <a href="#mentoroverview" onClick={() => handleViewChange('mentoroverview')}>Mentor overview</a>
        </div>
        <div className="mainContent">
          <div className="welcome">
            Welcome to the Department of {dept}
          </div>

          {currentView === 'generateReport' && (
            <div className="welcomeform">
              <form className="formContainer outlinedForm" onSubmit={handleSubmit}>
                <div className="borderContainer">
                  <div className="formGroup">
                    <label>Defaulters type:</label>
                    <select value={defaulterType} onChange={(e) => setDefaulterType(e.target.value)} required>
                      <option value="">--Select--</option>
                      <option value="dresscode">Dresscode and Discipline</option>
                      <option value="latecomers">Latecomers</option>
                      <option value="both">                      Dresscode and Discipline and Latecomers
                      </option>
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
                      <option value="both">                      Dresscode and Discipline and Latecomers
                      </option>
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
          {currentView === 'mentoroverview' && (
            <div className="mentorOverviewTable">
              <table>
                <thead>
                  <tr>
                    <th>Mentor Name</th>
                    <th>Total Defaulters</th>
                  </tr>
                </thead>
                <tbody>
                  {mentorOverview.map((mentor) => (
                    <tr key={mentor.name}>
                      <td>{mentor.name}</td>
                      <td>{mentor.totalDefaulters}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Hod;
