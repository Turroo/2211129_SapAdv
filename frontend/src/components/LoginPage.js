import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.scss';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const response = await axios.post(`${process.env.REACT_APP_AUTH_API_URL}/auth/login`, {
        email,
        password,
      });
      const token = response.data.access_token;
      localStorage.setItem('access_token', token);

      // Recupera i dettagli dell'utente (endpoint /me del servizio user)
      const userResponse = await axios.get(`${process.env.REACT_APP_USER_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = userResponse.data;
      
      // Se il faculty_id non è impostato, reindirizza alla pagina di selezione della facoltà
      if (!userData.faculty_id) {
        navigate('/faculty-selection');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <img src="/logo.png" alt="SapienzaAdvisor Logo" className="logo" />
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required 
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>New account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;
