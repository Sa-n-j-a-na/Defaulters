import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import Login from './Login';

function Home() {
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <div>
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
          <RoleButton role="pt-sir" setSelectedRole={setSelectedRole} />
          <RoleButton role="mentor" setSelectedRole={setSelectedRole} />
          <RoleButton role="hod" setSelectedRole={setSelectedRole} />
        </div>
        
      </main>
    </div>
    <div>
          {selectedRole && <Login role={selectedRole} />}
    </div>
    </div>
    
  );
}

function RoleButton({ role, setSelectedRole }) {
  return <button onClick={() => setSelectedRole(role)}>{role.toUpperCase()}</button>;
}

export default Home;
