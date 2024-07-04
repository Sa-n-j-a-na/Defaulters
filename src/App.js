import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Pt from './components/Pt';
import Hod from './components/Hod';
import Mentor from './components/Mentor';
import ReportDisplay from './components/ReportDisplay';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pt" element={<Pt />} />
        <Route path="/hod" element={<Hod />} />
        <Route path="/mentor" element={<Mentor />} />
        <Route path="/report/:defaulterType/:fromDate/:toDate" element={<ReportDisplay />} />
      </Routes>
    </Router>
  );
}

export default App;
