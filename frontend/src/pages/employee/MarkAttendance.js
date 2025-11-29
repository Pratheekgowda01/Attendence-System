import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import '../../components/Card.css';
import '../../components/Button.css';
import './MarkAttendance.css';

const MarkAttendance = () => {
  const { user } = useAuthStore();
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
    const startMinutes = 9 * 60; // 9:00 AM
    const endMinutes = 18 * 60; // 6:00 PM (18:00)
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  const getCheckInTimeStatus = () => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const currentMinutes = hour * 60 + minute;
    const startMinutes = 9 * 60; // 9:00 AM
    const endMinutes = 18 * 60; // 6:00 PM (18:00)

    if (currentMinutes < startMinutes) {
      const minutesUntilStart = startMinutes - currentMinutes;
      const hours = Math.floor(minutesUntilStart / 60);
      const mins = minutesUntilStart % 60;
      return {
        allowed: false,
        message: `Check-in opens in ${hours}h ${mins}m (9:00 AM - 6:00 PM)`
      };
    } else if (currentMinutes > endMinutes) {
      return {
        allowed: false,
        message: 'Check-in time has passed (9:00 AM - 6:00 PM)'
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
        message: 'Check-in is only allowed between 9:00 AM and 6:00 PM' 
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
      // Refresh status immediately
      await fetchTodayStatus();
      // Wait a bit for the backend to fully process, then redirect with refresh flag
      setTimeout(() => {
        navigate('/employee/dashboard', { replace: false, state: { refresh: Date.now(), fromCheckIn: true } });
      }, 1500);
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
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Mark Attendance</h1>
          <p className="welcome-message">
            Hi, <span className="user-name">{user?.name || 'Employee'}</span>! Ready to check in?
          </p>
        </div>
        <div className="header-right">
          <div className="header-date">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>
      
      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}

      <div className="attendance-layout">
        {/* Live Clock Card */}
        <div className="card clock-card">
          <div className="live-clock">
            <div className="clock-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
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
        </div>

        {/* Check-in Time Status */}
        {!todayStatus?.checkedIn && (
          <div className={`card time-status-card ${timeStatus.allowed ? 'allowed' : 'not-allowed'}`}>
            <div className="time-status-content">
              <div className="time-status-icon-wrapper">
                {timeStatus.allowed ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                )}
              </div>
              <div className="time-status-text">
                <div className="time-status-title">Check-in Window: 9:00 AM - 6:00 PM</div>
                <div className="time-status-message">{timeStatus.message}</div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Details Card */}
        <div className="card details-card">
          <div className="card-header">
            <h3 className="card-title">Attendance Details</h3>
          </div>
          <div className="card-body">
            <div className="attendance-details-list">
              <div className="detail-row-item">
                <div className="detail-row-label">Date:</div>
                <div className="detail-row-value">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div className="detail-row-item">
                <div className="detail-row-label">Check In:</div>
                <div className={`detail-row-value ${todayStatus?.attendance?.checkInTime ? 'has-value' : 'no-value'}`}>
                  {formatTime(todayStatus?.attendance?.checkInTime)}
                </div>
              </div>
              <div className="detail-row-item">
                <div className="detail-row-label">Check Out:</div>
                <div className={`detail-row-value ${todayStatus?.attendance?.checkOutTime ? 'has-value' : 'no-value'}`}>
                  {formatTime(todayStatus?.attendance?.checkOutTime)}
                </div>
              </div>
              <div className="detail-row-item">
                <div className="detail-row-label">Status:</div>
                <div className="detail-row-value">
                  <span className={`status-badge ${todayStatus?.attendance?.status || 'absent'}`}>
                    {(todayStatus?.attendance?.status || 'absent').toUpperCase()}
                  </span>
                </div>
              </div>
              {todayStatus?.attendance?.totalHours && (
                <div className="detail-row-item">
                  <div className="detail-row-label">Total Hours:</div>
                  <div className="detail-row-value has-value">
                    {todayStatus.attendance.totalHours.toFixed(2)}h
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
          {!todayStatus?.checkedIn && (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading || !canCheckIn}
              className={`action-btn checkin-btn ${!canCheckIn ? 'disabled' : ''}`}
              title={!canCheckIn ? 'Check-in is only allowed between 9:00 AM and 6:00 PM' : ''}
            >
              {actionLoading ? (
                <>
                  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Check In
                </>
              )}
            </button>
          )}
          {todayStatus?.checkedIn && !todayStatus?.checkedOut && (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="action-btn checkout-btn"
            >
              {actionLoading ? (
                <>
                  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Check Out
                </>
              )}
            </button>
          )}
          {todayStatus?.checkedOut && (
            <div className="completed-message">
              <div className="completed-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3>Attendance Completed</h3>
              <p>You have successfully completed your attendance for today.</p>
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
  );
};

export default MarkAttendance;
