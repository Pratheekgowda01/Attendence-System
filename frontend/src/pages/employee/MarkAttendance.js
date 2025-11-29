import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import '../../components/Card.css';
import '../../components/Button.css';
import './MarkAttendance.css';

const MarkAttendance = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodayStatus();
    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await api.get('/api/attendance/today');
      setTodayStatus(response.data);
    } catch (error) {
      console.error('Error fetching today status:', error);
      setAlert({ type: 'error', message: 'Failed to load attendance status' });
    } finally {
      setLoading(false);
    }
  };

  const isWithinCheckInTime = () => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const currentMinutes = hour * 60 + minute;
    const startMinutes = 8 * 60; // 8:00 AM
    const endMinutes = 10 * 60; // 10:00 AM
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  const getCheckInTimeStatus = () => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const currentMinutes = hour * 60 + minute;
    const startMinutes = 8 * 60; // 8:00 AM
    const endMinutes = 10 * 60; // 10:00 AM

    if (currentMinutes < startMinutes) {
      const minutesUntilStart = startMinutes - currentMinutes;
      const hours = Math.floor(minutesUntilStart / 60);
      const mins = minutesUntilStart % 60;
      return {
        allowed: false,
        message: `Check-in opens in ${hours}h ${mins}m (8:00 AM - 10:00 AM)`
      };
    } else if (currentMinutes > endMinutes) {
      return {
        allowed: false,
        message: 'Check-in time has passed (8:00 AM - 10:00 AM)'
      };
    } else {
      const minutesUntilEnd = endMinutes - currentMinutes;
      const hours = Math.floor(minutesUntilEnd / 60);
      const mins = minutesUntilEnd % 60;
      return {
        allowed: true,
        message: `Check-in window closes in ${hours}h ${mins}m`
      };
    }
  };

  const handleCheckIn = async () => {
    if (!isWithinCheckInTime()) {
      setAlert({ 
        type: 'error', 
        message: 'Check-in is only allowed between 8:00 AM and 10:00 AM' 
      });
      return;
    }

    setActionLoading(true);
    setAlert(null);
    try {
      const response = await api.post('/api/attendance/checkin');
      setAlert({ 
        type: 'success', 
        message: `Checked in successfully at ${new Date(response.data.attendance.checkInTime).toLocaleTimeString()}` 
      });
      fetchTodayStatus();
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to check in' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setAlert(null);
    try {
      const response = await api.post('/api/attendance/checkout');
      setAlert({ 
        type: 'success', 
        message: `Checked out successfully. Total hours: ${response.data.attendance.totalHours}h` 
      });
      fetchTodayStatus();
      setTimeout(() => {
        navigate('/employee/dashboard');
      }, 2000);
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to check out' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Attendance" />;
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const timeStatus = getCheckInTimeStatus();
  const canCheckIn = !todayStatus?.checkedIn && isWithinCheckInTime();

  return (
    <div className="mark-attendance-container">
      <h1 className="page-title">⏰ Mark Attendance</h1>
      
      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}

      <div className="card attendance-card">
        <div className="card-header">
          <h3 className="card-title">Today's Attendance</h3>
          <span className="date-display">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
        <div className="card-body">
          {/* Live Clock */}
          <div className="live-clock">
            <div className="clock-time">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <div className="clock-date">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Check-in Time Status */}
          {!todayStatus?.checkedIn && (
            <div className={`time-status ${timeStatus.allowed ? 'allowed' : 'not-allowed'}`}>
              <div className="time-status-icon">
                {timeStatus.allowed ? '✓' : '⏰'}
              </div>
              <div className="time-status-text">
                <strong>Check-in Window: 8:00 AM - 10:00 AM</strong>
                <p>{timeStatus.message}</p>
              </div>
            </div>
          )}

          {/* Attendance Details */}
          <div className="attendance-details">
            <div className="detail-row">
              <span className="detail-label">Check In Time:</span>
              <span className="detail-value">
                {formatTime(todayStatus?.attendance?.checkInTime)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Check Out Time:</span>
              <span className="detail-value">
                {formatTime(todayStatus?.attendance?.checkOutTime)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`status-badge ${todayStatus?.attendance?.status || 'absent'}`}>
                {(todayStatus?.attendance?.status || 'absent').toUpperCase()}
              </span>
            </div>
            {todayStatus?.attendance?.totalHours && (
              <div className="detail-row">
                <span className="detail-label">Total Hours:</span>
                <span className="detail-value">
                  {todayStatus.attendance.totalHours.toFixed(2)}h
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            {!todayStatus?.checkedIn && (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading || !canCheckIn}
                className={`btn btn-success btn-lg ${!canCheckIn ? 'disabled' : ''}`}
                title={!canCheckIn ? 'Check-in is only allowed between 8:00 AM and 10:00 AM' : ''}
              >
                {actionLoading ? 'Processing...' : 'Check In'}
              </button>
            )}
            {todayStatus?.checkedIn && !todayStatus?.checkedOut && (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="btn btn-danger btn-lg"
              >
                {actionLoading ? 'Processing...' : 'Check Out'}
              </button>
            )}
            {todayStatus?.checkedOut && (
              <div className="completed-message">
                <div className="completed-icon">✓</div>
                <p>You have already completed attendance for today.</p>
                <button 
                  onClick={() => navigate('/employee/dashboard')} 
                  className="btn btn-secondary"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
