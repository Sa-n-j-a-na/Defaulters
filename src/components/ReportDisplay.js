import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './comp.css';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`; // Format as dd-mm-yyyy
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

    // Add the heading rows
    const heading = [
      ["Velammal College of Engineering and Technology"],
      ["(Autonomous)"],
      ["Viraganoor, Madurai-625009"],
      ["Department of Physical Education"],
      [`Report for ${defaulterType} from ${formatDate(fromDate)} to ${formatDate(toDate)}`],
      [], // Empty row for spacing
    ];

    const worksheetData = heading.concat([Object.keys(exportData[0])], exportData.map(Object.values));
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Merge and center cells for headings
    for (let i = 0; i < heading.length - 1; i++) {
      const merge = { s: { r: i, c: 0 }, e: { r: i, c: Object.keys(exportData[0]).length - 1 } };
      if (!worksheet['!merges']) worksheet['!merges'] = [];
      worksheet['!merges'].push(merge);
    }

    // Style headings to be bold and centered
    for (let i = 0; i < heading.length - 1; i++) {
      for (let j = 0; j <= Object.keys(exportData[0]).length - 1; j++) {
        const cellAddress = XLSX.utils.encode_cell({ r: i, c: j });
        if (!worksheet[cellAddress]) continue;
        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
        worksheet[cellAddress].s = {
          font: { bold: true },
          alignment: { vertical: 'center', horizontal: 'center' },
        };
      }
    }

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data');

    // Export the workbook as an Excel file
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="report-display">
      <div>
        <div>
          <h2>Velammal College of Engineering and Technology</h2>
          <h2>(Autonomous)</h2>
          <h2>Viraganoor, Madurai-625009</h2>
          <h2>Department of Physical Education</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px' }}>
          <button onClick={exportToExcel} style={{ marginLeft: 'auto' }}>Print Excel Report</button>
        </div>
        <h2>Report for {defaulterType} from {formatDate(fromDate)} to {formatDate(toDate)}</h2>
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
