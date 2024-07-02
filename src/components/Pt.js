import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './comp.css';

function Pt() {
  const location = useLocation();
  const { username } = location.state || { username: 'PT User' };

  const [isDefaultersExpanded, setIsDefaultersExpanded] = useState(false);
  const [currentView, setCurrentView] = useState('');
  const [mentors, setMentors] = useState([]);
  const [studentName, setStudentName] = useState('');
<<<<<<< HEAD
  const [formLabel, setFormLabel] = useState('Observation'); // Default label
=======
>>>>>>> 825cb5a179fb9239b0ba15df628166e482b4d2a8

  const toggleDefaulters = () => {
    setIsDefaultersExpanded(!isDefaultersExpanded);
  };

  const handleMenuClick = (view) => {
    setCurrentView(view);
<<<<<<< HEAD
    if (view === 'latecomers') {
      setFormLabel('Time In'); // Change label to Time In for latecomers
    } else {
      setFormLabel('Observation'); // Default to Observation for dresscode and discipline
    }
=======
>>>>>>> 825cb5a179fb9239b0ba15df628166e482b4d2a8
  };

  const handleRollNumberChange = async (e) => {
    const rollNumber = e.target.value;
    // Fetch the student name based on roll number from the database
    // This is a placeholder, replace with actual database call
    const fetchedStudentName = await fetchStudentNameFromDatabase(rollNumber);
    setStudentName(fetchedStudentName);
  };

  const fetchMentors = async () => {
    // Fetch mentors from the database
    // This is a placeholder, replace with actual database call
    const fetchedMentors = await fetchMentorsFromDatabase();
    setMentors(fetchedMentors);
  };

  useEffect(() => {
    fetchMentors();
  }, []);

<<<<<<< HEAD
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
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

=======
>>>>>>> 825cb5a179fb9239b0ba15df628166e482b4d2a8
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
<<<<<<< HEAD
          {currentView === '' && (
            <div className="welcome">
              Welcome "{username}" of PT Department
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
                <select id="department" name="department">
                  <option value="cse">CSE</option>
                  <option value="ece">ECE</option>
                  <option value="eee">EEE</option>
                  <option value="it">IT</option>
                  <option value="aids">AIDS</option>
                  <option value="civil">Civil</option>
                  <option value="mech">Mech</option>
                </select>
              </div>
              <div className="formGroup">
                <label htmlFor="mentor">Mentor:</label>
                <select id="mentor" name="mentor">
                  {mentors.map((mentor) => (
                    <option key={mentor.id} value={mentor.name}>{mentor.name}</option>
                  ))}
                </select>
              </div>
              <div className="formGroup">
                <label htmlFor="year">Year:</label>
                <select id="year" name="year">
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
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
              <div className="login-buttons">
                <button type="button">Add</button>
                <button type="submit">Submit</button>
              </div>
            </form>
          )}
=======
          <div className="welcome">
            Welcome "{username}" of PT Department
          </div>
          <div>
            {currentView === 'dresscode' && (
              <form>
                <div>
                  <label htmlFor="academicYear">Academic Year:</label>
                  <select id="academicYear" name="academicYear">
                    <option value="2024-2028">2024-2028</option>
                    <option value="2023-2027">2023-2027</option>
                    <option value="2022-2026">2022-2026</option>
                    <option value="2021-2025">2021-2025</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="semester">Semester:</label>
                  <select id="semester" name="semester">
                    <option value="Odd">Odd</option>
                    <option value="Even">Even</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="department">Department:</label>
                  <select id="department" name="department">
                    <option value="cse">CSE</option>
                    <option value="ece">ECE</option>
                    <option value="eee">EEE</option>
                    <option value="it">IT</option>
                    <option value="aids">AIDS</option>
                    <option value="civil">Civil</option>
                    <option value="mech">Mech</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="mentor">Mentor:</label>
                  <select id="mentor" name="mentor">
                    {mentors.map((mentor) => (
                      <option key={mentor.id} value={mentor.name}>{mentor.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="year">Year:</label>
                  <select id="year" name="year">
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="role">Role:</label>
                  <input type="text" id="role" name="role" />
                </div>
                <div>
                  <label htmlFor="rollNumber">Roll Number:</label>
                  <input type="text" id="rollNumber" name="rollNumber" onChange={handleRollNumberChange} />
                </div>
                <div>
                  <label htmlFor="studentName">Student Name:</label>
                  <input type="text" id="studentName" name="studentName" value={studentName} readOnly />
                </div>
                <div>
                  <label htmlFor="observation">Observation:</label>
                  <input type="text" id="observation" name="observation" />
                </div>
                <button type="submit">Add</button>
                <button type="submit">Submit</button>
              </form>
            )}
          </div>
>>>>>>> 825cb5a179fb9239b0ba15df628166e482b4d2a8
        </div>
      </div>
    </div>
  );
}

// Placeholder function for fetching student name based on roll number
async function fetchStudentNameFromDatabase(rollNumber) {
  // Replace with actual database call
  return 'John Doe';
}

// Placeholder function for fetching mentors from the database
async function fetchMentorsFromDatabase() {
  // Replace with actual database call
  return [
    { id: 1, name: 'Mentor 1' },
    { id: 2, name: 'Mentor 2' },
    { id: 3, name: 'Mentor 3' },
  ];
}

export default Pt;

