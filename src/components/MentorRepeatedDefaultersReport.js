import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './comp.css';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`; // Format as dd-mm-yyyy
};

const MentorRepeatedDefaultersReport = () => {
  const { mentorName, defaulterType, fromDate, toDate } = useParams();
  const location = useLocation();
  const { dept } = location.state || {};
  const [reportData, setReportData] = useState({ dresscode: [], latecomers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State for handling errors

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/mentorRepeatedDefaulters/${mentorName}/${defaulterType}/${fromDate}/${toDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched Mentor Report Data:', data);
        setReportData(data);
        setError(null); // Reset error state on successful fetch
      } catch (error) {
        console.error('Error fetching mentor report data:', error);
        setError(error.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mentorName, defaulterType, fromDate, toDate]);

  const exportToExcel = () => {
    // Logic for exporting to Excel
    console.log('Exporting to Excel...');
  };

  const renderTable = (type, data) => (
    <div>
      <h5 className="table-heading">{type === 'latecomers' ? 'LATECOMERS' : 'DRESSCODE AND DISCIPLINE DEFAULTERS'}</h5>
      {data.length > 0 ? (
        <div key={type} className="table-container">
          <table className="defaulters-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Academic Year</th>
                <th>Semester</th>
                <th>Department</th>
                <th>Mentor</th>
                <th>Year</th>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Entry Date</th>
                {type === 'latecomers' && <th>Time In</th>}
                {type === 'dresscode' && <th>Observation</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.academicYear}</td>
                  <td>{item.semester}</td>
                  <td>{item.department}</td>
                  <td>{item.mentor}</td>
                  <td>{item.year}</td>
                  <td>{item.rollNumber}</td>
                  <td>{item.studentName}</td>
                  <td>{formatDate(item.entryDate)}</td>
                  {type === 'latecomers' && <td>{item.time_in}</td>}
                  {type === 'dresscode' && <td>{item.observation}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );

  const renderContent = () => {
    if (defaulterType === 'both') {
      return (
        <>
          {renderTable('latecomers', reportData.latecomers)}
          {renderTable('dresscode', reportData.dresscode)}
        </>
      );
    } else if (defaulterType === 'latecomers') {
      return renderTable('latecomers', reportData.latecomers);
    } else if (defaulterType === 'dresscode') {
      return renderTable('dresscode', reportData.dresscode);
    }
  };

  return (
    <div className="excelcon">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className="report-display">
          <div>
            <div className="header">
              <h4>Velammal College of Engineering and Technology</h4>
              <h4>(Autonomous)</h4>
              <h4>Viraganoor, Madurai-625009</h4>
              <h4>Department of Physical Education</h4>
            </div>
            <div className="export-button" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px' }}>
              <button onClick={exportToExcel} style={{ marginLeft: 'auto' }}>Export to Excel</button>
            </div>
            <h4 className="report-title">Defaulters {new Date(fromDate).toDateString() === new Date(toDate).toDateString() ? `on ${formatDate(fromDate)}` : `from ${formatDate(fromDate)} to ${formatDate(toDate)}`}</h4>
          </div>
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default MentorRepeatedDefaultersReport;
