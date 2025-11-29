import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../components/Card.css';
import '../../components/Button.css';
import './AllAttendance.css';

const AllAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/attendance/all');
      const employeeIds = [...new Set(response.data.map(att => att.userId.employeeId))];
      setEmployees(employeeIds.sort());
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/api/attendance/all?${params.toString()}`);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchAttendance();
  };

  const handleResetFilters = () => {
    setFilters({
      employeeId: '',
      startDate: '',
      endDate: '',
      status: ''
    });
    setTimeout(fetchAttendance, 100);
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayStatus = (status) => {
    if (status === 'absent') return 'Absent';
    return 'Present';
  };

  const getRemarks = (record) => {
    const status = record.status;
    if (status === 'late') return 'Late arrival';
    if (status === 'half-day') return 'Half day';
    if (status === 'present') return 'Full day';
    if (status === 'absent') return '-';
    return '-';
  };

  return (
    <div className="all-attendance-container">
      <h1 className="page-title">👥 All Employees Attendance</h1>
      
      <div className="card filter-card">
        <div className="card-header">
          <h3 className="card-title">🔍 Filters</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleApplyFilters} className="filter-form">
            <div className="filter-group">
              <label className="filter-label">Employee ID</label>
              <select
                name="employeeId"
                value={filters.employeeId}
                onChange={handleFilterChange}
                className="filter-input"
              >
                <option value="">All Employees</option>
                {employees.map(empId => (
                  <option key={empId} value={empId}>{empId}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label className="filter-label">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-input"
              >
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
              </select>
            </div>
            
            <div className="filter-actions">
              <button type="submit" className="btn btn-primary">
                Apply Filters
              </button>
              <button type="button" onClick={handleResetFilters} className="btn btn-secondary">
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card attendance-list-card">
        <div className="card-header">
          <h3 className="card-title">Attendance Records</h3>
          <span className="record-count">{attendance.length} records found</span>
        </div>
        <div className="card-body">
          {loading ? (
            <LoadingSpinner message="Loading attendance records..." />
          ) : attendance.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No attendance records found</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>Hours</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => {
                    const displayStatus = getDisplayStatus(record.status);
                    const remarks = getRemarks(record);
                    return (
                      <tr key={record._id}>
                        <td>
                          {new Date(record.date).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="employee-id">{record.userId.employeeId}</td>
                        <td className="employee-name">{record.userId.name}</td>
                        <td>{record.userId.department || 'N/A'}</td>
                        <td>{formatTime(record.checkInTime)}</td>
                        <td>{formatTime(record.checkOutTime)}</td>
                        <td>
                          <span className={`status-badge ${displayStatus.toLowerCase()}`}>
                            {displayStatus}
                          </span>
                        </td>
                        <td className="hours">{(record.totalHours || 0).toFixed(2)}h</td>
                        <td className="remarks">{remarks}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllAttendance;
