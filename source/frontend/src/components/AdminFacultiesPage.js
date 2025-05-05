import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

const AdminFacultiesPage = () => {
  const [faculties, setFaculties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch faculties on mount
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_ADMIN_API_URL}/admin/faculties`,
          { headers }
        );
        setFaculties(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error('Error loading faculties:', err);
        setError('Unable to load faculties.');
      } finally {
        setLoading(false);
      }
    };
    fetchFaculties();
  }, []);

  // Filter on search
  useEffect(() => {
    setFiltered(
      faculties.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, faculties]);

  // Delete faculty
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty?')) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_ADMIN_API_URL}/admin/faculties/${id}`,
        { headers }
      );
      const remaining = faculties.filter(f => f.id !== id);
      setFaculties(remaining);
    } catch (err) {
      console.error('Error deleting faculty:', err);
      setError('Unable to delete faculty.');
    }
  };

  // Create new faculty
  const handleCreate = async () => {
    if (!newFacultyName.trim()) {
      setError('Please enter a faculty name.');
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_ADMIN_API_URL}/admin/faculties`,
        { name: newFacultyName.trim() },
        { headers }
      );
      setFaculties([res.data, ...faculties]);
      setNewFacultyName('');
      setShowForm(false);
    } catch (err) {
      console.error('Error creating faculty:', err);
      setError('Unable to create faculty.');
    }
  };

  // Edit faculty -> navigate to its courses page
  const handleEdit = (id) => {
    navigate(`/dashboard/admin/faculties/${id}/courses`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom textAlign='center'>
        <strong>Faculties</strong>
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button variant="contained" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create a Faculty'}
        </Button>
        <TextField
          placeholder="Search for a faculty"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {showForm && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Faculty Name"
            value={newFacultyName}
            onChange={(e) => setNewFacultyName(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleCreate}>
            Submit
          </Button>
        </Box>
      )}

      <Box sx={{ border: '1px solid #ccc', maxHeight: '60vh', overflowY: 'auto' }}>
        <List disablePadding>
          {filtered.map(f => (
            <ListItem
              key={f.id}
              sx={{ bgcolor: 'white' }}
              secondaryAction={
                <>
                  <IconButton edge="end" onClick={() => handleEdit(f.id)}>
                    <EditIcon/>
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDelete(f.id)}>
                    <CloseIcon sx={{ color: 'red' }} />
                  </IconButton>
                </>
              }
            >
              <ListItemText primary={f.name} />
            </ListItem>
          ))}
          {filtered.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography>No faculties found.</Typography>
            </Box>
          )}
        </List>
      </Box>
    </Box>
  );
};

export default AdminFacultiesPage;
