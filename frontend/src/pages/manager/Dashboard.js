import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import AdvancedChart from '../../components/AdvancedChart';
import PieChart from '../../components/PieChart';
import '../Dashboard.css';
import '../../components/Card.css';
import './ManagerDashboard.css';

// Icon Components
const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

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

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
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
    <div className="dashboard manager-dashboard">
      {/* I. Key Performance Indicators (KPIs) */}
      <div className="kpi-section">
        <h2 className="section-title">Key Performance Indicators</h2>
        <div className="kpi-cards-grid">
          <div className="kpi-card kpi-total">
            <div className="kpi-icon">
              <UsersIcon />
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{totalEmployees}</div>
              <div className="kpi-label">Total Employees</div>
            </div>
          </div>
          <div className="kpi-card kpi-present">
            <div className="kpi-icon">
              <CheckIcon />
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{todayStats.present}</div>
              <div className="kpi-label">Present Today</div>
            </div>
          </div>
          <div 
            className="kpi-card kpi-absent clickable"
            onClick={() => {
              const absentSection = document.getElementById('absent-employees-section');
              if (absentSection) {
                absentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Add a highlight effect
                absentSection.style.transition = 'box-shadow 0.3s ease';
                absentSection.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.3)';
                setTimeout(() => {
                  absentSection.style.boxShadow = '';
                }, 2000);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="kpi-icon">
              <XIcon />
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{todayStats.absent}</div>
              <div className="kpi-label">Absent Today</div>
            </div>
          </div>
          <div className="kpi-card kpi-late">
            <div className="kpi-icon">
              <ClockIcon />
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{todayStats.late.length}</div>
              <div className="kpi-label">Late Arrivals</div>
            </div>
          </div>
        </div>
      </div>

      {/* II. Visual Trend Analysis (Charts) */}
      <div className="charts-section">
        <h2 className="section-title">Visual Trend Analysis</h2>
        <div className="charts-grid">
          {/* Weekly Trend Chart */}
          <div className="chart-card weekly-trend">
            <div className="chart-header">
              <h3 className="chart-title">Weekly Attendance Trend</h3>
              <p className="chart-subtitle">Average Present Rate (Last 7 Days)</p>
            </div>
            <div className="chart-body">
              <AdvancedChart 
                data={weeklyTrend} 
                totalEmployees={totalEmployees}
                title="Weekly Attendance Trend"
              />
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="chart-card department-breakdown">
            <div className="chart-header">
              <h3 className="chart-title">Department Breakdown</h3>
              <p className="chart-subtitle">% Present by Department (This Month)</p>
            </div>
            <div className="chart-body">
              {Object.keys(departmentStats).length === 0 ? (
                <div className="empty-state">
                  <p>No department data available</p>
                </div>
              ) : (
                <div className="department-chart">
                  <PieChart
                    data={Object.entries(departmentStats).map(([dept, stats]) => {
                      return {
                        label: dept,
                        value: stats.present, // Use present count for pie chart
                        present: stats.present,
                        late: stats.late,
                        absent: stats.absent,
                        total: stats.present + stats.late + stats.absent
                      };
                    })}
                    colors={['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a']}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* III. Actionable Alerts */}
      <div className="alerts-section">
        <div className="alerts-header">
          <h2 className="section-title">Actionable Alerts</h2>
          <Link to="/manager/reports" className="quick-link-reports">
            Export Reports →
          </Link>
        </div>
        <div className="alerts-grid">
          {/* Absent Employees Today */}
          <div id="absent-employees-section" className="alert-card absent-alert">
            <div className="alert-header">
              <h3 className="alert-title">❌ Absent Employees Today</h3>
              <span className="alert-count">{absentToday.length}</span>
            </div>
            <div className="alert-body">
              {absentToday.length === 0 ? (
                <div className="empty-alert">
                  <p>All employees are present today! 🎉</p>
                </div>
              ) : (
                <div className="absent-employees-list">
                  {absentToday.map((employee, index) => (
                    <div key={index} className="absent-employee-item">
                      <div className="employee-avatar">
                        {employee.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="employee-info">
                        <div className="employee-name">{employee.name}</div>
                        <div className="employee-details">
                          {employee.employeeId} • {employee.department}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
