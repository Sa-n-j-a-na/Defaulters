import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './comp.css';


function Mentor() {
  const location = useLocation();
  const { username } = location.state;

  return (
    <div className={styles.compContainer}>
      <h1>Welcome, {username} (MENTOR)</h1>
    </div>
  );
}

export default Mentor;
