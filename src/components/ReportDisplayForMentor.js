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

const ReportDisplayForMentor = () => {
  const { mentorName, defaulterType, fromDate, toDate } = useParams();
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let data = [];
  
        if (defaulterType === 'both') {
          const dresscodeResponse = await fetch(`http://localhost:5000/dresscode?fromDate=${fromDate}&toDate=${toDate}`);
          const latecomersResponse = await fetch(`http://localhost:5000/latecomers?fromDate=${fromDate}&toDate=${toDate}`);
          
          const dresscodeData = await dresscodeResponse.json();
          const latecomersData = await latecomersResponse.json();
  
          data = [
            { type: 'dresscode', data: dresscodeData.filter(item => item.mentorName === mentorName) },
            { type: 'latecomers', data: latecomersData.filter(item => item.mentorName === mentorName) }
          ];
        } else {
          const response = await fetch(`http://localhost:5000/${defaulterType}?fromDate=${fromDate}&toDate=${toDate}`);
          const filteredData = (await response.json()).filter(item => item.mentorName === mentorName);
          data = [{ type: defaulterType, data: filteredData }];
        }
  
        data.forEach(defaulterData => {
          defaulterData.data.sort((a, b) => {
            const dateComparison = new Date(a.entryDate) - new Date(b.entryDate);
            if (dateComparison !== 0) return dateComparison;
            return a.rollNumber.localeCompare(b.rollNumber); // Sort by roll number if dates are the same
          });
        });
  
        setReportData(data);
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };
  
    fetchData();
  }, [mentorName, defaulterType, fromDate, toDate]);
  

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report Data');
  
    const formattedFromDate = formatDate(fromDate);
    const formattedToDate = formatDate(toDate);
    const dateRangeText = new Date(fromDate).toDateString() === new Date(toDate).toDateString() ? 
      `Defaulters on ${formattedFromDate}` : 
      `Defaulters from ${formattedFromDate} to ${formattedToDate}`;
  
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
      const dateRangeText = new Date(fromDate).toDateString() === new Date(toDate).toDateString() ? 
        `on ${formattedFromDate}` : 
        `from ${formattedFromDate} to ${formattedToDate}`;
  
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
        cell.border = {
          top: { style: 'medium' },
          left: { style: 'medium' },
          bottom: { style: 'medium' },
          right: { style: 'medium' }
        };
      });
  
      // Add data rows
      data.forEach((item, index) => {
        const row = [
          index + 1, // S.No
          item.academicYear, item.semester, item.department, item.mentorName, item.year, item.rollNumber, item.studentName, formatDate(item.entryDate),
          ...(type === 'latecomers' ? [item.timeIn] : []),
          ...(type === 'dresscode' ? [item.observation] : []),
        ];
        worksheet.addRow(row).eachCell((cell, colNumber) => {
          if ((type === 'dresscode' && [5, 7, 8, 10].includes(colNumber)) || (type === 'latecomers' && [5, 7, 8].includes(colNumber))) {
            cell.alignment = { vertical: 'middle', horizontal: 'left' }; // Left align for specific columns
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'center' }; // Center align for others
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
  
      // Add empty row after data
      worksheet.addRow([]);
      rowIndex++;
    };
  
    // Add data for each defaulter type in the order: dresscode first, then latecomers
    reportData.forEach(({ type, data }) => {
      addHeadersAndData(type, data);
    });
  
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

  return (
    <div className='excelcon'>
      <div className="report-display">
        <div>
          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
            <h4>Velammal College of Engineering and Technology</h4>
            <h4>(Autonomous)</h4>
            <h4>Viraganoor, Madurai-625009</h4>
            <h4>Department of Physical Education</h4>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px' }}>
            <button onClick={exportToExcel} style={{ marginLeft: 'auto' }}>Print Excel Report</button>
          </div>
          <h4 style={{ textAlign: 'center', fontWeight: 'bold' }}>Defaulters {new Date(fromDate).toDateString() === new Date(toDate).toDateString() ? `on ${formatDate(fromDate)}` : `from ${formatDate(fromDate)} to ${formatDate(toDate)}`}</h4>
        </div>
        {reportData.map(({ type, data }) => (
          <div key={type} className="table-container">
            <h5 className="table-heading">{type === 'latecomers' ? 'LATECOMERS' : 'DRESSCODE AND DISCIPLINE DEFAULTERS'}</h5>
            <table className="mentor-report-table">
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
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="no-data">No data available</td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>{item.academicYear}</td>
                      <td>{item.semester}</td>
                      <td>{item.department}</td>
                      <td>{item.mentorName}</td>
                      <td>{item.year}</td>
                      <td>{item.rollNumber}</td>
                      <td>{item.studentName}</td>
                      <td>{formatDate(item.entryDate)}</td>
                      {type === 'latecomers' && <td>{item.timeIn}</td>}
                      {type === 'dresscode' && <td>{item.observation}</td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportDisplayForMentor;
