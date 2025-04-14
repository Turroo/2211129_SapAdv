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
  CircularProgress,
  Grid,
  Rating
} from '@mui/material';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const YourReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [coursesMap, setCoursesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedReview, setEditedReview] = useState({
    rating_clarity: 1,
    rating_feasibility: 1,
    rating_availability: 1,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Recupera le review dell'utente
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const reviewsRes = await axios.get(
        `${process.env.REACT_APP_COURSE_API_URL}/courses/my-reviews`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(reviewsRes.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setReviews([]);
        setError('');
      } else {
        console.error('Error fetching reviews:', err);
        setError('Error fetching reviews.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Recupera tutti i corsi per costruire una mappa (id -> nome)
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
    fetchReviews();
    fetchCourses();
  }, []);

  // Quando si clicca su "edit", precompila il form con i dati correnti della review
  const handleEditClick = (review) => {
    setEditingReviewId(review.id);
    setEditedReview({
      rating_clarity: review.rating_clarity,
      rating_feasibility: review.rating_feasibility,
      rating_availability: review.rating_availability,
      comment: review.comment,
    });
  };

  const handleReviewChange = (field, value) => {
    setEditedReview(prev => ({ ...prev, [field]: value }));
  };

  // Aggiorna la review tramite API e aggiorna lo stato localmente
  const handleUpdateReview = async (reviewId) => {
    try {
      setSubmittingReview(true);
      const token = localStorage.getItem('access_token');
      const res = await axios.put(
        `${process.env.REACT_APP_COURSE_API_URL}/courses/reviews/${reviewId}`,
        editedReview,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(prevReviews =>
        prevReviews.map(review => review.id === reviewId ? res.data : review)
      );
      setEditingReviewId(null);
    } catch (err) {
      console.error('Error updating review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Elimina la review e la rimuove immediatamente dalla lista
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `${process.env.REACT_APP_COURSE_API_URL}/courses/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(prevReviews =>
        prevReviews.filter(review => review.id !== reviewId)
      );
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  // Componente per le stelline personalizzate
  const CustomRating = ({ value, readOnly = true, onChange = null, name }) => (
    <Rating
      name={name}
      value={value}
      precision={1}
      readOnly={readOnly}
      onChange={onChange}
      icon={<StarIcon sx={{ color: '#FFD700' }} />}
      emptyIcon={<StarBorderIcon />}
    />
  );

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        <strong>Your Reviews</strong>
      </Typography>
      {reviews.length === 0 ? (
        <Typography variant="body2" align="center">
          No reviews available.
        </Typography>
      ) : (
        <List>
          {reviews.map((review) => (
            <ListItem key={review.id} sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle2">
                  Course: {coursesMap[review.course_id] || review.course_id}
                </Typography>
              </Box>
              {editingReviewId === review.id ? (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="caption">Lessons Clarity:</Typography>
                      <Rating
                        name="rating_clarity"
                        value={editedReview.rating_clarity}
                        precision={1}
                        onChange={(e, newValue) => handleReviewChange('rating_clarity', newValue)}
                        icon={<StarIcon sx={{ color: '#FFD700' }} />}
                        emptyIcon={<StarBorderIcon />}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption">Exam Feasibility:</Typography>
                      <Rating
                        name="rating_feasibility"
                        value={editedReview.rating_feasibility}
                        precision={1}
                        onChange={(e, newValue) => handleReviewChange('rating_feasibility', newValue)}
                        icon={<StarIcon sx={{ color: '#FFD700' }} />}
                        emptyIcon={<StarBorderIcon />}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption">Teacher Availability:</Typography>
                      <Rating
                        name="rating_availability"
                        value={editedReview.rating_availability}
                        precision={1}
                        onChange={(e, newValue) => handleReviewChange('rating_availability', newValue)}
                        icon={<StarIcon sx={{ color: '#FFD700' }} />}
                        emptyIcon={<StarBorderIcon />}
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editedReview.comment}
                    onChange={(e) => handleReviewChange('comment', e.target.value)}
                    sx={{ my: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" onClick={() => handleUpdateReview(review.id)} disabled={submittingReview}>
                      Save
                    </Button>
                    <Button variant="outlined" onClick={() => setEditingReviewId(null)}>
                      Cancel
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption">Lessons Clarity:</Typography>
                      <CustomRating value={review.rating_clarity} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption">Exam Feasibility:</Typography>
                      <CustomRating value={review.rating_feasibility} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption">Teacher Availability:</Typography>
                      <CustomRating value={review.rating_availability} />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(review.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">{review.comment}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <IconButton onClick={() => handleEditClick(review)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteReview(review.id)}>
                      <CloseIcon sx={{ color: 'red' }} />
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

export default YourReviews;
