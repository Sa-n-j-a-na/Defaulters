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

const MentorRepeatedDefaultersReport = () => {
  const { mentorName, defaulterType, fromDate, toDate } = useParams();
  const [reportData, setReportData] = useState([]);
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
      const headingRow = worksheet.addRow([`${type === 'latecomers' ? 'LATECOMERS' : (type === 'dresscode' ? 'DRESSCODE AND DISCIPLINE DEFAULTERS' : 'BOTH DEFAULTERS')} ${dateRangeText}`]);
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
        ...(type === 'both' ? ['Observation/Time In'] : []),
      ];

      worksheet.addRow(headers); // Add headers row
      worksheet.lastRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      // Group data by rollNumber and studentName
      const groupedData = data.reduce((acc, item) => {
        const key = `${item.rollNumber}-${item.studentName}`;
        if (!acc[key]) {
          acc[key] = { ...item, entries: [] };
        }
        acc[key].entries.push({ entryDate: item.entryDate, observation: item.observation, time_in: item.time_in });
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
          item.mentor,
          item.year,
          item.rollNumber,
          item.studentName,
          formatDate(item.entries[0].entryDate),
          item.entries[0].time_in || item.entries[0].observation
        ]).eachCell((cell, colNumber) => {
          if ([5, 7, 8, 10].includes(colNumber)) {
            cell.alignment = { vertical: 'middle', horizontal: 'left' }; // Left align for specific columns
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'center' }; // Center align for others
          }
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
            entry.time_in || entry.observation
          ]).eachCell((cell, colNumber) => {
            if ([5, 7, 8, 10].includes(colNumber)) {
              cell.alignment = { vertical: 'middle', horizontal: 'left' }; // Left align for specific columns
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'center' }; // Center align for others
            }
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
        column.width = Math.min(maxLength , 20); // Minimum width of 25, increase for observations
      });

      // Center align the first six lines
      for (let i = 1; i <= 6; i++) {
        worksheet.getRow(i).eachCell(cell => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      }
    };

    addHeadersAndData(defaulterType, reportData);

    // Generate Excel file and save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Report_${formattedFromDate}_to_${formattedToDate}.xlsx`);
  };


  const renderTable = (type, data) => {
    console.log('Rendering table for:', type, 'with data:', data);
    
    const groupedData = data.reduce((acc, item) => {
      const key = `${item.rollNumber}-${item.studentName}`;
      if (!acc[key]) {
        acc[key] = { ...item, entries: [] };
      }
      acc[key].entries.push({ entryDate: item.entryDate, observation: item.observation, time_in: item.time_in });
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
                    <td rowSpan={item.entries.length}>{item.mentor}</td>
                    <td rowSpan={item.entries.length}>{item.year}</td>
                    <td rowSpan={item.entries.length}>{item.rollNumber}</td>
                    <td rowSpan={item.entries.length}>{item.studentName}</td>
                    <td>{formatDate(item.entries[0].entryDate)}</td>
                    {type === 'latecomers' && <td>{item.entries[0].time_in}</td>}
                    {type === 'dresscode' && <td>{item.entries[0].observation}</td>}
                    {type === 'both' && <td>{`${item.entries[0].observation ? item.entries[0].observation : ''}${item.entries[0].observation && item.entries[0].time_in ? ' / ' : ''}${item.entries[0].time_in ? item.entries[0].time_in : ''}`}</td>}
                  </tr>
                  {item.entries.slice(1).map((entry, idx) => (
                    <tr key={idx}>
                      <td>{formatDate(entry.entryDate)}</td>
                      {type === 'latecomers' && <td>{entry.time_in}</td>}
                      {type === 'dresscode' && <td>{entry.observation}</td>}
                      {type === 'both' && <td>{`${entry.observation ? entry.observation : ''}${entry.observation && entry.time_in ? ' / ' : ''}${entry.time_in ? entry.time_in : ''}`}</td>}
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
        </div>
      )}
    </div>
  );
};

export default MentorRepeatedDefaultersReport;
