import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './comp.css';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const ReportDisplay = () => {
  const { defaulterType, fromDate, toDate } = useParams();
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/${defaulterType}?fromDate=${fromDate}&toDate=${toDate}`);
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };

    fetchData();
  }, [defaulterType, fromDate, toDate]);

  return (
    <div className='reportDisplay'>
      <h2>Report for {defaulterType} from {fromDate} to {toDate}</h2>
      <table>
        <thead>
          <tr>
            <th>Academic Year</th>
            <th>Semester</th>
            <th>Department</th>
            <th>Mentor</th>
            <th>Year</th>
            <th>Roll Number</th>
            <th>Student Name</th>
            <th>Entry Date</th>
            {defaulterType === 'latecomers' && <th>Time In</th>}
            {defaulterType === 'dresscode' && <th>Observation</th>}
          </tr>
        </thead>
        <tbody>
          {reportData.map((item, index) => (
            <tr key={index}>
              <td>{item.academicYear}</td>
              <td>{item.semester}</td>
              <td>{item.department}</td>
              <td>{item.mentor}</td>
              <td>{item.year}</td>
              <td>{item.rollNumber}</td>
              <td>{item.studentName}</td>
              <td>{formatDate(item.entryDate)}</td>
              {defaulterType === 'latecomers' && <td>{item.time_in}</td>}
              {defaulterType === 'dresscode' && <td>{item.observation}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportDisplay;
