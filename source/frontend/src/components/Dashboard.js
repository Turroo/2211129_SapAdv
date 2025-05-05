import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.scss';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handler per il logout
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  // Handler per il click su "Your Faculty"
  const handleMyFacultyClick = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${process.env.REACT_APP_USER_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = response.data;
      if (userData && userData.faculty_id) {
        // Reindirizza alla pagina dei corsi della facoltà dell'utente
        navigate(`/dashboard/faculties/${userData.faculty_id}/courses`);
      } else {
        alert("You are not enrolled in any faculty.");
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
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
            <li className="menu-item">
              <Link to="/dashboard/home">Home</Link>
            </li>
            <li className="menu-group-title">Academic</li>
            <li className="menu-item">
              <Link to="/dashboard/faculties">Faculties</Link>
            </li>
            <li className="menu-group-title">Personal</li>
            <li className="menu-item">
              <Link to="/dashboard/reviews">Your Reviews</Link>
            </li>
            <li className="menu-item">
              <Link to="/dashboard/notes">Your Notes</Link>
            </li>
            <li className="menu-item">
              <Link
                to="#"
                onClick={handleMyFacultyClick}
              >
                Your Faculty
              </Link>
            </li>
            <li className='menu-item'>
              <Link to="/dashboard/change-faculty">Change Faculty</Link>
            </li>
            <li className="menu-group-title">Account</li>
            <li className="menu-item">
              <Link to="/dashboard/my-profile">My Profile</Link>
            </li>
            <li className="menu-item">
              <Link to="/" onClick={handleLogout}>Logout</Link>
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
