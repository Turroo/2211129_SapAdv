import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FacultySelectionPage.scss';

const FacultySelectionPage = () => {
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Carica l'elenco delle facoltà all'avvio del componente
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_FACULTY_API_URL}/faculties`);
        console.log(response.data);
        setFaculties(response.data);
      } catch (err) {
        setError('Unable to load faculties. Please try again later.');
      }
    };
    fetchFaculties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFaculty) {
      setError('Please select a faculty.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${process.env.REACT_APP_FACULTY_API_URL}/faculties/enroll/${selectedFaculty}`,
        {}, // corpo della richiesta, se necessario
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Dopo l'iscrizione, reindirizza alla dashboard
      navigate('/dashboard/home');
    } catch (err) {
      setError(err.response?.data?.detail || 'Enrollment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="faculty-selection-page">
      <div className="faculty-selection-container">
        <img src="/logo.png" alt="SapienzaAdvisor Logo" className="logo" />
        <h1>Select Your Faculty</h1>
        <p className="welcome-message">
          Thanks for registering to Sapienza Advisor. Please select the faculty you want to enroll in.
        </p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="faculty-select">Faculty:</label>
            <select
              id="faculty-select"
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              required
            >
              <option value="">-- Choose Faculty --</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Enrolling...' : 'Confirm Faculty'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FacultySelectionPage;
