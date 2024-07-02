import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './comp.css';

function Pt() {
  const location = useLocation();
 

  const [isDefaultersExpanded, setIsDefaultersExpanded] = useState(false);
  const [currentView, setCurrentView] = useState('');
  const [mentors, setMentors] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [formLabel, setFormLabel] = useState('Observation');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const toggleDefaulters = () => {
    setIsDefaultersExpanded(!isDefaultersExpanded);
  };

  const handleMenuClick = (view) => {
    setCurrentView(view);
    if (view === 'latecomers') {
      setFormLabel('Time In');
    } else {
      setFormLabel('Observation');
    }
  };

  const handleRollNumberChange = async (e) => {
    const rollNumber = e.target.value;
    const fetchedStudentName = await fetchStudentNameFromDatabase(rollNumber);
    setStudentName(fetchedStudentName);
  };

  const fetchMentors = async (department, year) => {
    try {
      const response = await fetch(`http://localhost:5000/mentors?dept=${department}&year=${year}`);
      const data = await response.json();
      setMentors(data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  useEffect(() => {
    if (selectedDepartment && selectedYear) {
      fetchMentors(selectedDepartment, selectedYear);
    }
  }, [selectedDepartment, selectedYear]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      academicYear: e.target.academicYear.value,
      semester: e.target.semester.value,
      department: e.target.department.value,
      mentor: e.target.mentor.value,
      year: e.target.year.value,
      rollNumber: e.target.rollNumber.value,
      studentName,
      [formLabel.toLowerCase()]: e.target[formLabel.toLowerCase()].value,
    });
    // Reset form fields or perform other actions as needed
  };

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
          <a href="/pt">Home</a>
          <div className="defaultersEntry">
            <a href="#" onClick={toggleDefaulters}>
              Defaulters Entry <span>{isDefaultersExpanded ? '▲' : '▼'}</span>
            </a>
            {isDefaultersExpanded && (
              <ul>
                <li><a href="#" onClick={() => handleMenuClick('dresscode')}>Dresscode and discipline</a></li>
                <li><a href="#" onClick={() => handleMenuClick('latecomers')}>Latecomers</a></li>
              </ul>
            )}
          </div>
          <a href="/attendance">Generate Report</a>
        </div>
        <div className="mainContent">
          {currentView === '' && (
            <div className="welcome">
              Welcome PE Department
            </div>
          )}
          {(currentView === 'dresscode' || currentView === 'latecomers') && (
            <form className="formContainer" onSubmit={handleSubmit}>
              <div className="formGroup">
                <label htmlFor="academicYear">Academic Year:</label>
                <select id="academicYear" name="academicYear">
                  <option value="2024-2028">2024-2028</option>
                  <option value="2023-2027">2023-2027</option>
                  <option value="2022-2026">2022-2026</option>
                  <option value="2021-2025">2021-2025</option>
                </select>
              </div>
              <div className="formGroup">
                <label htmlFor="semester">Semester:</label>
                <select id="semester" name="semester">
                  <option value="Odd">Odd</option>
                  <option value="Even">Even</option>
                </select>
              </div>
              <div className="formGroup">
                <label htmlFor="department">Department:</label>
                <select id="department" name="department" onChange={(e) => setSelectedDepartment(e.target.value)}>
                  <option value="">Select Department</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="IT">IT</option>
                  <option value="AIDS">AIDS</option>
                  <option value="Civil">Civil</option>
                  <option value="Mech">Mech</option>
                </select>
              </div>
              <div className="formGroup">
                <label htmlFor="year">Year:</label>
                <select id="year" name="year" onChange={(e) => setSelectedYear(e.target.value)}>
                  <option value="">Select Year</option>
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>
              </div>
              <div className="formGroup">
                <label htmlFor="mentor">Mentor:</label>
                <select id="mentor" name="mentor">
                  {mentors.map((mentor) => (
                    <option key={mentor._id} value={mentor.name}>{mentor.name}</option>
                  ))}
                </select>
              </div>
              {currentView === 'dresscode' && (
                <div className="formGroup">
                  <label htmlFor={formLabel.toLowerCase()}>{formLabel}:</label>
                  <input type="text" id={formLabel.toLowerCase()} name={formLabel.toLowerCase()} />
                </div>
              )}
              {currentView === 'latecomers' && (
                <div className="formGroup">
                  <label htmlFor={formLabel.toLowerCase()}>{formLabel}:</label>
                  <input type="text" id={formLabel.toLowerCase()} name={formLabel.toLowerCase()} />
                </div>
              )}
              <div className="formGroup">
                <label htmlFor="rollNumber">Roll Number:</label>
                <input type="text" id="rollNumber" name="rollNumber" onChange={handleRollNumberChange} />
              </div>
              <div className="formGroup">
                <label htmlFor="studentName">Student Name:</label>
                <input type="text" id="studentName" name="studentName" value={studentName} readOnly />
              </div>
              <div className="com-login-buttons">
                <button type="button">Add</button>
                <button type="submit">Submit</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

async function fetchStudentNameFromDatabase(rollNumber) {
  // Replace with actual database call
  // For now, return a placeholder name based on roll number
  const mockDatabase = {
    '123': 'John Doe',
    '456': 'Jane Smith',
    '789': 'Alice Johnson',
  };
  return mockDatabase[rollNumber] || 'Unknown Student';
}

export default Pt;
