import React, { useState, useEffect } from 'react';
import './comp.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Assuming you are using React Router

function Pt() {
  const [isDefaultersExpanded, setIsDefaultersExpanded] = useState(false);
  const [currentView, setCurrentView] = useState('');
  const [mentors, setMentors] = useState([]);
  const navigate = useNavigate(); 
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
      const formattedRollNumber = rollNumber.toUpperCase();
      const response = await axios.get(`http://localhost:5000/student?rollNumber=${formattedRollNumber}`);
      const data = response.data[0];
      if (data) {
        setStudentData({
          studentName: data.studentName,
          academicYear: data.academicYear,
          semester: data.semester,
          year: data.year,
          department: data.dept
        });
        fetchMentorData(rollNumber); // Fetch mentor data after student data
      }  else {
        // Clear fields and show error if student is not found
        setStudentData({
          studentName: '',
          academicYear: '',
          semester: '',
          year: '',
          department: ''
        });
        setSelectedMentor('');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const fetchMentorData = async (rollNumber) => {
    try {
      const formattedRollNumber = rollNumber.toUpperCase();
      const response = await axios.get(`http://localhost:5000/mentor?rollNumber=${formattedRollNumber}`);
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
    const formattedRollNumber = rollNumber.toUpperCase(); // Use the state variable rollNumber
    const currentDate = new Date().toISOString();
    // Check for existing entry
    try {
      const checkResponse = await axios.get(`http://localhost:5000/checkEntry`, {
        params: {
          rollNumber: formattedRollNumber, // Use the formatted roll number
          entryDate: currentDate,
          defaulterType: currentView
        }
      });
  
      console.log('Check Entry Response:', checkResponse.data); // Log the response from the checkEntry endpoint
  
      if (checkResponse.data.exists) {
        alert('An entry for this roll number already exists for today.');
        return;
      }
  
      const formData = {
        academicYear: studentData.academicYear,
        semester: studentData.semester,
        department: studentData.department,
        year: studentData.year,
        rollNumber: formattedRollNumber, // Use the formatted roll number
        studentName: studentData.studentName,
        entryDate: currentDate,
        mentorName: selectedMentor,
      };
  
      if (currentView === 'latecomers') {
        formData.timeIn = timeIn;
      } else if (currentView === 'dresscode') {
        formData.observation = observation;
      }
  
      const response = await axios.post(`http://localhost:5000/${currentView}`, formData);
      console.log('Submit Response:', response); // Log the response from the submit endpoint
  
      if (response.status === 200) {
        alert('Form submitted successfully');
        resetForm();
      } else {
        alert('Failed to submit form: ' + response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit form: ' + error.message);
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
    navigate(`/report/${defaulterType}/${fromDate}/${toDate}`);
    console.log('Velammal College of Engineering and Technology (Autonomous)');
    console.log('Generating report from', fromDate, 'to', toDate);
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
                    <label htmlFor="rollNumber">Roll Number:</label>
                    <input type="text" id="rollNumber" name="rollNumber" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required />
                  </div>
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
                      <input type="text" id="observation" name="observation" value={observation} onChange={(e) => setObservation(e.target.value)} required />                    </div>
                  )}
                  <div className="formGroup">
                    <label htmlFor="mentor">Mentor:</label>
                    <input type="text" id="mentor" name="mentor" value={selectedMentor} readOnly />
                  </div>
                  
                </div>
                <div className="formGroup buttonGroup com-login-buttons">
                <button type="submit">Submit</button></div>
              </form>
            </div>
          )}
         {currentView === 'generateReport' && (
            <div className="welcomeform">
              <h2>Welcome to the Department of Physical Education</h2> 
              <form className="formContainer outlinedForm" onSubmit={handleGenerateReport}>
                <div className="borderContainer">
                  <div className="formGroup">
                    <label>Defaulters type:</label>
                    <select value={defaulterType} onChange={(e) => setDefaulterType(e.target.value)} required>
                      <option value="">--Select--</option>
                      <option value="dresscode">Dresscode and Discipline</option>
                      <option value="latecomers">Latecomers</option>
                      <option value="both">Dresscode and Discipline and Latecomers
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
        </div>
      </div>
    </div>
  );
}

export default Pt;
