import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function Login() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get('role');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password, role });
      if (response && response.data) {
        setMessage(response.data.message);
        // Perform additional actions on successful login, e.g., redirect to another page
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
    <div className="login-container">
      <h2>Login as {role ? role.toUpperCase() : 'USER'}</h2>
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
  );
}

export default Login;
