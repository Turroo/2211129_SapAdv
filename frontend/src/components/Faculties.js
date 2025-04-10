import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Faculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [enrolledFaculty, setEnrolledFaculty] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingEnrollment, setLoadingEnrollment] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${process.env.REACT_APP_FACULTY_API_URL}/faculties/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFaculties(response.data);
      } catch (err) {
        console.error("Errore nel recupero delle facoltà:", err);
        setError("Errore nel recupero delle facoltà.");
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  useEffect(() => {
    const fetchEnrolledFaculty = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${process.env.REACT_APP_FACULTY_API_URL}/faculties/my-faculty`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnrolledFaculty(response.data);
      } catch (err) {
        console.error("Errore nel recuperare la facoltà iscritta:", err);
      } finally {
        setLoadingEnrollment(false);
      }
    };

    fetchEnrolledFaculty();
  }, []);

  const filteredFaculties = faculties.filter((faculty) =>
    faculty.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ mt: 2, p: 2 }}>
      {/* Titolo centrato */}
      <Typography variant="h4" align="center" gutterBottom>
        <strong>Faculties</strong>
      </Typography>
      {/* Header con informazioni sull'iscrizione e link all'account */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          You are currently enrolled in: {loadingEnrollment ? "Loading..." : enrolledFaculty ? <strong>{enrolledFaculty.name}</strong> : "None"}
        </Typography>
        <Typography variant="body2">
          <Link to="/dashboard/my-profile" style={{ textDecoration: 'none', color: 'inherit' }}>
            Your account
          </Link>
        </Typography>
      </Box>
      <TextField
        label="Cerca facoltà"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      ) : (
        <List>
          {filteredFaculties.length > 0 ? (
            filteredFaculties.map((faculty) => (
              <ListItem 
                key={faculty.id} 
                button 
                component={Link} 
                to={`/dashboard/faculties/${faculty.id}/courses`}
              >
                <ListItemText primary={faculty.name} />
              </ListItem>
            ))
          ) : (
            <Typography variant="body2">Nessuna facoltà trovata.</Typography>
          )}
        </List>
      )}
    </Box>
  );
};

export default Faculties;
