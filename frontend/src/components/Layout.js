import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Logo from './Logo';
import './Layout.css';

const Layout = () => {
  const { user, logout, loadUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isEmployee = user?.role === 'employee';
  const isManager = user?.role === 'manager';

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <Logo size="small" />
          <h2>Attendance System</h2>
        </div>
        <div className="navbar-menu">
          {isEmployee && (
            <>
              <Link to="/employee/dashboard" className={location.pathname === '/employee/dashboard' ? 'active' : ''}>
                Dashboard
              </Link>
              <Link to="/employee/mark-attendance" className={location.pathname === '/employee/mark-attendance' ? 'active' : ''}>
                Mark Attendance
              </Link>
              <Link to="/employee/history" className={location.pathname === '/employee/history' ? 'active' : ''}>
                History
              </Link>
              <Link to="/employee/profile" className={location.pathname === '/employee/profile' ? 'active' : ''}>
                Profile
              </Link>
            </>
          )}
          {isManager && (
            <>
              <Link to="/manager/dashboard" className={location.pathname === '/manager/dashboard' ? 'active' : ''}>
                Dashboard
              </Link>
              <Link to="/manager/attendance" className={location.pathname === '/manager/attendance' ? 'active' : ''}>
                All Attendance
              </Link>
              <Link to="/manager/calendar" className={location.pathname === '/manager/calendar' ? 'active' : ''}>
                Calendar
              </Link>
              <Link to="/manager/reports" className={location.pathname === '/manager/reports' ? 'active' : ''}>
                Reports
              </Link>
            </>
          )}
        </div>
        <div className="navbar-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

