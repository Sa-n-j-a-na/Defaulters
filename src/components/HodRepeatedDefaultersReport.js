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

const HodRepeatedDefaultersReport = () => {
  const { dept, defaulterType, fromDate, toDate } = useParams();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State for handling errors

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/hodRepeatedDefaulters/${dept}/${defaulterType}/${fromDate}/${toDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched HOD Report Data:', data);
        setReportData(data);
        setError(null); // Reset error state on successful fetch
      } catch (error) {
        console.error('Error fetching HOD report data:', error);
        setError(error.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dept, defaulterType, fromDate, toDate]);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report Data');
  
    const formattedFromDate = formatDate(fromDate);
    const formattedToDate = formatDate(toDate);
    const dateRangeText = new Date(fromDate).toDateString() === new Date(toDate).toDateString()
      ? `Repeated Defaulters on ${formattedFromDate}`
      : `Repeated Defaulters from ${formattedFromDate} to ${formattedToDate}`;
  
    // Add college headers for repeated defaulters section
    const collegeHeaders = [
      ["Velammal College of Engineering and Technology"],
      ["(Autonomous)"],
      ["Viraganoor, Madurai-625009"],
      ["Department of Physical Education"],
      ["Print Excel Report"],
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
      const headingRow = worksheet.addRow([`${type === 'latecomers' ? 'LATECOMERS' : (type === 'dresscode' ? 'DRESSCODE AND DISCIPLINE DEFAULTERS' : 'DRESSCODE AND DISCIPLINE DEFAULTERS AND LATECOMERS')}`]);
      headingRow.eachCell(cell => {
        cell.font = { bold: true };
      });
  
      rowIndex++;
  
      // Add empty row after heading
      worksheet.addRow([]);
  
      // Add headers for repeated defaulters
      const headers = [
        'S.No', 'Academic Year', 'Semester', 'Department', 'Mentor', 'Year', 'Roll Number', 'Student Name', 'Entry Date',
        ...(type === 'latecomers' ? ['Time In'] : []),
        ...(type === 'dresscode' ? ['Observation'] : []),
        ...(type === 'both' ? ['Observation/Time In'] : []),
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
  
      // Group data by rollNumber and studentName
      const groupedData = data.reduce((acc, item) => {
        const key = `${item.rollNumber}-${item.studentName}`;
        if (!acc[key]) {
          acc[key] = { ...item, entries: [] };
        }
        acc[key].entries.push({ entryDate: item.entryDate, observation: item.observation, timeIn: item.timeIn });
        return acc;
      }, {});
  
      // Filter grouped data to include only entries with more than one occurrence
      const filteredData = Object.values(groupedData).filter(item => item.entries.length > 1);
  
      // Add filtered data rows
      filteredData.forEach((item, index) => {
        worksheet.addRow([
          index + 1,
          item.academicYear,
          item.semester,
          item.department,
          item.mentorName,
          item.year,
          item.rollNumber,
          item.studentName,
          formatDate(item.entries[0].entryDate),
          item.entries[0].timeIn || item.entries[0].observation
        ]).eachCell((cell, colNumber) => {
          if ([5, 7, 8, 10].includes(colNumber)) {
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
  
        item.entries.slice(1).forEach(entry => {
          worksheet.addRow([
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            formatDate(entry.entryDate),
            entry.timeIn || entry.observation
          ]).eachCell((cell, colNumber) => {
            if ([5, 7, 8, 10].includes(colNumber)) {
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
  
        // Add empty row after each group
        worksheet.addRow([]);
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
        column.width = Math.min(maxLength, 20); // Minimum width of 20, increase for observations
      });
  
      // Center align the first six lines
      for (let i = 1; i <= 6; i++) {
        worksheet.getRow(i).eachCell(cell => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      }
    };
  
    // Add repeated defaulters data
    addHeadersAndData(defaulterType, reportData);
  
    // Calculate cumulative data
    const cumulativeCounts = {};
    reportData.forEach(item => {
      const key = `${item.year}-${item.rollNumber}-${item.studentName}`;
      if (!cumulativeCounts[key]) {
        cumulativeCounts[key] = {
          year: item.year,
          rollNumber: item.rollNumber,
          studentName: item.studentName,
          dresscodeCount: 0,
          latecomerCount: 0,
          totalCount: 0
        };
      }
      const isLatecomer = item.timeIn !== undefined && item.timeIn !== '';
      if (isLatecomer) {
        cumulativeCounts[key].latecomerCount++;
      } else {
        cumulativeCounts[key].dresscodeCount++;
      }
      cumulativeCounts[key].totalCount++;
    });

    const cumulativeData = Object.values(cumulativeCounts);

    worksheet.addRow([]); // Empty row before cumulative data
    worksheet.addRow(["Cumulative Data"]).eachCell(cell => {
      cell.font = { bold: true };
    });

    const cumulativeHeaders = [
      'S.No', 'Year', 'Roll Number', 'Student Name',
      ...(defaulterType === 'latecomers' ? ['Latecomer Count'] : []),
      ...(defaulterType === 'dresscode' ? ['Dresscode Defaulter Count'] : []),
      ...(defaulterType === 'both' ? ['Dresscode Defaulter Count', 'Latecomer Count', 'Total Count'] : []),
    ];
    worksheet.addRow(cumulativeHeaders); // Add cumulative headers row
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

    cumulativeData.forEach((item, index) => {
      worksheet.addRow([
        index + 1,
        item.year,
        item.rollNumber,
        item.studentName,
        ...(defaulterType === 'latecomers' ? [item.latecomerCount] : []),
        ...(defaulterType === 'dresscode' ? [item.dresscodeCount] : []),
        ...(defaulterType === 'both' ? [item.dresscodeCount, item.latecomerCount, item.totalCount] : []),
      ]).eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: colNumber === 3 || colNumber === 4 ? 'left' : 'center' }; // Left align roll number and student name in cumulative table
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
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
      column.width = Math.min(maxLength, 20); // Minimum width of 20, increase for observations
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    const formattedFileName = `${dateRangeText.replace(/\//g, '-')}.xlsx`;
    saveAs(new Blob([buffer]), formattedFileName);
  };
  

  const renderTable = (type, data) => {
    console.log('Rendering table for:', type, 'with data:', data);
    
    const groupedData = data.reduce((acc, item) => {
      const key = `${item.rollNumber}-${item.studentName}`;
      if (!acc[key]) {
        acc[key] = { ...item, entries: [] };
      }
      acc[key].entries.push({ entryDate: item.entryDate, observation: item.observation, timeIn: item.timeIn });
      return acc;
    }, {});
  
    if (!data || data.length === 0) {
      return <div>No data available</div>;
    }
  
    return (
      <div>
        <h5 className="table-heading">
          {type === 'latecomers' ? 'LATECOMERS' : (type === 'dresscode' ? 'DRESSCODE AND DISCIPLINE DEFAULTERS' : 'DRESSCODE AND DISCIPLINE DEFAULTERS AND LATECOMERS')}
        </h5>
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
                {type === 'latecomers' && <th>Time In</th>}
                {type === 'dresscode' && <th>Observation</th>}
                {type === 'both' && <th>Observation/Time In</th>}
              </tr>
            </thead>
            <tbody>
              {Object.values(groupedData).map((item, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td rowSpan={item.entries.length}>{index + 1}</td>
                    <td rowSpan={item.entries.length}>{item.academicYear}</td>
                    <td rowSpan={item.entries.length}>{item.semester}</td>
                    <td rowSpan={item.entries.length}>{item.department}</td>
                    <td rowSpan={item.entries.length}>{item.mentorName}</td>
                    <td rowSpan={item.entries.length}>{item.year}</td>
                    <td rowSpan={item.entries.length}>{item.rollNumber}</td>
                    <td rowSpan={item.entries.length}>{item.studentName}</td>
                    <td>{formatDate(item.entries[0].entryDate)}</td>
                    {type === 'latecomers' && <td>{item.entries[0].timeIn}</td>}
                    {type === 'dresscode' && <td>{item.entries[0].observation}</td>}
                    {type === 'both' && <td>{`${item.entries[0].observation ? item.entries[0].observation : ''}${item.entries[0].observation && item.entries[0].timeIn ? ' / ' : ''}${item.entries[0].timeIn ? item.entries[0].timeIn : ''}`}</td>}
                  </tr>
                  {item.entries.slice(1).map((entry, idx) => (
                    <tr key={idx}>
                      <td>{formatDate(entry.entryDate)}</td>
                      {type === 'latecomers' && <td>{entry.timeIn}</td>}
                      {type === 'dresscode' && <td>{entry.observation}</td>}
                      {type === 'both' && <td>{`${entry.observation ? entry.observation : ''}${entry.observation && entry.timeIn ? ' / ' : ''}${entry.timeIn ? entry.timeIn : ''}`}</td>}
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
  const renderCumulativeTable = (type) => {
    if (!reportData || reportData.length === 0) {
      return null; // If no report data, render nothing
    }
  
    // Calculate cumulative data
    const cumulativeCounts = {};
reportData.forEach(item => {
  const key = `${item.year}-${item.rollNumber}-${item.studentName}`;
  
  // Initialize the record if not already present
  if (!cumulativeCounts[key]) {
    cumulativeCounts[key] = {
      year: item.year,
      rollNumber: item.rollNumber,
      studentName: item.studentName,
      dresscodeCount: 0,
      latecomerCount: 0,
      totalCount: 0
    };
  }
  
  // Determine if the entry is a dresscode or latecomer
  const isLatecomer = item.timeIn !== undefined && item.timeIn !== '';
  
  if (isLatecomer) {
    cumulativeCounts[key].latecomerCount++;
  } else {
    cumulativeCounts[key].dresscodeCount++;
  }
  
  cumulativeCounts[key].totalCount++;
});

const cumulativeData = Object.values(cumulativeCounts);

    return (
      <div>
        <h5 className="table-heading">Cumulative Repeated Defaulters</h5>
        <div className="table-container">
          <table className="defaulters-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Year</th>
              <th>Roll Number</th>
              <th>Student Name</th>
              {type === 'latecomers' && <th>Latecomer Count</th>}
              {type === 'dresscode' && <th>Dresscode Defaulter Count</th>}
              {type === 'both' && (
                <>
                  <th>Dresscode Defaulter Count</th>
                  <th>Latecomer Count</th>
                  <th>Total Count</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {cumulativeData.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.year}</td>
                <td>{item.rollNumber}</td>
                <td>{item.studentName}</td>
                {type === 'latecomers' && <td>{item.latecomerCount}</td>}
                {type === 'dresscode' && <td>{item.dresscodeCount}</td>}
                {type === 'both' && (
                  <>
                    <td>{item.dresscodeCount}</td>
                    <td>{item.latecomerCount}</td>
                    <td>{item.totalCount}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
          
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
          {renderTable(defaulterType, reportData)}
          {renderCumulativeTable(defaulterType)}
        </div>
      )}
    </div>
  );
};

export default HodRepeatedDefaultersReport;
