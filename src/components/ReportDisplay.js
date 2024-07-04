import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';

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

  // Function to export data to Excel
  const exportToExcel = () => {
    const filename = `Report_${fromDate}_to_${toDate}.xlsx`;

    // Prepare data for export
    const exportData = reportData.map((item) => ({
      'Academic Year': item.academicYear,
      'Semester': item.semester,
      'Department': item.department,
      'Mentor': item.mentor,
      'Year': item.year,
      'Roll Number': item.rollNumber,
      'Student Name': item.studentName,
      'Entry Date': formatDate(item.entryDate),
      ...(defaulterType === 'latecomers' && { 'Time In': item.time_in }),
      ...(defaulterType === 'dresscode' && { 'Observation': item.observation }),
    }));

    // Create a new Excel workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data');

    // Export the workbook as an Excel file
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className='reportDisplay'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Report for {defaulterType} from {fromDate} to {toDate}</h2>
        <button onClick={exportToExcel} style={{ marginLeft: 'auto' }}>Print Excel Report</button>
      </div>
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
