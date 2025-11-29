import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../components/Card.css';
import '../History.css';
import './AttendanceHistory.css';

const AttendanceHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchAttendance();
    fetchSummary();
  }, [month, year]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/attendance/my-history?month=${month}&year=${year}`);
      setAttendance(response.data);
      
      // Set selected record for today if available
      const today = new Date();
      const todayRecord = response.data.find(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === today.toDateString();
      });
      if (todayRecord) {
        setSelectedRecord(todayRecord);
        setSelectedDate(new Date(todayRecord.date));
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get(`/api/attendance/my-summary?month=${month}&year=${year}`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const record = attendance.find(att => {
      const attDate = new Date(att.date).toISOString().split('T')[0];
      return attDate === dateStr;
    });
    setSelectedRecord(record || null);
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateStr = date.toISOString().split('T')[0];
    const record = attendance.find(att => {
      const attDate = new Date(att.date).toISOString().split('T')[0];
      return attDate === dateStr;
    });

    if (record) {
      return `calendar-day ${record.status}`;
    }
    return null;
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  if (loading) {
    return <LoadingSpinner message="Loading Attendance History" />;
  }

  return (
    <div className="attendance-history-container">
      <h1 className="page-title">📅 My Attendance History</h1>
      
      {/* Monthly Summary */}
      {summary && (
        <div className="card summary-card">
          <div className="card-header">
            <h3 className="card-title">📊 Monthly Summary</h3>
            <span className="month-label">
              {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="card-body">
            <div className="summary-stats">
              <div className="summary-stat stat-present">
                <div className="stat-value">{summary.present}</div>
                <div className="stat-label">Present</div>
              </div>
              <div className="summary-stat stat-absent">
                <div className="stat-value">{summary.absent}</div>
                <div className="stat-label">Absent</div>
              </div>
              <div className="summary-stat stat-late">
                <div className="stat-value">{summary.late}</div>
                <div className="stat-label">Late</div>
              </div>
              <div className="summary-stat stat-halfday">
                <div className="stat-value">{summary.halfDay || 0}</div>
                <div className="stat-label">Half Day</div>
              </div>
              <div className="summary-stat stat-hours">
                <div className="stat-value">{summary.totalHours.toFixed(1)}h</div>
                <div className="stat-label">Total Hours</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="history-grid">
        {/* Calendar View */}
        <div className="card calendar-card">
          <div className="card-header">
            <h3 className="card-title">Calendar View</h3>
          </div>
          <div className="card-body">
            <div className="calendar-controls">
              <div className="control-group">
                <label>
                  Month:
                  <select value={month} onChange={handleMonthChange} className="select-control">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>
                        {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Year:
                  <select value={year} onChange={handleYearChange} className="select-control">
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileClassName={tileClassName}
              className="attendance-calendar"
            />

            <div className="legend">
              <h4>Legend:</h4>
              <div className="legend-items">
                <span className="legend-item present">
                  <span className="legend-color"></span>
                  Present
                </span>
                <span className="legend-item absent">
                  <span className="legend-color"></span>
                  Absent
                </span>
                <span className="legend-item late">
                  <span className="legend-color"></span>
                  Late
                </span>
                <span className="legend-item half-day">
                  <span className="legend-color"></span>
                  Half Day
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details View */}
        <div className="card details-card">
          <div className="card-header">
            <h3 className="card-title">Attendance Details</h3>
          </div>
          <div className="card-body">
            {selectedRecord ? (
              <div className="record-details">
                <div className="detail-section">
                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {new Date(selectedRecord.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Check In:</span>
                    <span className="detail-value">{formatTime(selectedRecord.checkInTime)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Check Out:</span>
                    <span className="detail-value">{formatTime(selectedRecord.checkOutTime)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${selectedRecord.status}`}>
                      {selectedRecord.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Hours:</span>
                    <span className="detail-value">
                      {selectedRecord.totalHours ? `${selectedRecord.totalHours.toFixed(2)}h` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-details">
                <div className="empty-icon">📅</div>
                <p>Select a date from the calendar to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="card list-card">
        <div className="card-header">
          <h3 className="card-title">Attendance List</h3>
          <span className="record-count">{attendance.length} records</span>
        </div>
        <div className="card-body">
          {attendance.length === 0 ? (
            <div className="empty-state">
              <p>No attendance records found for this month</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr 
                      key={record._id} 
                      onClick={() => handleDateChange(new Date(record.date))} 
                      className="clickable-row"
                    >
                      <td>
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td>{formatTime(record.checkInTime)}</td>
                      <td>{formatTime(record.checkOutTime)}</td>
                      <td>
                        <span className={`status-badge ${record.status}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>{record.totalHours ? `${record.totalHours.toFixed(1)}h` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
