import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import Home from './Home';
import Pt from './components/Pt';
import Hod from './components/Hod';
import Mentor from './components/Mentor';
import ReportDisplay from './components/ReportDisplay';

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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
