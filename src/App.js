import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import Home from './Home';
import Pt from './components/Pt';
import Hod from './components/Hod';
import Mentor from './components/Mentor';
import ReportDisplay from './components/ReportDisplay';
import DefaulterReport from './components/DefaulterReport';
import ReportDisplayForMentor from './components/ReportDisplayForMentor'; // Import corrected ReportDisplayForMentor

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pt" element={<PrivateRoute element={<Pt />} />} />
          <Route path="/hod" element={<PrivateRoute element={<Hod />} />} />
          <Route path="/mentor" element={<PrivateRoute element={<Mentor />} />} />
          <Route path="/report/:defaulterType/:fromDate/:toDate" element={<PrivateRoute element={<ReportDisplay />} />} />
          <Route path="/defaulterreport/:defaulterType/:fromDate/:toDate" element={<PrivateRoute element={<DefaulterReport />} />} />
          <Route path="/mentorReport/:mentorName/:defaulterType/:fromDate/:toDate" element={<PrivateRoute element={<ReportDisplayForMentor />} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
