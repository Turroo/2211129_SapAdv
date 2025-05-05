// src/components/AdminDashboard.js
import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.scss';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo-container">
          <img src="/logo_white.png" alt="SapienzaAdvisor Logo" className="logo" />
        </div>
        <nav>
          <ul>
            <li className="menu-group-title">Main</li>
            <li className={`menu-item${location.pathname === '/dashboard/admin' ? ' active' : ''}`}>
              <Link to=".">Home</Link>
            </li>

            <li className="menu-group-title">Users</li>
            <li className={`menu-item${location.pathname.endsWith('/users') ? ' active' : ''}`}>
              <Link to="users">User Accounts</Link>
            </li>
            <li className={`menu-item${location.pathname.endsWith('/reports') ? ' active' : ''}`}>
              <Link to="reports">Reports</Link>
            </li>

            <li className="menu-group-title">Academic</li>
            <li className={`menu-item${location.pathname.endsWith('/faculties') ? ' active' : ''}`}>
              <Link to="faculties">Faculties and Courses</Link>
            </li>
            <li className={`menu-item${location.pathname.endsWith('/teachers') ? ' active' : ''}`}>
              <Link to="teachers">Teachers</Link>
            </li>

            <li className="menu-group-title">Account</li>
            <li className="menu-item">
              <span onClick={handleLogout} style={{ cursor: 'pointer', color: 'white' }}>
                Logout
              </span>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-content">
        {/* Outlet renderizza AdminDashboardHome per index e le altre pagine per le sotto-route */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
