import React, { useState, useEffect } from 'react';
import './comp.css';
import axios from 'axios';

function Pt() {
  const [isDefaultersExpanded, setIsDefaultersExpanded] = useState(false);
  const [currentView, setCurrentView] = useState('');
  const [mentors, setMentors] = useState([]);
  const [studentData, setStudentData] = useState({
    studentName: '',
    academicYear: '',
    semester: '',
    year: '',
    department: ''
  });
  const [rollNumber, setRollNumber] = useState('');
  const [timeIn, setTimeIn] = useState('');
  const [observation, setObservation] = useState('');
  const [selectedMentor, setSelectedMentor] = useState('');
  const [customMentorName, setCustomMentorName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [defaulterType, setDefaulterType] = useState('');

  const toggleDefaulters = () => {
    setIsDefaultersExpanded(!isDefaultersExpanded);
  };

  const handleMenuClick = (view) => {
    setCurrentView(view);
  };

  const fetchStudentData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/student?rollNumber=${rollNumber}`);
      const data = response.data[0];
      console.log("Student Data:", data);
      if (data) {
        setStudentData({
          studentName: data.studentName,
          academicYear: data.academicYear,
          semester: data.semester,
          year: data.year,
          department: data.dept
        });
        fetchMentorData(rollNumber); // Fetch mentor data after student data
      } else {
        console.log('Student not found');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const fetchMentorData = async (rollNumber) => {
    try {
      const response = await axios.get(`http://localhost:5000/mentor?rollNumber=${rollNumber}`);
      const data = response.data;
      console.log("Mentor Data:", data);
      if (data) {
        setSelectedMentor(data.mentorName);
      } else {
        console.log('Mentor not found');
      }
    } catch (error) {
      console.error('Error fetching mentor data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      academicYear: studentData.academicYear,
      semester: studentData.semester,
      department: studentData.department,
      year: studentData.year,
      rollNumber,
      studentName: studentData.studentName,
      entryDate: new Date().toISOString(),
      mentor: selectedMentor,
    };

    if (currentView === 'latecomers') {
      formData.timeIn = timeIn;
    } else if (currentView === 'dresscode') {
      formData.observation = observation;
    }

    try {
      const response = await axios.post(`http://localhost:5000/${currentView}`, formData);
      if (response.status === 200) {
        alert('Form submitted successfully');
        resetForm();
      } else {
        alert('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form');
    }
  };

  const resetForm = () => {
    setRollNumber('');
    setStudentData({
      studentName: '',
      academicYear: '',
      semester: '',
      year: '',
      department: ''
    });
    setTimeIn('');
    setObservation('');
    setSelectedMentor('');
    setCustomMentorName('');
    setFromDate('');
    setToDate('');
    setDefaulterType('');
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    console.log('Generating report:', defaulterType, fromDate, toDate);
    // Implement report generation logic here
  };

  useEffect(() => {
    if (rollNumber) {
      fetchStudentData();
    }
  }, [rollNumber]);

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
          <a href="/pt">Home</a>
          <div className="defaultersEntry">
            <a href="#" onClick={toggleDefaulters}>
              Defaulters Entry <span>{isDefaultersExpanded ? '▲' : '▼'}</span>
            </a>
            {isDefaultersExpanded && (
              <ul>
                <li><a href="#discipline" onClick={() => handleMenuClick('dresscode')}>Dresscode and discipline</a></li>
                <li><a href="#latecomers" onClick={() => handleMenuClick('latecomers')}>Latecomers</a></li>
              </ul>
            )}
          </div>
          <a href="#generateReport" onClick={() => setCurrentView('generateReport')}>Generate Report</a>
        </div>
        <div className="mainContent">
          {currentView === '' && (
            <div className="welcome">
              Welcome to the Department of Physical Education 
            </div>
          )}
          {(currentView === 'dresscode' || currentView === 'latecomers') && (
            <div className="welcomeform">
              <h2>Welcome to the Department of Physical Education</h2>
              <form className="formContainer outlinedForm" onSubmit={handleSubmit}>
                <div className='borderContainer'>
                  <div className="formGroup">
                    <label htmlFor="academicYear">Academic Year:</label>
                    <input type="text" id="academicYear" name="academicYear" value={studentData.academicYear} readOnly />
                  </div>
                  <div className="formGroup">
                    <label htmlFor="semester">Semester:</label>
                    <input type="text" id="semester" name="semester" value={studentData.semester} readOnly />
                  </div>
                  <div className="formGroup">
                    <label htmlFor="department">Department:</label>
                    <input type="text" id="department" name="department" value={studentData.department} readOnly />
                  </div>
                  <div className="formGroup">
                    <label htmlFor="year">Year:</label>
                    <input type="text" id="year" name="year" value={studentData.year} readOnly />
                  </div>
                  <div className="formGroup">
                    <label htmlFor="rollNumber">Roll Number:</label>
                    <input type="text" id="rollNumber" name="rollNumber" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required />
                  </div>
                  <div className="formGroup">
                    <label htmlFor="studentName">Student Name:</label>
                    <input type="text" id="studentName" name="studentName" value={studentData.studentName} readOnly />
                  </div>
                  <div className="formGroup">
                    <label htmlFor="entryDate">Entry Date:</label>
                    <input type="date" id="entryDate" name="entryDate" value={new Date().toISOString().substr(0, 10)} readOnly />
                  </div>
                  {currentView === 'latecomers' && (
                    <div className="formGroup">
                      <label htmlFor="timeIn">Time In:</label>
                      <input type="time" id="timeIn" name="timeIn" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} required />
                    </div>
                  )}
                  {currentView === 'dresscode' && (
                    <div className="formGroup">
                      <label htmlFor="observation">Observation:</label>
                      <textarea id="observation" name="observation" value={observation} onChange={(e) => setObservation(e.target.value)} required></textarea>
                    </div>
                  )}
                  <div className="formGroup">
                    <label htmlFor="mentor">Mentor:</label>
                    <input type="text" id="mentor" name="mentor" value={selectedMentor} readOnly />
                  </div>
                  <button type="submit" className="com-login-buttons">Submit</button>
                </div>
              </form>
            </div>
          )}
          {currentView === 'generateReport' && (
            <form className="generateReportForm outlinedForm" onSubmit={handleGenerateReport}>
              <h2>Generate Report</h2>
              <div className='borderContainer'>
                <div className="formGroup">
                  <label htmlFor="defaulterType">Defaulter Type:</label>
                  <select id="defaulterType" name="defaulterType" value={defaulterType} onChange={(e) => setDefaulterType(e.target.value)} required>
                    <option value="">Select Defaulter Type</option>
                    <option value="both">Both</option>
                    <option value="latecomers">Latecomers</option>
                    <option value="dresscode">Dresscode and Discipline</option>
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
                <button type="submit" className="com-login-buttons">Generate Report</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Pt;
