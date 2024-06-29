import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
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
        <Route path="/login" element={<RedirectToLogin />} />
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

function RedirectToLogin() {
  // Placeholder for redirect component (e.g., using React Router)
  return null;
}

export default App;
