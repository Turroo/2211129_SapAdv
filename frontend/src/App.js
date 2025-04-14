import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import FacultySelectionPage from './components/FacultySelectionPage';
import Dashboard from './components/Dashboard';
import DashboardHome from './components/DashboardHome';
import MyProfile from './components/MyProfile';
import MyProfileEdit from './components/MyProfileEdit';
import Faculties from './components/Faculties';
import SingleFaculty from './components/SingleFaculty';
import SingleCourse from './components/SingleCourse';
import YourReviews from './components/YourReviews';
import YourNotes from './components/YourNotes';
import ChangeFacultyPage from './components/ChangeFacultyPage';
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
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="my-profile/edit" element={<MyProfileEdit />} />
            <Route path="faculties" element={<Faculties />} />
            <Route path="faculties/:facultyId/courses" element={<SingleFaculty />} />
            <Route path="courses/:courseId" element={<SingleCourse />} />
            <Route path="reviews" element={<YourReviews />} />
            <Route path="notes" element={<YourNotes />} />
            <Route path="change-faculty" element={<ChangeFacultyPage />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
