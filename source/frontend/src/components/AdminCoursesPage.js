import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AdminCoursesPage = () => {
  const { facultyId } = useParams();
  const [facultyName, setFacultyName] = useState('');
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('access_token');
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch faculty name, courses, and teachers
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all faculties to get name
        const facs = await axios.get(
          `${process.env.REACT_APP_ADMIN_API_URL}/admin/faculties`,
          { headers }
        );
        const fac = facs.data.find(f => f.id === parseInt(facultyId));
        setFacultyName(fac ? fac.name : `Faculty ${facultyId}`);

        // Fetch courses for this faculty (404 => empty array)
        const coursesRes = await axios
        .get(
          `${process.env.REACT_APP_ADMIN_API_URL}/admin/faculties/${facultyId}/courses`,
          { headers }
        )
        .catch(err => {
          if (err.response?.status === 404) {
            console.warn('No courses found for this faculty, initializing empty array');
            return { data: [] };
          }
          throw err;
        });
        setCourses(coursesRes.data);
        setFiltered(coursesRes.data);


        // Fetch all teachers
        const teachRes = await axios.get(
          `${process.env.REACT_APP_ADMIN_API_URL}/admin/teachers`,
          { headers }
        );
        setTeachers(teachRes.data);
      } catch (err) {
        console.error(err);
        setError('Unable to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [facultyId]);

  // Filter courses by name
  useEffect(() => {
    setFiltered(
      courses.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, courses]);

  // Delete a course
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you would like to delete this course?')) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_ADMIN_API_URL}/admin/courses/${id}`,
        { headers }
      );
      const remaining = courses.filter(c => c.id !== id);
      setCourses(remaining);
    } catch (err) {
      console.error(err);
      setError('Unable to delete course.');
    }
  };

  // Create new course
  const handleCreate = async () => {
    if (!newCourseName || !newTeacherId) {
      setError('Please fill in both fields.');
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_ADMIN_API_URL}/admin/courses`,
        { name: newCourseName, faculty_id: parseInt(facultyId), teacher_id: parseInt(newTeacherId) },
        { headers }
      );
      setCourses([res.data, ...courses]);
      setNewCourseName('');
      setNewTeacherId('');
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError('Unable to create course.');
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
        <strong>{facultyName}</strong>
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button variant="contained" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create a Course'}
        </Button>
        <TextField
          placeholder="Search for a course"
          size="small"
          variant="outlined"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {showForm && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Course Name"
            value={newCourseName}
            onChange={e => setNewCourseName(e.target.value)}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Teacher</InputLabel>
            <Select
              value={newTeacherId}
              label="Teacher"
              onChange={e => setNewTeacherId(e.target.value)}
            >
              {teachers.map(t => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleCreate}>
            Submit
          </Button>
        </Box>
      )}

      <Box sx={{ border: '1px solid #ccc', maxHeight: '60vh', overflowY: 'auto' }}>
        <List disablePadding>
          {filtered.map(c => {
            const teacher = teachers.find(t => t.id === c.teacher_id);
            return (
              <ListItem key={c.id} sx={{ bgcolor: 'white' }}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleDelete(c.id)}>
                  <CloseIcon sx={{ color: 'red' }} />
                </IconButton>
              }
            >
              <ListItemText
                primary={c.name}
                secondary={
                  teacher ? `Teacher: ${teacher.name}` : 'No teacher assigned'
                }
              />
            </ListItem>

            );
          })}
          {filtered.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography>No courses found.</Typography>
            </Box>
          )}
        </List>
      </Box>
    </Box>
  );
};

export default AdminCoursesPage;
