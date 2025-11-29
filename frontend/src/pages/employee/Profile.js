import React from 'react';
import { useAuthStore } from '../../store/authStore';
import '../../components/Card.css';
import './Profile.css';

const Profile = () => {
  const { user } = useAuthStore();

  return (
    <div className="profile-container">
      <h1 className="page-title">👤 My Profile</h1>
      
      <div className="card profile-card">
        <div className="card-header">
          <h3 className="card-title">Profile Information</h3>
        </div>
        <div className="card-body">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-role">{user?.role?.toUpperCase()}</p>
          </div>

          <div className="profile-details">
            <div className="detail-group">
              <div className="detail-item">
                <div className="detail-icon">👤</div>
                <div className="detail-content">
                  <label className="detail-label">Name</label>
                  <div className="detail-value">{user?.name}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">📧</div>
                <div className="detail-content">
                  <label className="detail-label">Email</label>
                  <div className="detail-value">{user?.email}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">🆔</div>
                <div className="detail-content">
                  <label className="detail-label">Employee ID</label>
                  <div className="detail-value">{user?.employeeId}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">🏢</div>
                <div className="detail-content">
                  <label className="detail-label">Department</label>
                  <div className="detail-value">{user?.department || 'Not specified'}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">👔</div>
                <div className="detail-content">
                  <label className="detail-label">Role</label>
                  <div className="detail-value role-badge">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
