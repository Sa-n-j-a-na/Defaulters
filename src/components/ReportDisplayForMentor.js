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
  const [dresscodeData, setDresscodeData] = useState([]);
  const [latecomersData, setLatecomersData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlParams = new URLSearchParams({
          fromDate,
          toDate: toDate || fromDate, // Use fromDate if toDate is not provided
        });

        let response;
        if (defaulterType === 'dresscode') {
          response = await fetch(`http://localhost:5000/dresscode?${urlParams.toString()}`);
        } else if (defaulterType === 'latecomers') {
          response = await fetch(`http://localhost:5000/latecomers?${urlParams.toString()}`);
        } else {
          // Fetch both types if defaulterType is "both"
          const dresscodeResponse = await fetch(`http://localhost:5000/dresscode?${urlParams.toString()}`);
          const latecomersResponse = await fetch(`http://localhost:5000/latecomers?${urlParams.toString()}`);

          const dresscodeData = await dresscodeResponse.json();
          const filteredDresscodeData = dresscodeData.filter(item => item.mentor === mentorName);

          const latecomersData = await latecomersResponse.json();
          const filteredLatecomersData = latecomersData.filter(item => item.mentor === mentorName);

          setDresscodeData(filteredDresscodeData);
          setLatecomersData(filteredLatecomersData);
          return;
        }

        const data = await response.json();
        const filteredData = data.filter(item => item.mentor === mentorName);

        if (defaulterType === 'dresscode') {
          setDresscodeData(filteredData);
        } else if (defaulterType === 'latecomers') {
          setLatecomersData(filteredData);
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };

    fetchData();
  }, [mentorName, defaulterType, fromDate, toDate]);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report Data');

    // Add college headers
    const collegeHeaders = [
      ["Velammal College of Engineering and Technology"],
      ["(Autonomous)"],
      ["Viraganoor, Madurai-625009"],
      ["Department of Physical Education"],
      [`Print Excel Report - Defaulters from ${formatDate(fromDate)} to ${formatDate(toDate)}`],
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

    // Function to add headers and data for dresscode
    const addDresscodeData = () => {
      worksheet.addRow(['DRESSCODE AND DISCIPLINE DEFAULTERS']);
      worksheet.addRow([
        'S.No', 'Academic Year', 'Semester', 'Department', 'Mentor', 'Year', 'Roll Number', 'Student Name', 'Entry Date', 'Observation'
      ]);
      dresscodeData.forEach((item, index) => {
        worksheet.addRow([
          index + 1,
          item.academicYear,
          item.semester,
          item.department,
          item.mentor,
          item.year,
          item.rollNumber,
          item.studentName,
          formatDate(item.entryDate),
          item.observation,
        ]);
      });
      worksheet.addRow([]); // Empty row after dresscode data
    };

    // Function to add headers and data for latecomers
    const addLatecomersData = () => {
      worksheet.addRow(['LATECOMERS']);
      worksheet.addRow([
        'S.No', 'Academic Year', 'Semester', 'Department', 'Mentor', 'Year', 'Roll Number', 'Student Name', 'Entry Date', 'Time In'
      ]);
      latecomersData.forEach((item, index) => {
        worksheet.addRow([
          index + 1,
          item.academicYear,
          item.semester,
          item.department,
          item.mentor,
          item.year,
          item.rollNumber,
          item.studentName,
          formatDate(item.entryDate),
          item.time_in,
        ]);
      });
      worksheet.addRow([]); // Empty row after latecomers data
    };

    // Add dresscode and latecomers sections if data exists
    if (dresscodeData.length > 0) {
      addDresscodeData();
    }

    if (latecomersData.length > 0) {
      addLatecomersData();
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
      column.width = Math.min(maxLength + 1, 20); // Minimum width of 20
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
          <h4 style={{ textAlign: 'center', fontWeight: 'bold' }}>Defaulters from {formatDate(fromDate)} to {formatDate(toDate)}</h4>
        </div>

        {defaulterType === 'both' && (
          <>
            <div className="table-container">
              <h5 className="table-heading">DRESSCODE AND DISCIPLINE DEFAULTERS</h5>
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
                    <th>Observation</th>
                  </tr>
                </thead>
                <tbody>
                  {dresscodeData.length === 0 ? null : dresscodeData.map((item, index) => (
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
                      <td>{item.observation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-container">
              <h5 className="table-heading">LATECOMERS</h5>
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
                    <th>Time In</th>
                  </tr>
                </thead>
                <tbody>
                  {latecomersData.length === 0 ? null : latecomersData.map((item, index) => (
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
                      <td>{item.time_in}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {defaulterType === 'dresscode' && (
          <div className="table-container">
            <h5 className="table-heading">DRESSCODE AND DISCIPLINE DEFAULTERS</h5>
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
                  <th>Observation</th>
                </tr>
              </thead>
              <tbody>
                {dresscodeData.length === 0 ? null : dresscodeData.map((item, index) => (
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
                    <td>{item.observation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {defaulterType === 'latecomers' && (
          <div className="table-container">
            <h5 className="table-heading">LATECOMERS</h5>
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
                  <th>Time In</th>
                </tr>
              </thead>
              <tbody>
                {latecomersData.length === 0 ? null : latecomersData.map((item, index) => (
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
                    <td>{item.time_in}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDisplayForMentor;