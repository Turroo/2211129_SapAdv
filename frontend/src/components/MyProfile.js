import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const MyProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [facultyName, setFacultyName] = useState('N/A');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserAndFaculty = async () => {
      try {
        const token = localStorage.getItem('access_token');

        // Recupera i dati dell'utente
        const userRes = await axios.get(`${process.env.REACT_APP_USER_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        // Recupera l'elenco delle facoltà
        const facultyRes = await axios.get(`${process.env.REACT_APP_FACULTY_API_URL}/faculties/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const faculties = facultyRes.data || [];
        const matchedFaculty = faculties.find(fac => fac.id === userRes.data.faculty_id);
        if (matchedFaculty) {
          setFacultyName(matchedFaculty.name);
        }
      } catch (err) {
        console.error('Error fetching user or faculty data:', err);
        setError('Unable to load user data.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndFaculty();
  }, []);

  // Gestisce la cancellazione dell'account con conferma
  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you REALLY sure you want to delete your account? This action is irreversible!'
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${process.env.REACT_APP_USER_API_URL}/users/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Esegui il logout: rimuovi il token e reindirizza alla pagina di login
      localStorage.removeItem('access_token');
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Unable to delete account. Please try again later.');
    }
  };

  // Handler per il logout
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  // Naviga alla pagina di modifica profilo
  const goToEditProfile = () => {
    navigate('/dashboard/my-profile/edit');
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!user) return null;

  return (
    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '500px', boxShadow: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="subtitle1">Birthdate: {user.birth_date}</Typography>
          <Typography variant="subtitle1">City: {user.city}</Typography>
          <Typography variant="subtitle1">Faculty: {facultyName}</Typography>
          
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" sx={{ mr: 2 }} onClick={goToEditProfile}>
              Update your account
            </Button>
            <Button variant="outlined" sx={{ mr: 2 }} color="error" onClick={handleDelete}>
              Delete your account
            </Button>
            <Button variant="text" color="warning" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyProfile;
