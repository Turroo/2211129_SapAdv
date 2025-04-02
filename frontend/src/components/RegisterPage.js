import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.scss';

const RegisterPage = () => {
  const [user, setUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    birth_date: '',
    city: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({...user, [e.target.name]: e.target.value});
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_AUTH_API_URL}/auth/register`, user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Aggiungi il logo */}
        <img src="/logo.png" alt="SapienzaAdvisor Logo" className="logo" />
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input name="first_name" type="text" value={user.first_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input name="last_name" type="text" value={user.last_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input name="email" type="email" value={user.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input name="password" type="password" value={user.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="birth_date">Birthdate</label>
            <input name="birth_date" type="date" value={user.birth_date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input name="city" type="text" value={user.city} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn">Register</button>
        </form>
        <p>Have an account? <Link to="/">Login</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;
