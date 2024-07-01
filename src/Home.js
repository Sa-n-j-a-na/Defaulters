import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Home() {
  return (
    <div className="container">
      <header>
        <div className="heading-container">
          <center>
            <h1>VELAMMAL COLLEGE OF ENGINEERING AND TECHNOLOGY</h1>
            <div className="rotate-image-container">
              <img src="vcetLogo.jpg" alt="VCET Logo" />
            </div>
          </center>
        </div>
        <h2>Defaulter Tracking System</h2>
      </header>
      <main>
        <h3>Select your role:</h3>
        <div className="role-buttons">
          <RoleButton role="pt-sir" />
          <RoleButton role="mentor" />
          <RoleButton role="hod" />
        </div>
      </main>
    </div>
  );
}

function RoleButton({ role }) {
  const navigate = useNavigate();

  function redirectToLogin() {
    navigate(`/login?role=${role}`);
  }

  return <button onClick={redirectToLogin}>{role.toUpperCase()}</button>;
}

export default Home;
