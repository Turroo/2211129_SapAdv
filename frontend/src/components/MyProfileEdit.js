import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Alert,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const MyProfileEdit = () => {
  const navigate = useNavigate();

  // Stato per i dati utente
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    city: '',
  });

  // Stato per le password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Facoltà (se vuoi popolare un <select> dinamicamente)
  const [faculties, setFaculties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [successPassword, setSuccessPassword] = useState('');

  // Al mount, recupera i dati utente e l'elenco facoltà (se necessario)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        // Recupera i dati utente
        const userRes = await axios.get(`${process.env.REACT_APP_USER_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Recupera l'elenco facoltà se serve
        const facultyRes = await axios.get(`${process.env.REACT_APP_FACULTY_API_URL}/faculties/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFaculties(facultyRes.data || []);

        setUserData({
          first_name: userRes.data.first_name || '',
          last_name: userRes.data.last_name || '',
          birth_date: userRes.data.birth_date || '',
          city: userRes.data.city || '',
        });
      } catch (err) {
        console.error('Errore nel recupero dati utente/facoltà:', err);
        setError('Unable to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handler per aggiornare i dati dell'utente (profilo)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessInfo('');
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `${process.env.REACT_APP_USER_API_URL}/users/update`, 
        {
          first_name: userData.first_name,
          last_name: userData.last_name,
          birth_date: userData.birth_date,
          city: userData.city
          // faculty_id se vuoi permettere di cambiare facoltà
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessInfo('Profile updated successfully.');
    } catch (err) {
      console.error('Errore nell\'aggiornamento profilo:', err);
      setError('Unable to update profile. Please try again.');
    }
  };

  // Handler per aggiornare la password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSuccessPassword('');
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `${process.env.REACT_APP_USER_API_URL}/users/update-password`,
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessPassword('Password updated successfully.');
      // Reset fields
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      console.error('Errore nell\'aggiornamento password:', err);
      setError('Unable to update password. Please check your old password and try again.');
    }
  };

  // Torna alla pagina del profilo
  const goToMyProfile = () => {
    navigate('/dashboard/my-profile');
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '600px', boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">Update Account</Typography>
            <Button variant="text" onClick={goToMyProfile}>
              Your Account
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Form per aggiornare i dati utente */}
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Update Info
          </Typography>
          <Box component="form" onSubmit={handleUpdateProfile} sx={{ mb: 4 }}>
            <TextField 
              label="Name"
              value={userData.first_name}
              onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
              fullWidth
              margin="dense"
            />
            <TextField 
              label="Last Name"
              value={userData.last_name}
              onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
              fullWidth
              margin="dense"
            />
            <TextField 
              label="Birthdate"
              type="date"
              value={userData.birth_date}
              onChange={(e) => setUserData({ ...userData, birth_date: e.target.value })}
              fullWidth
              margin="dense"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField 
              label="City"
              value={userData.city}
              onChange={(e) => setUserData({ ...userData, city: e.target.value })}
              fullWidth
              margin="dense"
            />

            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Update
            </Button>
            {successInfo && <Alert severity="success" sx={{ mt: 2 }}>{successInfo}</Alert>}
          </Box>

          {/* Form per aggiornare la password */}
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Update Password
          </Typography>
          <Box component="form" onSubmit={handleUpdatePassword}>
            <TextField 
              label="Old Password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              fullWidth
              margin="dense"
            />
            <TextField 
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              margin="dense"
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Update
            </Button>
            {successPassword && <Alert severity="success" sx={{ mt: 2 }}>{successPassword}</Alert>}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyProfileEdit;
