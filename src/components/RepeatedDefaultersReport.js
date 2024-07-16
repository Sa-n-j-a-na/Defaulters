import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import './comp.css';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`; // Format as dd-mm-yyyy
};

const RepeatedDefaultersReport = () => {
  const { defaulterType, fromDate, toDate } = useParams();
  const location = useLocation();
  const { dept } = location.state || {};
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/repeateddefaultersreport/${defaulterType}/${fromDate}/${toDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched Report Data:', data);

        // Filter data based on department
        const filteredData = {
          dresscode: data.dresscode.filter(item => item.department === dept),
          latecomers: data.latecomers.filter(item => item.department === dept),
        };

        // Identify and merge all defaulters across both types
        const identifyAndMergeDefaulters = (data1, data2) => {
          const defaulterMap = {};

          // Add entries from the first dataset
          data1.forEach(item => {
            const key = `${item.rollNumber}-${item.department}`;
            if (!defaulterMap[key]) {
              defaulterMap[key] = [];
            }
            defaulterMap[key].push(item);
          });

          // Add entries from the second dataset
          data2.forEach(item => {
            const key = `${item.rollNumber}-${item.department}`;
            if (!defaulterMap[key]) {
              defaulterMap[key] = [];
            }
            defaulterMap[key].push(item);
          });

          // Only keep students with more than one entry (repeated defaulters)
          const repeatedDefaulters = Object.values(defaulterMap).filter(entries => entries.length > 1);

          // Flatten the entries
          return repeatedDefaulters.flat();
        };

        const mergedDefaulters = identifyAndMergeDefaulters(filteredData.dresscode, filteredData.latecomers);

        setReportData(mergedDefaulters);
        setError(null);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setError(error.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [defaulterType, fromDate, toDate, dept]);

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

    const headers = [
      'S.No', 'Academic Year', 'Semester', 'Department', 'Mentor', 'Year', 'Roll Number', 'Student Name', 'Entry Date', 'Observation'
    ];

    worksheet.addRow(headers); // Add headers row
    worksheet.lastRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Add data rows
    reportData.forEach((item, index) => {
      const row = [
        index + 1, // S.No
        item.academicYear, item.semester, item.department, item.mentor, item.year, item.rollNumber, item.studentName, formatDate(item.entryDate),
        item.observation ? item.observation : item.time_in
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
      column.width = Math.min(maxLength + 1, 20); // Minimum width of 20
    });

    // Add cumulative table in Excel
    const studentCounts = reportData.reduce((counts, item) => {
      const key = `${item.studentName}-${item.rollNumber}-${item.year}`;
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});

    worksheet.addRow([]); // Empty row for spacing
    worksheet.addRow(['Cumulative Table']); // Cumulative table title
    const cumulativeHeaders = ['Student Name', 'Roll Number', 'Year', 'Occurrences as Defaulter'];
    worksheet.addRow(cumulativeHeaders); // Cumulative table headers

    // Add cumulative table data
    Object.keys(studentCounts).forEach((key) => {
      const row = [
        key.split('-')[0], // Student Name
        key.split('-')[1], // Roll Number
        key.split('-')[2], // Year
        studentCounts[key], // Occurrences as Defaulter
      ];
      worksheet.addRow(row).eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    });

    // Auto resize columns for cumulative table
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(maxLength + 1, 20); // Minimum width of 20 for cumulative table
    });

    // Generate Excel file and save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `Report_${fromDate}_to_${toDate}.xlsx`);
  };

  const renderTable = (data) => {
    if (!data || data.length === 0) {
      return <p>No data available</p>;
    }

    const groupedData = data.reduce((acc, item) => {
      const key = `${item.academicYear}-${item.semester}-${item.department}-${item.mentor}-${item.year}-${item.rollNumber}-${item.studentName}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    return (
      <div>
        <h5 className="table-heading">Merged Defaulters</h5>
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
                <th>Observation</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedData).map((key, index) => (
                <React.Fragment key={key}>
                  {groupedData[key].map((item, subIndex) => (
                    <tr key={item._id}>
                      {subIndex === 0 && (
                        <>
                          <td rowSpan={groupedData[key].length}>{index + 1}</td>
                          <td rowSpan={groupedData[key].length}>{item.academicYear}</td>
                          <td rowSpan={groupedData[key].length}>{item.semester}</td>
                          <td rowSpan={groupedData[key].length}>{item.department}</td>
                          <td rowSpan={groupedData[key].length}>{item.mentor}</td>
                          <td rowSpan={groupedData[key].length}>{item.year}</td>
                        </>
                      )}
                      <td>{item.rollNumber}</td>
                      <td>{item.studentName}</td>
                      <td>{formatDate(item.entryDate)}</td>
                      <td>{item.observation ? item.observation : item.time_in}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCumulativeHeading = (data) => {
    if (!data || data.length === 0) {
      return null;
    }
  
    // Calculate student counts
    const studentCounts = data.reduce((counts, item) => {
      const key = `${item.studentName}-${item.rollNumber}-${item.year}`;
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
  
    // Sort studentCounts by count in descending order
    const sortedStudentCounts = Object.entries(studentCounts)
      .sort(([, countA], [, countB]) => countB - countA);
  
    return (
      <div className="cumulative-heading">
        <h5 className="table-heading">Cumulative Table: Count of Defaulters</h5>
        <table className="cumulative-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll Number</th>
              <th>Year</th>
              <th>Occurrences as Defaulter</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudentCounts.map(([key, count]) => {
              const [studentName, rollNumber, year] = key.split('-');
              return (
                <tr key={key}>
                  <td>{studentName}</td>
                  <td>{rollNumber}</td>
                  <td>{year}</td>
                  <td>{count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
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
          {renderTable(reportData)}
          {renderCumulativeHeading(reportData)}
        </div>
      )}
    </div>
  );
};

export default RepeatedDefaultersReport;
