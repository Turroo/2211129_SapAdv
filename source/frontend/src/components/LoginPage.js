import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';
import { styled } from '@mui/system';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome

const Logo = styled('img')({
  maxWidth: '150px',
  marginBottom: '1.5rem',
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
});

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // state for password visibility
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      // Effettua la richiesta di login
      const response = await axios.post(
        `${process.env.REACT_APP_AUTH_API_URL}/auth/login`,
        { email, password }
      );
      const token = response.data.access_token;
      localStorage.setItem('access_token', token);

      // Recupera i dettagli dell'utente
      const userResponse = await axios.get(
        `${process.env.REACT_APP_USER_API_URL}/users/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const userData = userResponse.data;

      // Se è admin, vado direttamente alla Admin Dashboard
      if (userData.is_admin) {
        navigate('/dashboard/admin/');
      }
      // Altrimenti: se non ha una faculty, gli faccio selezionare la facoltà
      else if (!userData.faculty_id) {
        navigate('/faculty-selection');
      }
      // Altrimenti vado alla normale homepage utente
      else {
        navigate('/dashboard/home');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: '#FFFFFF',
        }}
      >
        <Logo src="/logo.png" alt="SapienzaAdvisor Logo" />
        <Typography component="h1" variant="h5" sx={{ color: '#0D47A1', mb: 2 }}>
          Login
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div style={{ position: 'relative' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={passwordVisible ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <i
              className={`fas fa-eye${passwordVisible ? '-slash' : ''}`}
              onClick={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
              }}
            />
          </div>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2, backgroundColor: '#0D47A1' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          
          {/* New section: Or login with Google or Facebook */}
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Or login with{' '}
            <Link to="#" style={{ textDecoration: 'none' }}>
              <i
                className="fab fa-google"
                style={{ fontSize: '24px', color: '#DB4437', margin: '0 8px', cursor: 'pointer' }}
              ></i>
            </Link>
            <Link to="#" style={{ textDecoration: 'none' }}>
              <i
                className="fab fa-facebook"
                style={{ fontSize: '24px', color: '#1877F2', margin: '0 8px', cursor: 'pointer' }}
              ></i>
            </Link>
          </Typography>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            New account?{' '}
            <Link to="/register" style={{ textDecoration: 'underline', color: '#0D47A1' }}>
              Register
            </Link>
          </Typography>

          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Forgot your password?{' '}
            <Link
              to="#"
              style={{ textDecoration: 'underline', color: '#0D47A1' }}
              onClick={(e) => e.preventDefault()} // Prevent redirection
            >
              Click here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
