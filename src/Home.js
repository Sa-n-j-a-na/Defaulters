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
            <RoleButton role="pt-sir" setSelectedRole={setSelectedRole} />
            <RoleButton role="mentor" setSelectedRole={setSelectedRole} />
            <RoleButton role="hod" setSelectedRole={setSelectedRole} />
          </div>
        </main>
      </div>
      <div>
        {selectedRole && <Login key={selectedRole} role={selectedRole} />}
      </div>
    </div>
  );
}

function RoleButton({ role, setSelectedRole }) {
  return <button onClick={() => setSelectedRole(role)}>{role.toUpperCase()}</button>;
}

export default Home;
