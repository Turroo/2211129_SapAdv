import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const AdminReportsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [notes, setNotes] = useState([]);
  const [reportsByReview, setReportsByReview] = useState({});
  const [reportsByNote, setReportsByNote] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiBase = process.env.REACT_APP_ADMIN_API_URL;
  const token = localStorage.getItem('access_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const revPromise = axios.get(`${apiBase}/admin/reviews`, { headers })
        .catch(err => err.response?.status === 404 ? { data: [] } : Promise.reject(err));
      const notePromise = axios.get(`${apiBase}/admin/notes`, { headers })
        .catch(err => err.response?.status === 404 ? { data: [] } : Promise.reject(err));
      const reportPromise = axios.get(`${apiBase}/admin/reports`, { headers })
        .catch(err => err.response?.status === 404 ? { data: [] } : Promise.reject(err));

      const [revRes, noteRes, repRes] = await Promise.all([revPromise, notePromise, reportPromise]);
      const revs = Array.isArray(revRes.data) ? revRes.data : [];
      const nts = Array.isArray(noteRes.data) ? noteRes.data : [];
      const reps = Array.isArray(repRes.data) ? repRes.data : [];

      const byReview = {};
      const byNote = {};
      reps.forEach(r => {
        if (r.id_review) {
          byReview[r.id_review] = byReview[r.id_review] || [];
          byReview[r.id_review].push(r);
        }
        if (r.id_note) {
          byNote[r.id_note] = byNote[r.id_note] || [];
          byNote[r.id_note].push(r);
        }
      });

      setReviews(revs.filter(r => byReview[r.id]?.length));
      setNotes(nts.filter(n => byNote[n.id]?.length));
      setReportsByReview(byReview);
      setReportsByNote(byNote);
    } catch (err) {
      console.error(err);
      setError('Unable to load reported items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await axios.delete(`${apiBase}/admin/reviews/${id}`, { headers });
      fetchData();
    } catch {
      setError('Unable to delete review.');
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await axios.delete(`${apiBase}/admin/notes/${id}`, { headers });
      fetchData();
    } catch {
      setError('Unable to delete note.');
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await axios.delete(`${apiBase}/admin/reports/${id}`, { headers });
      fetchData();
    } catch {
      setError('Unable to delete report.');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" textAlign= 'center' gutterBottom><strong>Reports</strong></Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="h5" sx={{ mt: 2 }}>Reported Reviews</Typography>
      {reviews.length > 0 ? reviews.map(review => (
        <Card key={review.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2">Course: {review.course_id}</Typography>
            <Typography variant="subtitle2">User: {review.student_id}</Typography>
            {/* Clarity Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>Clarity:</Typography>
              {[1,2,3,4,5].map(i => (
                i <= review.rating_clarity
                  ? <StarIcon key={i} sx={{ color: 'gold' }} />
                  : <StarBorderIcon key={i} sx={{ color: 'gold' }} />
              ))}
            </Box>
            {/* Feasibility Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>Feasibility:</Typography>
              {[1,2,3,4,5].map(i => (
                i <= review.rating_feasibility
                  ? <StarIcon key={i} sx={{ color: 'gold' }} />
                  : <StarBorderIcon key={i} sx={{ color: 'gold' }} />
              ))}
            </Box>
            {/* Availability Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>Availability:</Typography>
              {[1,2,3,4,5].map(i => (
                i <= review.rating_availability
                  ? <StarIcon key={i} sx={{ color: 'gold' }} />
                  : <StarBorderIcon key={i} sx={{ color: 'gold' }} />
              ))}
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>{review.comment}</Typography>

            <Typography variant="subtitle1"><strong>Reports:</strong></Typography>
            {(reportsByReview[review.id] || []).map(r => (
              <Box key={r.id_report} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography>{r.reason} (by User {r.id_user})</Typography>
                <IconButton edge="end" onClick={() => handleDeleteReport(r.id_report)}>
                  <DeleteIcon sx={{ color: 'red' }} />
                </IconButton>
              </Box>
            ))}
          </CardContent>
          <CardActions>
            <Button size="small" color="error" onClick={() => handleDeleteReview(review.id)}>
              Delete Review
            </Button>
          </CardActions>
        </Card>
      )) : <Typography>No reported reviews.</Typography>}

      <Typography variant="h5" sx={{ mt: 4 }}>Reported Notes</Typography>
      {notes.length > 0 ? notes.map(note => (
        <Card key={note.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2">User: {note.student_id}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{note.description}</Typography>

            <Typography variant="subtitle1"><strong>Reports:</strong></Typography>
            {(reportsByNote[note.id] || []).map(r => (
              <Box key={r.id_report} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography>{r.reason} (by User {r.id_user})</Typography>
                <IconButton edge="end" onClick={() => handleDeleteReport(r.id_report)}>
                  <DeleteIcon sx={{ color: 'red' }} />
                </IconButton>
              </Box>
            ))}
          </CardContent>
          <CardActions>
            <Button size="small" color="error" onClick={() => handleDeleteNote(note.id)}>
              Delete Note
            </Button>
          </CardActions>
        </Card>
      )) : <Typography>No reported notes.</Typography>}
    </Box>
  );
};

export default AdminReportsPage;
