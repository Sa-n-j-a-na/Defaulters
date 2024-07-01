import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './comp.css';


function Pt() {
  const location = useLocation();
  const { username } = location.state;

  return (
    <div className={styles.compContainer}>
      <h1>Welcome, {username} (PT-SIR)</h1>
    </div>
  );
}

export default Pt;
