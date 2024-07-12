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

  return (
    <div className="excelcon">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className="report-display">
          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
            <h4>Velammal College of Engineering and Technology</h4>
            <p>(Autonomous)</p>
            <p>Viraganoor, Madurai-625009</p>
            <p>Department of Physical Education</p>
            <p>{new Date(fromDate).toDateString() === new Date(toDate).toDateString()
              ? `Repeated Defaulters for ${mentorName} on ${formatDate(fromDate)}`
              : `Repeated Defaulters for ${mentorName} from ${formatDate(fromDate)} to ${formatDate(toDate)}`}</p>
          </div>
          <div className="btn-toolbar mb-2 mb-md-0">
            <div className="btn-group mr-2">
              <button className="btn btn-sm btn-outline-secondary">Export to Excel</button>
            </div>
          </div>
          {Object.entries(reportData).map(([type, data]) => (
            <div key={type}>
              <h5>{type === 'latecomers' ? 'LATECOMERS' : 'DRESSCODE AND DISCIPLINE DEFAULTERS'}</h5>
              {data.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped table-sm">
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
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorRepeatedDefaultersReport;
