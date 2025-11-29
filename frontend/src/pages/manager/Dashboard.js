import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import AdvancedChart from '../../components/AdvancedChart';
import '../Dashboard.css';
import '../../components/Card.css';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
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
      const response = await api.get('/api/dashboard/manager');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Manager Dashboard" />;
  }

  if (!dashboardData) {
    return <div className="error">❌ Failed to load dashboard data</div>;
  }

  const { totalEmployees, todayStats, weeklyTrend, departmentStats, absentToday } = dashboardData;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>👔 Manager Dashboard</h1>
          <p className="dashboard-subtitle">Team Overview & Analytics</p>
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
        {/* Total Employees Card */}
        <div className="card stat-card stat-primary">
          <div className="card-header">
            <h3 className="card-title">👥 Total Employees</h3>
          </div>
          <div className="card-body">
            <div className="stat-value-large">{totalEmployees}</div>
            <div className="stat-description">Active team members</div>
          </div>
        </div>

        {/* Today's Attendance Card */}
        <div className="card stat-card stat-success">
          <div className="card-header">
            <h3 className="card-title">✅ Present Today</h3>
          </div>
          <div className="card-body">
            <div className="stat-value-large">{todayStats.present}</div>
            <div className="stat-description">Employees checked in</div>
          </div>
        </div>

        {/* Absent Today Card */}
        <div className="card stat-card stat-danger">
          <div className="card-header">
            <h3 className="card-title">❌ Absent Today</h3>
          </div>
          <div className="card-body">
            <div className="stat-value-large">{todayStats.absent}</div>
            <div className="stat-description">Not checked in</div>
          </div>
        </div>

        {/* Late Arrivals Card */}
        <div className="card stat-card stat-warning">
          <div className="card-header">
            <h3 className="card-title">⏰ Late Arrivals</h3>
          </div>
          <div className="card-body">
            <div className="stat-value-large">{todayStats.late.length}</div>
            <div className="stat-description">Arrived after 9:30 AM</div>
          </div>
        </div>

        {/* Weekly Trend Chart */}
        <div className="card chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3 className="card-title">📊 Weekly Attendance Trend (Last 7 Days)</h3>
          </div>
          <div className="card-body" style={{ padding: '2rem' }}>
            <AdvancedChart 
              data={weeklyTrend} 
              totalEmployees={totalEmployees}
              title="Weekly Attendance Trend"
            />
          </div>
        </div>

        {/* Department-wise Stats */}
        <div className="card dept-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3 className="card-title">🏢 Department-wise Attendance (This Month)</h3>
          </div>
          <div className="card-body">
            {Object.keys(departmentStats).length === 0 ? (
              <div className="empty-state">
                <p>No department data available</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Present</th>
                      <th>Late</th>
                      <th>Absent</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(departmentStats).map(([dept, stats]) => {
                      const total = stats.present + stats.late + stats.absent;
                      return (
                        <tr key={dept}>
                          <td className="dept-name">{dept}</td>
                          <td className="stat-present">{stats.present}</td>
                          <td className="stat-late">{stats.late}</td>
                          <td className="stat-absent">{stats.absent}</td>
                          <td className="stat-total">{total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Late Arrivals Today */}
        {todayStats.late.length > 0 && (
          <div className="card late-card">
            <div className="card-header">
              <h3 className="card-title">⏰ Late Arrivals Today</h3>
            </div>
            <div className="card-body">
              <div className="late-list">
                {todayStats.late.map((record, index) => (
                  <div key={index} className="late-item">
                    <div className="late-info">
                      <div className="late-name">{record.userId.name}</div>
                      <div className="late-details">
                        {record.userId.employeeId} • {record.userId.department}
                      </div>
                    </div>
                    <div className="late-time">
                      {new Date(record.checkInTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Absent Employees Today */}
        {absentToday.length > 0 && (
          <div className="card absent-card">
            <div className="card-header">
              <h3 className="card-title">❌ Absent Employees Today</h3>
            </div>
            <div className="card-body">
              <div className="absent-list">
                {absentToday.map((employee, index) => (
                  <div key={index} className="absent-item">
                    <div className="absent-info">
                      <div className="absent-name">{employee.name}</div>
                      <div className="absent-details">
                        {employee.employeeId} • {employee.department}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
