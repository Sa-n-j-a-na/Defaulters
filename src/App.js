import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="container">
        <header>
          <h1>Velammal College of Engineering and Technology</h1>
          <h2>Defaulter Tracking System</h2>
        </header>
        <main>
          <p>Select your role:</p>
          <div className="role-buttons">
            <RoleButton role="pt-sir" />
            <RoleButton role="mentor" />
            <RoleButton role="hod" />
          </div>
        </main>
      </div>

      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

function RoleButton({ role }) {
  const navigate = useNavigate();
  
  function redirectToLogin() {
    navigate(`/login?role=${role}`);
  }

  return <button onClick={redirectToLogin}>{role.toUpperCase()}</button>;
}

function Login() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get('role');

  return (
    <div className="login-container">
      <h2>Login as {role.toUpperCase()}</h2>
      <form className="login-form">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default App;
