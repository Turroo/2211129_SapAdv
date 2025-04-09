import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import FacultySelectionPage from './components/FacultySelectionPage';
import Dashboard from './components/Dashboard';
import DashboardHome from './components/DashboardHome';
import './styles/_variables.scss'; // Importa il file SCSS con la palette e la regola no-cursor

function App() {
  return (
    <div className="hide-caret">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/faculty-selection" element={<FacultySelectionPage />} />
          <Route path="/dashboard" element={<Dashboard />}>
            {/* Default route: when the URL is "/dashboard", DashboardHome is displayed */}
            <Route index element={<DashboardHome />} />
            {/* Explicit mapping for "/dashboard/home" */}
            <Route path="home" element={<DashboardHome />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
