// YourNotes.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  Divider,
  IconButton,
  Button,
  TextField,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';

const YourNotes = () => {
  const [notes, setNotes] = useState([]);
  const [coursesMap, setCoursesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedNoteDescription, setEditedNoteDescription] = useState('');

  // Recupera le note create dall'utente
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/usr/my-notes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setNotes([]);
        setError('');
      } else {
        console.error('Error fetching notes:', err);
        setError('Error fetching notes.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Recupera tutti i corsi per creare una mappa (id -> nome)
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const coursesRes = await axios.get(
        `${process.env.REACT_APP_COURSE_API_URL}/courses/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const courses = coursesRes.data;
      const map = {};
      courses.forEach(course => {
        map[course.id] = course.name;
      });
      setCoursesMap(map);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchCourses();
  }, []);

  const handleEditClick = (note) => {
    setEditingNoteId(note.id);
    setEditedNoteDescription(note.description);
  };

  // Modifica la nota inviando il valore di "description" come query parameter
  const handleUpdateNote = async (noteId) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/${noteId}?description=${encodeURIComponent(editedNoteDescription)}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId ? { ...note, description: editedNoteDescription } : note
        )
      );
      setEditingNoteId(null);
    } catch (err) {
      console.error('Error updating note:', err);
    }
  };
  

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/${noteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(prevNotes =>
        prevNotes.filter(note => note.id !== noteId)
      );
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handleDownloadNote = async (noteId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/download/${noteId}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );
      let fileName = 'note.pdf';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const fileNameMatch = disposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch.length > 1) {
          fileName = fileNameMatch[1];
        }
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading note:', error);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" align='center' gutterBottom>
        <strong>Your Notes</strong>
      </Typography>
      {notes.length === 0 ? (
        <Typography variant="body2" align="center">
          No notes available.
        </Typography>
      ) : (
        <List>
          {notes.map((note) => (
            <ListItem key={note.id} sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle2">
                  Course: {coursesMap[note.course_id] || note.course_id}
                </Typography>
              </Box>
              {editingNoteId === note.id ? (
                <>
                  <TextField
                    fullWidth
                    value={editedNoteDescription}
                    onChange={(e) => setEditedNoteDescription(e.target.value)}
                    sx={{ my: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" onClick={() => handleUpdateNote(note.id)}>Save</Button>
                    <Button variant="outlined" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="body1">{note.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <IconButton onClick={() => handleEditClick(note)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteNote(note.id)}>
                      <CloseIcon sx={{ color: 'red' }} />
                    </IconButton>
                    <IconButton onClick={() => handleDownloadNote(note.id)}>
                      <DownloadIcon />
                    </IconButton>
                  </Box>
                </>
              )}
              <Divider sx={{ width: '100%', my: 1 }} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default YourNotes;
