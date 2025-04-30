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
import CloseIcon from '@mui/icons-material/Close';

const AdminTeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('access_token');
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch all teachers on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_ADMIN_API_URL}/admin/teachers`,
          { headers }
        );
        setTeachers(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error('Error loading teachers:', err);
        setError('Unable to load teachers.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // Filter teachers by search term
  useEffect(() => {
    setFiltered(
      teachers.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, teachers]);

  // Delete a teacher
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you would like to delete this teacher?')) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_ADMIN_API_URL}/admin/teachers/${id}`,
        { headers }
      );
      const remaining = teachers.filter(t => t.id !== id);
      setTeachers(remaining);
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setError('Unable to delete teacher.');
    }
  };

  // Create a new teacher
  const handleCreate = async () => {
    if (!newTeacherName.trim()) {
      setError('Please enter a teacher name.');
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_ADMIN_API_URL}/admin/teachers`,
        { name: newTeacherName.trim() },
        { headers }
      );
      setTeachers([res.data, ...teachers]);
      setNewTeacherName('');
      setShowForm(false);
    } catch (err) {
      console.error('Error creating teacher:', err);
      setError('Unable to create teacher.');
    }
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
        <strong>Teachers</strong>
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button variant="contained" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create a Teacher'}
        </Button>
        <TextField
          placeholder="Search for a teacher"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {showForm && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Teacher Name"
            value={newTeacherName}
            onChange={(e) => setNewTeacherName(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleCreate}>
            Submit
          </Button>
        </Box>
      )}

      <Box sx={{ border: '1px solid #ccc', maxHeight: '60vh', overflowY: 'auto' }}>
        <List disablePadding>
          {filtered.map((t) => (
            <ListItem
              key={t.id}
              sx={{ bgcolor: 'white' }}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleDelete(t.id)}>
                  <CloseIcon sx={{ color: 'red' }} />
                </IconButton>
              }
            >
              <ListItemText primary={t.name} />
            </ListItem>
          ))}
          {filtered.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography>No teachers found.</Typography>
            </Box>
          )}
        </List>
      </Box>
    </Box>
  );
};

export default AdminTeachersPage;
