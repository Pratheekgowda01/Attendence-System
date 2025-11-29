import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/employee/Dashboard';
import MarkAttendance from './pages/employee/MarkAttendance';
import AttendanceHistory from './pages/employee/AttendanceHistory';
import Profile from './pages/employee/Profile';
import ManagerDashboard from './pages/manager/Dashboard';
import AllAttendance from './pages/manager/AllAttendance';
import TeamCalendar from './pages/manager/TeamCalendar';
import Reports from './pages/manager/Reports';
import Layout from './components/Layout';

const PrivateRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} />;
  }
  
  return children;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} />} />
        
        <Route path="/employee" element={<PrivateRoute allowedRole="employee"><Layout /></PrivateRoute>}>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="mark-attendance" element={<MarkAttendance />} />
          <Route path="history" element={<AttendanceHistory />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/manager" element={<PrivateRoute allowedRole="manager"><Layout /></PrivateRoute>}>
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="attendance" element={<AllAttendance />} />
          <Route path="calendar" element={<TeamCalendar />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="/" element={<Navigate to={isAuthenticated ? (user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard') : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;

