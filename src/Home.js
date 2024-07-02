import React, { useState, useEffect } from 'react';
import './App.css'; // Import styles
import Login from './Login';

function Home() {
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    document.body.classList.add('home-body');
    return () => {
      document.body.classList.remove('home-body');
    };
  }, []);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const handleCancelLogin = () => {
    setSelectedRole(null);
  };

  return (
    <div>
      <center>
        <h1>VELAMMAL COLLEGE OF ENGINEERING AND TECHNOLOGY</h1>
      </center>
      <div className="container">
        <header>
          <h2>Defaulter Tracking System</h2>
        </header>
        <div className="content">
          <div className="rotateImageContainer">
            <img src="vcetLogo.jpg" alt="VCET Logo" />
          </div>
          <div className="mainContent">
            {!selectedRole ? (
              <>
                <h3>Select your role:</h3>
                <div className="roleButtons">
                  <RoleButton role="pe" setSelectedRole={handleRoleClick} />
                  <RoleButton role="mentor" setSelectedRole={handleRoleClick} />
                  <RoleButton role="hod" setSelectedRole={handleRoleClick} />
                </div>
              </>
            ) : (
              <Login role={selectedRole} onCancel={handleCancelLogin} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleButton({ role, setSelectedRole }) {
  return <button onClick={() => setSelectedRole(role)}>{role.toUpperCase()}</button>;
}

export default Home;
