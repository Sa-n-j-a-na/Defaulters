import React, { useState, useEffect } from 'react';
import './App.css'; // Import styles
import Login from './Login';

function Home() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    document.body.classList.add('home-body');
    return () => {
      document.body.classList.remove('home-body');
    };
  }, []);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setShowLogin(true);
  };

  const handleCancelLogin = () => {
    setShowLogin(false);
    setSelectedRole(null);
  };

  return (
    <div>
      <div className="container">
        <header>
          <div className="headingContainer">
            <center>
              <h1>VELAMMAL COLLEGE OF ENGINEERING AND TECHNOLOGY</h1>
              <div className="rotateImageContainer">
                <img src="vcetLogo.jpg" alt="VCET Logo" />
              </div>
            </center>
          </div>
          <h2>Defaulter Tracking System</h2>
        </header>
        <main>
          <h3>Select your role:</h3>
          <div className="roleButtons">
            <RoleButton role="pe" setSelectedRole={handleRoleClick} />
            <RoleButton role="mentor" setSelectedRole={handleRoleClick} />
            <RoleButton role="hod" setSelectedRole={handleRoleClick} />
          </div>
        </main>
      </div>

      {/* Conditionally render Login component */}
      {showLogin && <Login role={selectedRole} onCancel={handleCancelLogin} />}
    </div>
  );
}

function RoleButton({ role, setSelectedRole }) {
  return <button onClick={() => setSelectedRole(role)}>{role.toUpperCase()}</button>;
}

export default Home;
