// src/App.js
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

import AdminDashboard from './components/AdminDashboard';
import AdminDashboardHome from './components/AdminDashboardHome';
import AdminUsersPage from './components/AdminUsersPage';
import AdminCoursesPage from './components/AdminCoursesPage';
import AdminFacultiesPage from './components/AdminFacultiesPage';
import AdminTeachersPage from './components/AdminTeachersPage';
import AdminReportsPage from './components/AdminReportsPage';

import './styles/_variables.scss';

function App() {
  return (
    <div className="hide-caret">
      <Router>
        <Routes>
          {/* Pubbliche */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/faculty-selection" element={<FacultySelectionPage />} />

          {/* User Dashboard */}
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
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

          {/* Admin Dashboard */}
          <Route path="/dashboard/admin/*" element={<AdminDashboard />}>
            <Route index element={<AdminDashboardHome />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="faculties/:facultyId/courses" element={<AdminCoursesPage />} />
            <Route path="faculties" element={<AdminFacultiesPage />} />
            <Route path="teachers" element={<AdminTeachersPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
