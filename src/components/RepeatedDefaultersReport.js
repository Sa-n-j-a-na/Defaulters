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
  return `${day}-${month}-${year}`;
};

const RepeatedDefaultersReport = () => {
  const { fromDate, toDate } = useParams();
  const [repeatedDefaulters, setRepeatedDefaulters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [response1, response2] = await Promise.all([
          fetch(`http://localhost:5000/discipline_db?fromDate=${fromDate}&toDate=${toDate}`),
          fetch(`http://localhost:5000/latecomers_db?fromDate=${fromDate}&toDate=${toDate}`),
        ]);

        if (!response1.ok || !response2.ok) {
          throw new Error('Failed to fetch data');
        }

        const [data1, data2] = await Promise.all([response1.json(), response2.json()]);

        console.log('Data from discipline_db:', data1);
        console.log('Data from latecomers_db:', data2);

        // Combine and filter repeated defaulters
        const combinedData = [...data1, ...data2];

        const defaulterCounts = combinedData.reduce((acc, defaulter) => {
          acc[defaulter.studentName] = (acc[defaulter.studentName] || 0) + 1;
          return acc;
        }, {});

        const repeatedDefaultersList = combinedData.filter(
          (defaulter) => defaulterCounts[defaulter.studentName] > 1
        );

        console.log('Repeated Defaulters:', repeatedDefaultersList);

        // Sort by entry date and department
        repeatedDefaultersList.sort((a, b) => {
          const dateComparison = new Date(a.entryDate) - new Date(b.entryDate);
          if (dateComparison !== 0) return dateComparison;
          if (a.department < b.department) return -1;
          if (a.department > b.department) return 1;
          return b.year.localeCompare(a.year);
        });

        setRepeatedDefaulters(repeatedDefaultersList);
      } catch (error) {
        console.error('Error fetching repeated defaulters:', error);
      }
    };

    fetchData();
  }, [fromDate, toDate]);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Repeated Defaulters');

    const formattedFromDate = formatDate(fromDate);
    const formattedToDate = formatDate(toDate);
    const dateRangeText = new Date(fromDate).toDateString() === new Date(toDate).toDateString() ?
      `Repeated Defaulters on ${formattedFromDate}` :
      `Repeated Defaulters from ${formattedFromDate} to ${formattedToDate}`;

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

    // Add headers
    const headers = [
      'S.No', 'Academic Year', 'Semester', 'Department', 'Mentor', 'Year', 'Roll Number', 'Student Name', 'Entry Date', 'Observation/Time In'
    ];

    worksheet.addRow(headers); // Add headers row
    worksheet.lastRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Add data rows
    repeatedDefaulters.forEach((item, index) => {
      const row = [
        index + 1, // S.No
        item.academicYear, item.semester, item.department, item.mentor, item.year, item.rollNumber, item.studentName, formatDate(item.entryDate),
        item.observation || item.time_in
      ];
      worksheet.addRow(row).eachCell((cell, colNumber) => {
        if ([5, 7, 8, 10].includes(colNumber)) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' }; // Left align for specific columns
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' }; // Center align for others
        }
      });
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
    saveAs(blob, `Repeated_Defaulters_${fromDate}_to_${toDate}.xlsx`);
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
          <h4 style={{ textAlign: 'center', fontWeight: 'bold' }}>Repeated Defaulters {new Date(fromDate).toDateString() === new Date(toDate).toDateString() ? `on ${formatDate(fromDate)}` : `from ${formatDate(fromDate)} to ${formatDate(toDate)}`}</h4>
        </div>
        <div className="table-container">
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
                <th>Observation/Time In</th>
              </tr>
            </thead>
            <tbody>
              {repeatedDefaulters.length > 0 ? (
                repeatedDefaulters.map((item, index) => (
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
                    <td>{item.observation || item.time_in}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10">No repeated defaulters found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RepeatedDefaultersReport;
