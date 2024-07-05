import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
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
        let data = await response.json();

        // Sort data by department (alphabetically) and year (descending)
        data.sort((a, b) => {
          if (a.department < b.department) return -1;
          if (a.department > b.department) return 1;
          // If departments are the same, sort by year descending
          return b.year.localeCompare(a.year); // Assuming year is a string like 'I', 'II', 'III', 'IV'
        });

        setReportData(data);
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };

    fetchData();
  }, [defaulterType, fromDate, toDate]);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report Data');

    // Add heading rows
    const heading = [
      ["Velammal College of Engineering and Technology"],
      ["(Autonomous)"],
      ["Viraganoor, Madurai-625009"],
      ["Department of Physical Education"],
      [`Report for ${defaulterType} from ${formatDate(fromDate)} to ${formatDate(toDate)}`],
      [], // Empty row for spacing
    ];

    // Add header row
    const headers = [
      'Academic Year', 'Semester', 'Department', 'Mentor', 'Year', 'Roll Number', 'Student Name', 'Entry Date',
      ...(defaulterType === 'latecomers' ? ['Time In'] : []),
      ...(defaulterType === 'dresscode' ? ['Observation'] : []),
    ];

    heading.forEach((row, index) => {
      const excelRow = worksheet.addRow(row);
      excelRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      worksheet.mergeCells(`A${index + 1}:${String.fromCharCode(65 + headers.length - 1)}${index + 1}`);
    });

    worksheet.addRow(headers).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Add data rows
    reportData.forEach((item) => {
      const row = [
        item.academicYear, item.semester, item.department, item.mentor, item.year, item.rollNumber, item.studentName, formatDate(item.entryDate),
        ...(defaulterType === 'latecomers' ? [item.time_in] : []),
        ...(defaulterType === 'dresscode' ? [item.observation] : []),
      ];
      worksheet.addRow(row).eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    });

    // Adjust column widths
    worksheet.columns = [
      { width: 20 }, // Academic Year
      { width: 10 }, // Semester
      { width: 20 }, // Department
      { width: 20 }, // Mentor
      { width: 10 }, // Year
      { width: 20 }, // Roll Number
      { width: 25 }, // Student Name
      { width: 20 }, // Entry Date
      ...(defaulterType === 'latecomers' ? [{ width: 15 }] : []), // Time In
      ...(defaulterType === 'dresscode' ? [{ width: 25 }] : []), // Observation
    ];

    // Save the workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Report_${fromDate}_to_${toDate}.xlsx`);
  };

  return (
    <div className='excelcon'>
      <div className="report-display">
        <div>
          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
            <h4>Velammal College of Engineering and Technology</h4>
            <h4>(Autonomous)</h4>
            <h4>Viraganoor, Madurai-625009</h4>
            <h4>Department of Physical Educaton</h4>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px' }}>
            <button onClick={exportToExcel} style={{ marginLeft: 'auto' }}>Print Excel Report</button>
          </div>
          <h4 style={{ textAlign: 'center', fontWeight: 'bold' }}>Report for {defaulterType} from {formatDate(fromDate)} to {formatDate(toDate)}</h4>
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
    </div>
  );
};

export default ReportDisplay;
