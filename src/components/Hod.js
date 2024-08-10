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
  const [mentorName, setMentorName] = useState('');
  const [mentorNames, setMentorNames] = useState([]);
  const [year, setYear] = useState(''); 

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

  useEffect(() => {
    fetchMentorNames();
  }, [dept]); // Add dept as a dependency

  const fetchMentorOverviewData = async () => {
    try {
      console.log('Fetching mentor overview data');
      const response = await fetch(`http://localhost:5000/hod/mentorOverview?dept=${dept}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Data fetched:', data);
      setMentorOverview(data);
    } catch (error) {
      console.error('Error fetching mentor overview data:', error);
    }
  };

  const fetchMentorNames = async () => {
    try {
      const response = await fetch(`http://localhost:5000/mentors?dept=${dept}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(data);
      setMentorNames(data);
    } catch (error) {
      console.error('Error fetching mentor names:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/defaulterreport/${year}/${defaulterType}/${fromDate}/${toDate}`, { state: { dept, year } });
  };

  const handleRepeatedDefaultersSubmit = (e) => {
    e.preventDefault();
    navigate(`/hodRepeatedDefaulters/${dept}/${year}/${defaulterType}/${fromDate}/${toDate}`, { state: { dept } });
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleSignOut = () => {
    localStorage.removeItem('dept');
    navigate('/');
  };
  
  const currentDate = new Date();
  const pastDate = new Date();
  pastDate.setDate(currentDate.getDate() - 7);

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
                    <label htmlFor="fromDate">From Date:</label>
                    <input type="date" id="fromDate" name="fromDate" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
                  </div>
                  <div className="formGroup">
                    <label htmlFor="toDate">To Date:</label>
                    <input type="date" id="toDate" name="toDate" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
                  </div>
                  <div className="formGroup">
                    <label>Year:</label>
                    <select value={year} onChange={(e) => setYear(e.target.value)} required>
                      <option value="">--Select Year--</option>
                      <option value="all">All</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                  </div>
                  
                  <div className="formGroup">
                    <label>Defaulters type:</label>
                    <select value={defaulterType} onChange={(e) => setDefaulterType(e.target.value)} required>
                      <option value="">--Select--</option>
                      <option value="dresscode">Dresscode and Discipline</option>
                      <option value="latecomers">Latecomers</option>
                      <option value="both">Dresscode and Discipline and Latecomers</option>
                    </select>
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
                    <label>Year:</label>
                    <select value={year} onChange={(e) => setYear(e.target.value)} required>
                      <option value="">--Select Year--</option>
                      <option value="all">All</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                  </div>
                  <div className="formGroup">
                    <label>Defaulters type:</label>
                    <select value={defaulterType} onChange={(e) => setDefaulterType(e.target.value)} required>
                      <option value="">--Select--</option>
                      <option value="dresscode">Dresscode and Discipline</option>
                      <option value="latecomers">Latecomers</option>
                      <option value="both">Dresscode and Discipline and Latecomers</option>
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
           <div className="report-displayinhod">
             <div className="table-container">
             <h4>Mentor Overview: Defaulters from {pastDate.toLocaleDateString()} to {currentDate.toLocaleDateString()}</h4>
              <center>
              <table className="defaulters-table">
                  <thead>
                    <tr>
                      <th>Mentor Name</th>
                      <th>Total Defaulters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mentorOverview.map((mentor) => (
                      <tr key={mentor.mentorName}>
                        <td>{mentor.mentorName}</td>
                        <td>{mentor.totalDefaulters}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </center>
            </div></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Hod;
