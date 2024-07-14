import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report Data');
  
    const formattedFromDate = formatDate(fromDate);
    const formattedToDate = formatDate(toDate);
    const dateRangeText = new Date(fromDate).toDateString() === new Date(toDate).toDateString()
      ? `Repeated Defaulters on ${formattedFromDate}`
      : `Repeated Defaulters from ${formattedFromDate} to ${formattedToDate}`;
  
    // Add college headers
    const collegeHeaders = [
      ["Velammal College of Engineering and Technology"],
      ["(Autonomous)"],
      ["Viraganoor, Madurai-625009"],
      ["Department of Physical Education"],
      [dateRangeText],
      [], // Empty row for spacing
    ];
  
    // Add college headers with merged cells up to column J
    let rowIndex = 1;
    collegeHeaders.forEach(row => {
      const excelRow = worksheet.addRow(row);
      excelRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      worksheet.mergeCells(`A${rowIndex}:J${rowIndex}`); // Merge up to column J
      rowIndex++;
    });
  
    worksheet.addRow([]); // Empty row for spacing
  
    // Function to add headers and data for each defaulter type
    const addHeadersAndData = (type, data) => {
      const formattedFromDate = formatDate(fromDate);
      const formattedToDate = formatDate(toDate);
      const dateRangeText = new Date(fromDate).toDateString() === new Date(toDate).toDateString()
        ? `on ${formattedFromDate}`
        : `from ${formattedFromDate} to ${formattedToDate}`;
  
      // Add section title with formatting
      const headingRow = worksheet.addRow([`${type === 'latecomers' ? 'LATECOMERS' : 'DRESSCODE AND DISCIPLINE DEFAULTERS'} ${dateRangeText}`]);
      headingRow.eachCell(cell => {
        cell.font = { bold: true };
      });
  
      rowIndex++;
  
      // Add empty row after heading
      worksheet.addRow([]);
  
      // Add headers
      const headers = [
        'S.No', 'Academic Year', 'Semester', 'Department', 'Mentor', 'Year', 'Roll Number', 'Student Name', 'Entry Date',
        ...(type === 'latecomers' ? ['Time In'] : []),
        ...(type === 'dresscode' ? ['Observation'] : []),
      ];
  
      worksheet.addRow(headers); // Add headers row
      worksheet.lastRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
  
      // Add data rows
      data.forEach((item, index) => {
        const row = [
          index + 1, // S.No
          item.academicYear, item.semester, item.department, item.mentor, item.year, item.rollNumber, item.studentName, formatDate(item.entryDate),
          ...(type === 'latecomers' ? [item.time_in] : []),
          ...(type === 'dresscode' ? [item.observation] : []),
        ];
        worksheet.addRow(row).eachCell((cell, colNumber) => {
          if ((type === 'dresscode' && [5, 7, 8, 10].includes(colNumber))||(type === 'latecomers' && [5, 7, 8].includes(colNumber))) {
            cell.alignment = { vertical: 'middle', horizontal: 'left' }; // Left align for specific columns
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'center' }; // Center align for others
          }
        });
      });
  
      // Add empty row after data
      worksheet.addRow([]);
      rowIndex++;
    };
  
    // Add data based on the selected defaulter type
    if (defaulterType === 'both') {
      addHeadersAndData('dresscode', reportData.dresscode);
      addHeadersAndData('latecomers', reportData.latecomers);
    } else {
      addHeadersAndData(defaulterType, reportData[defaulterType]);
    }
  
    // Auto resize columns based on content
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(maxLength + 1, 20); // Minimum width of 25
    });
  
    // Center align the first six lines
    for (let i = 1; i <= 5; i++) {
      worksheet.getRow(i).eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    }
  
    // Generate Excel file and save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Report_${fromDate}_to_${toDate}.xlsx`);
  };
  

  const renderTable = (type, data) => (
    <div>
      <h5 className="table-heading">{type === 'latecomers' ? 'LATECOMERS' : 'DRESSCODE AND DISCIPLINE DEFAULTERS'}</h5>
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
    </div>
  );

  const renderContent = () => {
    if (defaulterType === 'both') {
      return (
        <>
          {renderTable('dresscode', reportData.dresscode)}
          {renderTable('latecomers', reportData.latecomers)}
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
              <button onClick={exportToExcel} style={{ marginLeft: 'auto' }}>Print Excel Report</button>
            </div>
            <h4 className="report-title">Repeated Defaulters {new Date(fromDate).toDateString() === new Date(toDate).toDateString() ? `on ${formatDate(fromDate)}` : `from ${formatDate(fromDate)} to ${formatDate(toDate)}`}</h4>
          </div>
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default MentorRepeatedDefaultersReport;
