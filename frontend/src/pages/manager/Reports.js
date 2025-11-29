import React, { useState } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../components/Card.css';
import '../../components/Button.css';
import './Reports.css';

const Reports = () => {
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: ''
  });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);

  React.useEffect(() => {
    fetchEmployees();
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

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!filters.startDate || !filters.endDate) {
      alert('Please select both start and end dates');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/api/attendance/all?${params.toString()}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!filters.startDate || !filters.endDate) {
      alert('Please select both start and end dates before exporting');
      return;
    }
    try {
      const params = new URLSearchParams();
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/api/attendance/export?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-export-${filters.startDate}-to-${filters.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
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
    <div className="reports-container">
      <h1 className="page-title">📊 Attendance Reports</h1>
      
      <div className="card filter-card">
        <div className="card-header">
          <h3 className="card-title">Generate Report</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleGenerateReport} className="report-form">
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <select
                name="employeeId"
                value={filters.employeeId}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">All Employees</option>
                {employees.map(empId => (
                  <option key={empId} value={empId}>{empId}</option>
                ))}
              </select>
              <small className="form-hint">Leave empty to include all employees</small>
            </div>
            
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {reportData.length > 0 && (
        <div className="card report-card">
          <div className="card-header">
            <h3 className="card-title">Report Data</h3>
            <div className="header-actions">
              <span className="record-count">{reportData.length} records</span>
              <button onClick={handleExportCSV} className="btn btn-success btn-sm">
                📥 Export to CSV
              </button>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <LoadingSpinner message="Generating report..." />
            ) : (
              <div className="table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th>Hours</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((record) => {
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
                          <td>{record.userId.email}</td>
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
      )}
    </div>
  );
};

export default Reports;
