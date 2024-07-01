import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function Login({ role, onCancel }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showOverlay, setShowOverlay] = useState(false); // State for overlay

  useEffect(() => {
    // Reset form values when the role changes
    setUsername('');
    setPassword('');
    setMessage('');
    setShowOverlay(true); // Show overlay when component mounts
    return () => {
      setShowOverlay(false); // Hide overlay when component unmounts
    };
  }, [role]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password, role });
      if (response && response.data) {
        setMessage(response.data.message);
        if (response.data.message === 'Login successful') {
          if (role === 'pe') {
            navigate('/pt', { state: { username } });
          } else if (role === 'hod') {
            navigate('/hod', { state: { username } });
          } else if (role === 'mentor') {
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

  return (
    <>
      {showOverlay && <div className="overlay" />}
      <div className="login-notification">
        <div className="login-header">
          <h2>Login as {role.toUpperCase()}</h2>
          <div className="cancel-button" onClick={onCancel}>
          X </div>
        </div>
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
            />
          </div>
          <button type="submit">Login</button>
          {message && <p>{message}</p>}
        </form>
      </div>
    </>
  );
}

export default Login;
