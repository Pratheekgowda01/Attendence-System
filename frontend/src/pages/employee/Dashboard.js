import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../Dashboard.css';
import '../../components/Card.css';
import '../../components/Button.css';

const EmployeeDashboard = () => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/dashboard/employee');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>👤 Employee Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {user?.name}!</p>
        </div>
        <div className="dashboard-time">
          <div className="time-display">
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          <div className="date-display-small">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>
      
      <div className="dashboard-grid">
        {/* Today's Status Card */}
        <div className="card status-card">
          <div className="card-header">
            <h3 className="card-title">⏰ Today's Status</h3>
            <span className={`status-badge ${todayStatus.status}`}>
              {todayStatus.status.toUpperCase()}
            </span>
          </div>
          <div className="card-body">
            <div className="status-info">
              <div className="status-item">
                <span className="status-icon">✓</span>
                <div>
                  <span className="label">Check In:</span>
                  <span className="value">{formatTime(todayStatus.checkInTime)}</span>
                </div>
              </div>
              <div className="status-item">
                <span className="status-icon">✓</span>
                <div>
                  <span className="label">Check Out:</span>
                  <span className="value">{formatTime(todayStatus.checkOutTime)}</span>
                </div>
              </div>
              <div className="status-item">
                <span className="status-icon">📊</span>
                <div>
                  <span className="label">Status:</span>
                  <span className="value">
                    {todayStatus.checkedIn ? 'Checked In' : 'Not Checked In'}
                  </span>
                </div>
              </div>
            </div>
            <Link 
              to="/employee/mark-attendance" 
              className="btn btn-primary btn-block"
            >
              {todayStatus.checkedIn && !todayStatus.checkedOut 
                ? 'Check Out Now' 
                : 'Check In Now'}
            </Link>
          </div>
        </div>

        {/* Monthly Summary Card */}
        <div className="card summary-card">
          <div className="card-header">
            <h3 className="card-title">📊 This Month's Summary</h3>
            <span className="month-label">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="card-body">
            <div className="stats-grid">
              <div className="stat-item stat-present">
                <div className="stat-icon">✓</div>
                <div className="stat-content">
                  <span className="stat-value">{monthlySummary.present}</span>
                  <span className="stat-label">Present</span>
                </div>
              </div>
              <div className="stat-item stat-absent">
                <div className="stat-icon">✗</div>
                <div className="stat-content">
                  <span className="stat-value">{monthlySummary.absent}</span>
                  <span className="stat-label">Absent</span>
                </div>
              </div>
              <div className="stat-item stat-late">
                <div className="stat-icon">⏰</div>
                <div className="stat-content">
                  <span className="stat-value">{monthlySummary.late}</span>
                  <span className="stat-label">Late</span>
                </div>
              </div>
              <div className="stat-item stat-hours">
                <div className="stat-icon">⏱</div>
                <div className="stat-content">
                  <span className="stat-value">{monthlySummary.totalHours.toFixed(1)}h</span>
                  <span className="stat-label">Total Hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Attendance Card */}
        <div className="card recent-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3 className="card-title">📅 Recent Attendance (Last 7 Days)</h3>
            <Link to="/employee/history" className="btn btn-secondary btn-sm">
              View All History
            </Link>
          </div>
          <div className="card-body">
            {recentAttendance.length === 0 ? (
              <div className="empty-state">
                <p>No attendance records found for the last 7 days</p>
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
    </div>
  );
};

export default EmployeeDashboard;
