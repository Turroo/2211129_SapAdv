import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.scss';

const Dashboard = () => {
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
            <li className="menu-item"><Link to="/dashboard/home">Home</Link></li>
            
            <li className="menu-group-title">Academic</li>
            <li className="menu-item"><Link to="/dashboard/faculties">Faculties</Link></li>
            <li className="menu-item"><Link to="/dashboard/courses">Courses</Link></li>
            
            <li className="menu-group-title">Personal</li>
            <li className="menu-item"><Link to="/dashboard/reviews">Your Reviews</Link></li>
            <li className="menu-item"><Link to="/dashboard/notes">Your Notes</Link></li>
            <li className="menu-item"><Link to="/dashboard/faculty-info">Your Faculty</Link></li>
            
            <li className="menu-group-title">Account</li>
            <li className="menu-item"><Link to="/dashboard/my-profile">My Profile</Link></li>
            <li className="menu-item">
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="dashboard-content">
        {location.pathname === '/dashboard' ? (
          <div className="default-home">
            <h1>Welcome to SapienzaAdvisor Dashboard!</h1>
            <p>Here you can access your courses, reviews, notes, and more.</p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
