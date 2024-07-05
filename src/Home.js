import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('mentor');

  useEffect(() => {
    document.body.classList.add('home-body');
    return () => {
      document.body.classList.remove('home-body');
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password, role: selectedRole });
      if (response && response.data) {
        setMessage(response.data.message);
        if (response.data.message === 'Login successful') {
          if (selectedRole === 'pe') {
            navigate('/pt', { state: { username } });
          } else if (selectedRole === 'hod') {
            navigate('/hod', { state: { username } });
          } else if (selectedRole === 'mentor') {
            navigate('/mentor', { state: { username } });
          }
        }
      } else {
        setMessage('Unexpected error occurred. Please try again.');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Server error. Please try again later.');
      }
    }
  };

  const handleHome = () => {
    // Replace with your home route navigation logic
    alert('Navigate to home page logic goes here');
  };

  return (
    <div>
      <center>
        <h1 className="college-heading">VELAMMAL COLLEGE OF ENGINEERING AND TECHNOLOGY</h1>
        <h3>(AUTONOMOUS)</h3>
      </center>
      <div className="container">
        <header>
          <h2 className="defaulter-heading">Defaulter Tracking System</h2>
        </header>
        <div className="content">
          <div className="rotateImageContainer">
            <img src="vcetLogo.jpg" alt="VCET Logo" />
          </div>
          <div className="login-container">
            <h2 className="login-heading">Login</h2>
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="login-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="login-input"
                />
              </div>
              <div className="radio-group">
                <label className="login-as-label">Login as:</label>
                <label>
                  
                  <input
                    type="radio"
                    value="pe"
                    checked={selectedRole === 'pe'}
                    onChange={() => setSelectedRole('pe')}
                    className="login-radio"
                  />
                  PE
                </label>
                <label>
                  <input
                    type="radio"
                    value="hod"
                    checked={selectedRole === 'hod'}
                    onChange={() => setSelectedRole('hod')}
                    className="login-radio"
                  />
                  HOD
                </label>
                <label>
                <input
                    type="radio"
                    value="mentor"
                    checked={selectedRole === 'mentor'}
                    onChange={() => setSelectedRole('mentor')}
                    className="login-radio"
                  />
                  Mentor
                </label>
              </div>
              <div className="login-buttons">
                <button type="submit" className="login-btn">🔒 Login</button>
                <button type="button" onClick={handleHome} className="home-btn">🏠 Home</button>
                <button type="reset" onClick={() => window.location.reload()} className="reset-btn">🔄 Reset</button>
                </div>
              {message && <p className="message">{message}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
