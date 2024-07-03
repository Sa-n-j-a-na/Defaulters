import React, { useState, useEffect, useRef } from 'react';
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
  const [selectedMentor, setSelectedMentor] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [rollNumber, setRollNumber] = useState(''); // Define rollNumber state
  const [observation, setObservation] = useState(''); // Define observation state
  const [timeIn, setTimeIn] = useState(''); // Define timeIn state

  const toggleDefaulters = () => {
    setIsDefaultersExpanded(!isDefaultersExpanded);
  };

  const handleMenuClick = (view) => {
    setCurrentView(view);
    setFormLabel(view === 'latecomers' ? 'Time In' : 'Observation');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      academicYear: e.target.academicYear.value,
      semester: e.target.semester.value,
      department: e.target.department.value,
      mentor: selectedMentor,
      year: e.target.year.value,
      rollNumber: e.target.rollNumber.value,
      studentName: e.target.studentName.value,
      entryDate: e.target.entryDate.value,
    };

    if (currentView === 'latecomers') {
      formData.time_in = e.target.time_in.value || '';
    } else if (currentView === 'dresscode') {
      formData.observation = e.target.observation.value || '';
    }

    console.log('Form Data:', formData);

    try {
      const response = await fetch(`http://localhost:5000/${currentView}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Form submitted successfully');
        e.target.reset(); // Reset the form
        setStudentName('');
        setSelectedMentor('');
        setRollNumber(''); // Reset rollNumber state
        setObservation(''); // Reset observation state
        setTimeIn('');
        console.log('Form data submitted successfully:', formData);
      } else {
        alert('Failed to submit form');
        console.error('Failed to submit data:', await response.text());
      }
    } catch (error) {
      alert('Error submitting form');
      console.error('Error submitting data:', error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
  
    // Check form validity before submission
    const form = e.target.form;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
  
    // Extract data from form elements
    const formData = {
      academicYear: form.academicYear.value,
      semester: form.semester.value,
      department: form.department.value,
      mentor: selectedMentor,
      year: form.year.value,
      rollNumber: form.rollNumber.value,
      studentName: form.studentName.value,
      entryDate: form.entryDate.value,
    };
  
    let additionalField = '';
    if (currentView === 'latecomers') {
      additionalField = form.time_in.value || '';
      setTimeIn(additionalField); // Update timeIn state
    } else if (currentView === 'dresscode') {
      additionalField = form.observation.value || '';
      setObservation(additionalField); // Update observation state
    }
  
    if (currentView === 'latecomers') {
      formData.time_in = additionalField;
    } else if (currentView === 'dresscode') {
      formData.observation = additionalField;
    }
  
    console.log('Form Data:', formData);
  
    try {
      const response = await fetch(`http://localhost:5000/${currentView}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        alert('Form submitted successfully');
        console.log('Form data submitted successfully:', formData);
  
        // Clear specific fields
        setRollNumber(''); // Reset rollNumber state
        setStudentName('');
        setObservation(''); // Reset observation state
        setTimeIn(''); // Reset timeIn state
      } else {
        alert('Failed to submit form');
        console.error('Failed to submit data:', await response.text());
      }
    } catch (error) {
      alert('Error submitting form');
      console.error('Error submitting data:', error);
    }
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    // Implement the logic to generate a report based on fromDate and toDate
    console.log('Generating report from', fromDate, 'to', toDate);
  };

  return (
    <div className="compContainer">
      <div className="compHeader">
        <img src="/image.png" alt="VCET Logo" />
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
              Welcome PE Department
            </div>
          )}
          {(currentView === 'dresscode' || currentView === 'latecomers') && (
            <form className="formContainer outlinedForm" onSubmit={handleSubmit}>
              <div className='borderContainer'>
              <div className="formGroup">
                <label htmlFor="academicYear">Academic Year:</label>
                <select id="academicYear" name="academicYear" required>
                  <option value="2024-2028">2024-2025</option>
                  <option value="2023-2027">2025-2026</option>
                </select>
              </div>
              <div className="formGroup">
                <label htmlFor="semester">Semester:</label>
                <select id="semester" name="semester" required>
                  <option value="ODD">ODD</option>
                  <option value="EVEN">EVEN</option>
                </select>
              </div>
              <div className="formGroup">
                <label htmlFor="department">Department:</label>
                <select id="department" name="department" onChange={(e) => setSelectedDepartment(e.target.value)} required>
                  <option value="">--Select--</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="IT">IT</option>
                  <option value="AIDS">AIDS</option>
                  <option value="CIVIL">CIVIL</option>
                  <option value="MECH">MECH</option>
                  <option value="CYBERSECURITY">CYBER SECURITY</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>
              <div className="formGroup">
                <label htmlFor="year">Year:</label>
                <select id="year" name="year" onChange={(e) => setSelectedYear(e.target.value)} required>
                  <option value="">--Select--</option>
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>
              </div>
              <div className="formGroup">
                <label htmlFor="mentor">Mentor:</label>
                <select id="mentor" name="mentor" onChange={(e) => setSelectedMentor(e.target.value)} required>
                  <option value="">--Select--</option>
                  {mentors.map((mentor) => (
                    <option key={mentor._id} value={mentor.name}>{mentor.name}</option>
                  ))}
                </select>
              </div>
              <div className="formGroup">
                <label htmlFor="rollNumber">Roll Number:</label>
                <input type="text" id="rollNumber" name="rollNumber" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required />
              </div>
              <div className="formGroup">
                <label htmlFor="studentName">Student Name:</label>
                <input type="text" id="studentName" name="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} required/>
              </div>
              <div className="formGroup">
                <label htmlFor="entryDate">Date:</label>
                <input type="date" id="entryDate" name="entryDate" onChange={(e) => setEntryDate(e.target.value)} required />
              </div>
              {currentView === 'latecomers' && (
                <div className="formGroup">
                  <label htmlFor="time_in">Time In:</label>
                  <input type="time" id="time_in" name="time_in" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} required />
                </div>
              )}
              {currentView === 'dresscode' && (
                <div className="formGroup">
                  <label htmlFor="observation">Observation:</label>
                  <input type="text" id="observation" name="observation" value={observation} onChange={(e) => setObservation(e.target.value)} required />
                </div>
              )}
              </div>
              <div className="formGroup buttonGroup com-login-buttons">
                <button type="submit">Submit</button>
                <button type="button" onClick={handleAdd}>Add</button>
              </div>
            </form>
          )}
          {currentView === 'generateReport' && (
            <form className="formContainer" onSubmit={handleGenerateReport}>
              <div className='borderContainer'>
              <div className="formGroup">
                <label htmlFor="fromDate">From Date:</label>
                <input type="date" id="fromDate" name="fromDate" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
              </div>
              <div className="formGroup">
                <label htmlFor="toDate">To Date:</label>
                <input type="date" id="toDate" name="toDate" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
              </div></div>
              <div className="generate-report-button">
                <button type="submit">Generate Report</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Pt;
