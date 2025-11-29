import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../components/Card.css';
import '../History.css';
import './TeamCalendar.css';

const TeamCalendar = () => {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const response = await api.get(
        `/api/attendance/all?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
      );
      setAttendance(response.data);
      
      // Set selected records for today
      const today = new Date();
      const todayRecords = response.data.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === today.toDateString();
      });
      if (todayRecords.length > 0) {
        setSelectedRecords(todayRecords);
        setSelectedDate(today);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const records = attendance.filter(att => {
      const attDate = new Date(att.date).toISOString().split('T')[0];
      return attDate === dateStr;
    });
    setSelectedRecords(records);
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateStr = date.toISOString().split('T')[0];
    const records = attendance.filter(att => {
      const attDate = new Date(att.date).toISOString().split('T')[0];
      return attDate === dateStr;
    });

    if (records.length > 0) {
      const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
      const totalCount = records.length;
      
      if (presentCount === totalCount) return 'calendar-day present';
      if (presentCount === 0) return 'calendar-day absent';
      return 'calendar-day late';
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
    return <LoadingSpinner message="Loading Team Calendar" />;
  }

  return (
    <div className="team-calendar-container">
      <h1 className="page-title">📅 Team Calendar View</h1>
      
      <div className="calendar-grid">
        <div className="card calendar-card">
          <div className="card-header">
            <h3 className="card-title">Team Calendar</h3>
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
                  All Present
                </span>
                <span className="legend-item absent">
                  <span className="legend-color"></span>
                  All Absent
                </span>
                <span className="legend-item late">
                  <span className="legend-color"></span>
                  Mixed
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card details-card">
          <div className="card-header">
            <h3 className="card-title">
              Attendance for {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <span className="record-count">{selectedRecords.length} employees</span>
          </div>
          <div className="card-body">
            {selectedRecords.length === 0 ? (
              <div className="empty-details">
                <div className="empty-icon">📅</div>
                <p>No attendance records for this date</p>
              </div>
            ) : (
              <div className="records-list">
                    {selectedRecords.map((record) => (
                  <div key={record._id} className="record-item">
                    <div className="record-header">
                      <div className="record-name">{record.userId.name}</div>
                          <span className={`status-badge ${record.status}`}>
                            {record.status}
                          </span>
                    </div>
                    <div className="record-details">
                      <div className="record-info">
                        <span className="info-label">ID:</span>
                        <span className="info-value">{record.userId.employeeId}</span>
                      </div>
                      <div className="record-info">
                        <span className="info-label">Dept:</span>
                        <span className="info-value">{record.userId.department || 'N/A'}</span>
                      </div>
                      <div className="record-info">
                        <span className="info-label">Check In:</span>
                        <span className="info-value">{formatTime(record.checkInTime)}</span>
                      </div>
                      <div className="record-info">
                        <span className="info-label">Check Out:</span>
                        <span className="info-value">{formatTime(record.checkOutTime)}</span>
                      </div>
                      {record.totalHours && (
                        <div className="record-info">
                          <span className="info-label">Hours:</span>
                          <span className="info-value">{record.totalHours.toFixed(2)}h</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;
