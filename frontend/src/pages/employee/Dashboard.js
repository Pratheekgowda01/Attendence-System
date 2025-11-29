import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../Dashboard.css';
import '../../components/Card.css';
import '../../components/Button.css';

// Icon Components
const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const StopwatchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4"></path>
    <path d="M12 18v4"></path>
    <path d="M8 6h8"></path>
    <path d="M8 18h8"></path>
    <path d="M8 6c0 2 1.5 4 4 4s4-2 4-4"></path>
    <path d="M8 18c0-2 1.5-4 4-4s4 2 4 4"></path>
    <line x1="12" y1="10" x2="12" y2="14"></line>
  </svg>
);

const EmployeeDashboard = () => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const location = useLocation();
  const refreshKey = useRef(0);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds to keep data updated
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  // Refresh when component becomes visible or when returning from mark attendance page
  useEffect(() => {
    const handleFocus = () => {
      fetchDashboardData();
    };

    // Refresh when window gains focus
    window.addEventListener('focus', handleFocus);
    
    // Always refresh when pathname is dashboard (handles navigation back)
    if (location.pathname === '/employee/dashboard') {
      // If coming from check-in, force immediate refresh
      if (location.state?.fromCheckIn) {
        fetchDashboardData(true);
        // Also refresh after a delay to ensure data is updated
        const timer1 = setTimeout(() => {
          fetchDashboardData(true);
        }, 1000);
        const timer2 = setTimeout(() => {
          fetchDashboardData(true);
        }, 2000);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          window.removeEventListener('focus', handleFocus);
        };
      } else {
        // Normal refresh
        fetchDashboardData();
        const timer = setTimeout(() => {
          fetchDashboardData();
        }, 500);
        return () => {
          clearTimeout(timer);
          window.removeEventListener('focus', handleFocus);
        };
      }
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [location.pathname, location.state]);

  const fetchDashboardData = async (force = false) => {
    try {
      if (force || !dashboardData) {
        setLoading(true);
      }
      // Add timestamp to prevent caching
      const response = await api.get(`/api/dashboard/employee?t=${Date.now()}`);
      setDashboardData(response.data);
      console.log('Dashboard data refreshed:', {
        checkedIn: response.data.todayStatus.checkedIn,
        checkedOut: response.data.todayStatus.checkedOut,
        status: response.data.todayStatus.status
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading Dashboard" />;
  }

  if (!dashboardData) {
    return <div className="error">❌ Failed to load dashboard data</div>;
  }

  const { todayStatus, monthlySummary, recentAttendance } = dashboardData;
  const isCheckedIn = todayStatus.checkedIn && !todayStatus.checkedOut;
  const isCompleted = todayStatus.checkedIn && todayStatus.checkedOut;
  const isNotCheckedIn = !todayStatus.checkedIn;
  const canCheckIn = !todayStatus.checkedIn && isWithinCheckInTime();
  const checkInTimeStatus = !todayStatus.checkedIn ? (isWithinCheckInTime() ? 'allowed' : 'not-allowed') : null;
  
  // Determine status display
  let statusDisplay = '';
  let statusClass = '';
  if (isCompleted) {
    statusDisplay = '✓ Completed';
    statusClass = 'completed';
  } else if (isCheckedIn) {
    statusDisplay = '✓ Checked In';
    statusClass = 'checked-in';
  } else {
    statusDisplay = '○ Not Checked In';
    statusClass = 'not-checked-in';
  }

  return (
    <div className="dashboard employee-dashboard">
      {/* I. Quick Action Header */}
      <div className="quick-action-header">
        <div className="status-display-card">
          <div className="status-indicator">
            <div className={`status-badge-large ${statusClass}`}>
              {statusDisplay}
            </div>
            {isNotCheckedIn && (
              <div className="check-in-time-info">
                <small className={`time-info ${checkInTimeStatus}`}>
                  {isWithinCheckInTime() 
                    ? '✓ Check-in window open (9:00 AM - 6:00 PM)'
                    : '⏰ Check-in only allowed between 9:00 AM - 6:00 PM'}
                </small>
              </div>
            )}
            {isCompleted && (
              <div className="check-in-time-info">
                <small className="time-info completed-info">
                  ✓ Attendance completed for today
                </small>
              </div>
            )}
          </div>
          <div className="check-in-out-section">
            {isCompleted ? (
              <div className="completed-actions">
                <p className="completed-text">Attendance completed</p>
                <Link 
                  to="/employee/mark-attendance" 
                  className="btn btn-secondary"
                >
                  View Details
                </Link>
              </div>
            ) : isCheckedIn ? (
              <Link 
                to="/employee/mark-attendance" 
                className="btn btn-action btn-checkout"
              >
                Check Out
              </Link>
            ) : (
              <Link 
                to="/employee/mark-attendance" 
                className={`btn btn-action btn-checkin ${!canCheckIn ? 'disabled' : ''}`}
                title={!canCheckIn ? 'Check-in is only allowed between 9:00 AM and 6:00 PM' : ''}
              >
                Check In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* II. Monthly Summary (Stats Widget) */}
      <div className="monthly-summary-section">
        <h2 className="section-title">Monthly Summary</h2>
        <div className="summary-cards-grid">
          <div className="summary-card stat-present">
            <div className="stat-icon-large">
              <CheckIcon />
            </div>
            <div className="stat-content">
              <div className="stat-number">{monthlySummary.present}</div>
              <div className="stat-label">Present</div>
            </div>
          </div>
          <div className="summary-card stat-absent">
            <div className="stat-icon-large">
              <XIcon />
            </div>
            <div className="stat-content">
              <div className="stat-number">{monthlySummary.absent}</div>
              <div className="stat-label">Absent</div>
            </div>
          </div>
          <div className="summary-card stat-late">
            <div className="stat-icon-large">
              <ClockIcon />
            </div>
            <div className="stat-content">
              <div className="stat-number">{monthlySummary.late}</div>
              <div className="stat-label">Late</div>
            </div>
          </div>
          <div className="summary-card stat-hours">
            <div className="stat-icon-large">
              <StopwatchIcon />
            </div>
            <div className="stat-content">
              <div className="stat-number">{monthlySummary.totalHours.toFixed(1)}h</div>
              <div className="stat-label">Total Hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* III. Recent History & Navigation */}
      <div className="recent-history-section">
        <div className="section-header">
          <h2 className="section-title">Recent Attendance (Last 7 Days)</h2>
          <Link to="/employee/history" className="view-history-link">
            View Full History →
          </Link>
        </div>
        <div className="recent-attendance-table-container">
          {recentAttendance.length === 0 ? (
            <div className="empty-state">
              <p>No attendance records found for the last 7 days</p>
            </div>
          ) : (
            <table className="recent-attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((record) => (
                  <tr key={record._id}>
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
                      <span className={`status-badge-small ${record.status}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
