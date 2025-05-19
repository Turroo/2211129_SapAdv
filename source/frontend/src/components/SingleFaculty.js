import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const Courses = () => {
  const { facultyId } = useParams();
  const [courses, setCourses] = useState([]);
  const [facultyName, setFacultyName] = useState("");
  const [search, setSearch] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(true); // Stato per i corsi
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `${process.env.REACT_APP_COURSE_API_URL}/courses/faculty/${facultyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourses(response.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setLoadingCourses([]);
        } else {
          console.error("Errore nel recupero dei corsi:", err);
          setError("Errore nel recupero dei corsi."); 
        }
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [facultyId]);

  // Fetch del nome della faculty
  useEffect(() => {
    const fetchFacultyName = async () => {
      try {
        const token = localStorage.getItem('access_token');
        // Fetchiamo tutte le facoltà e filtriamo quella con l'id corrispondente
        const facultyResponse = await axios.get(`${process.env.REACT_APP_FACULTY_API_URL}/faculties/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const faculty = facultyResponse.data.find(f => String(f.id) === facultyId);
        setFacultyName(faculty ? faculty.name : "Courses");
      } catch (err) {
        console.error("Errore nel recupero della facoltà:", err);
        setFacultyName("Courses");
      } finally {
        setLoadingFaculty(false);
      }
    };

    fetchFacultyName();
  }, [facultyId]);

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ mt: 2, p: 2 }}>
      {/* Titolo centrato */}
      <Typography variant="h4" align="center" gutterBottom>
        {loadingFaculty ? "Loading..." : <strong>{facultyName}</strong>}
      </Typography>
      <TextField
        label="Cerca corso"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      {loadingCourses ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      ) : loadingCourses.length === 0 ? (
        <Typography variant="body2">No courses available.</Typography>
      ) : (
        <List>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <ListItem 
                key={course.id} 
                button
                component={Link}
                to={`/dashboard/courses/${course.id}`}
              >
                <ListItemText primary={course.name} />
              </ListItem>
            ))
          ) : (
            <Typography variant="body2">Nessun corso trovato.</Typography>
          )}
        </List>
      )}
    </Box>
  );
};

export default Courses;
