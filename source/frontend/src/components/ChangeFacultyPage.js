// ChangeFacultyPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FacultySelectionPage.scss';

const ChangeFacultyPage = () => {
  const [faculties, setFaculties] = useState([]);
  const [currentFaculty, setCurrentFaculty] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Recupera tutte le facoltà
        const facultiesResponse = await axios.get(`${process.env.REACT_APP_FACULTY_API_URL}/faculties`);
        // Recupera la facoltà corrente dell'utente
        let currentFacultyResponse;
        try {
          currentFacultyResponse = await axios.get(
            `${process.env.REACT_APP_FACULTY_API_URL}/faculties/my-faculty`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
          );
        } catch (err) {
          // Se non è iscritto ad alcuna facoltà, currentFaculty rimarrà null
          currentFacultyResponse = { data: null };
        }
        const userCurrentFaculty = currentFacultyResponse.data;
        setCurrentFaculty(userCurrentFaculty);
        // Se l'utente ha già una facoltà, escludila dalla lista delle opzioni
        const availableFaculties = userCurrentFaculty
          ? facultiesResponse.data.filter(faculty => faculty.id !== userCurrentFaculty.id)
          : facultiesResponse.data;
        setFaculties(availableFaculties);
      } catch (err) {
        setError('Unable to load faculties. Please try again later.');
      }
    };
    fetchData();
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
      // Chiamata PUT per cambiare la facoltà utilizzando l'endpoint dedicato
      await axios.put(
        `${process.env.REACT_APP_FACULTY_API_URL}/faculties/change-faculty/${selectedFaculty}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Dopo il cambio, reindirizza alla home della dashboard
      navigate('/dashboard/home');
    } catch (err) {
      setError(err.response?.data?.detail || 'Change faculty failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="faculty-selection-page">
      <div className="faculty-selection-container"
      style={{
        alignItems: 'center',
        }}>
        <img src="/logo.png" alt="SapienzaAdvisor Logo" className="logo" />
        <h1><strong>Change Your Faculty</strong></h1>
        <p className="welcome-message">
          Select a new faculty to change your enrollment.
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
            {loading ? 'Changing...' : 'Confirm Change'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangeFacultyPage;
