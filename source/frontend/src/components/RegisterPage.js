import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Make sure Font Awesome is imported
import './RegisterPage.scss';

const RegisterPage = () => {
  const [user, setUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birth_date: '',
    city: ''
  });
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const [passwordLengthValid, setPasswordLengthValid] = useState(false);
  const [passwordHasLetter, setPasswordHasLetter] = useState(false);
  const [passwordHasNumber, setPasswordHasNumber] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });

    // Email validation
    if (name === 'email') {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      setEmailValid(emailRegex.test(value));
    }

    // Password validation
    if (name === 'password') {
      const passwordLength = value.length >= 6;
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);

      setPasswordLengthValid(passwordLength);
      setPasswordHasLetter(hasLetter);
      setPasswordHasNumber(hasNumber);
      setPasswordValid(passwordLength && hasLetter && hasNumber);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (user.password !== user.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Register user
      await axios.post(`${process.env.REACT_APP_AUTH_API_URL}/auth/register`, user);
      // After registration, redirect to login page
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return (
    <div className="register-page">
      <div className="register-container">
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
            <input 
              name="email" 
              type="email" 
              value={user.email} 
              onChange={handleChange} 
              required 
              className={emailValid ? '' : 'invalid'} 
            />
            {!emailValid && <div className="error-message">Invalid email format</div>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-container">
              <input 
                name="password" 
                type={passwordVisible ? 'text' : 'password'} 
                value={user.password} 
                onChange={handleChange} 
                required 
                className={passwordValid ? '' : 'invalid'} 
              />
              <i 
                className={`fas fa-eye${passwordVisible ? '-slash' : ''} eye-icon`} 
                onClick={togglePasswordVisibility}
              />
            </div>
            {!passwordValid && <div className="error-message">Password must be at least 6 characters, containing letters and numbers</div>}
            <div className="password-requirements">
              <ul>
                <li className={passwordLengthValid ? 'valid' : ''}>At least 6 characters</li>
                <li className={passwordHasLetter ? 'valid' : ''}>Contains at least one letter</li>
                <li className={passwordHasNumber ? 'valid' : ''}>Contains at least one number</li>
              </ul>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-container">
              <input 
                name="confirmPassword" 
                type={confirmPasswordVisible ? 'text' : 'password'} 
                value={user.confirmPassword} 
                onChange={handleChange} 
                required 
              />
              <i 
                className={`fas fa-eye${confirmPasswordVisible ? '-slash' : ''} eye-icon`} 
                onClick={toggleConfirmPasswordVisibility}
              />
            </div>
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
