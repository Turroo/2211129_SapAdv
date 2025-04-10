import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Rating,
  CircularProgress,
  List,
  ListItem,
  Divider,
  Button,
  TextField,
  ListItemText,
} from '@mui/material';
import axios from 'axios';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const SingleCourse = () => {
  const { courseId } = useParams();

  // Stato per i dettagli del corso
  const [courseName, setCourseName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [courseFacultyId, setCourseFacultyId] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [errorCourse, setErrorCourse] = useState('');

  // Stato per le medie dei voti del corso
  const [courseRatings, setCourseRatings] = useState({
    average_clarity: 0,
    average_feasibility: 0,
    average_availability: 0,
  });
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [errorRatings, setErrorRatings] = useState('');

  // Stato per le recensioni del corso
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState('');

  // Stato per il profilo utente (per controllare la faculty dell'utente)
  const [userFacultyId, setUserFacultyId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Stato per il form di aggiunta recensione
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating_clarity: 0,
    rating_feasibility: 0,
    rating_availability: 0,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState('');

  // Funzione per fetchare le recensioni
  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${process.env.REACT_APP_COURSE_API_URL}/courses/${courseId}/reviews`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setReviews([]); // Nessuna recensione presente
      }
      else{console.error('Errore nel recupero delle recensioni:', error);
        setErrorReviews('Errore nel recupero delle recensioni.');}
      
    } finally {
      setLoadingReviews(false);
    }
  };

  // Fetch dettagli del corso e, se il teacher è presente, fetch dei dettagli del teacher
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoadingCourse(true);
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `${process.env.REACT_APP_COURSE_API_URL}/courses/${courseId}/details`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const courseData = response.data;
        setCourseName(courseData.name);
        setCourseFacultyId(courseData.faculty_id);
        // Se abbiamo l'id del teacher, eseguiamo una chiamata aggiuntiva per ottenere nome e cognome
        if (courseData.teacher_id) {
          await fetchTeacherDetails(courseData.teacher_id);
        } else {
          setTeacherName("No teacher assigned");
        }
      } catch (error) {
        console.error('Errore nel recupero dei dettagli del corso:', error);
        setErrorCourse('Errore nel recupero dei dettagli del corso.');
      } finally {
        setLoadingCourse(false);
      }
    };

    const fetchTeacherDetails = async () => {
      try {
        const token = localStorage.getItem('access_token');
        // Assumi che l'endpoint per ottenere i dettagli del teacher sia:
        // GET /teachers/{teacherId} su REACT_APP_TEACHER_API_URL
        const response = await axios.get(
          `${process.env.REACT_APP_COURSE_API_URL}/courses/${courseId}/teacher`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const teacherData = response.data;
        // Se il teacher ha first_name e last_name
        setTeacherName(`${teacherData.name}`);
      } catch (error) {
        console.error("Errore nel recupero dei dettagli del teacher:", error);
        setTeacherName("Unknown");
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  // Fetch medie dei voti
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoadingRatings(true);
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `${process.env.REACT_APP_COURSE_API_URL}/courses/${courseId}/ratings`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourseRatings(response.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Se non si trovano voti, impostiamo i valori a 0.
          setCourseRatings({
            average_clarity: 0,
            average_feasibility: 0,
            average_availability: 0,
          });
        }
        else{console.error('Errore nel recupero delle medie dei voti:', error);
        setErrorRatings('Errore nel recupero dei voti.');}
      } finally {
        setLoadingRatings(false);
      }
    };

    fetchRatings();
  }, [courseId]);

  // Fetch delle recensioni
  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  // Fetch profilo utente
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoadingUser(true);
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `${process.env.REACT_APP_USER_API_URL}/users/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserFacultyId(response.data.faculty_id);
      } catch (error) {
        console.error('Errore nel recupero dei dettagli utente:', error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserDetails();
  }, []);

  // Handler per modificare il form recensione
  const handleReviewChange = (field, value) => {
    setNewReview(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Handler per il submit della recensione
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setErrorSubmit('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${process.env.REACT_APP_COURSE_API_URL}/courses/${courseId}/reviews`,
        newReview,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Dopo la POST, aggiorniamo l'elenco delle recensioni
      await fetchReviews();
      
      // Ripuliamo il form e nascondiamo il form
      setNewReview({ rating_clarity: 0, rating_feasibility: 0, rating_availability: 0, comment: '' });
      setShowReviewForm(false);
      await fetchRatings();
    } catch (error) {
      console.error('Errore durante l\'invio della recensione:', error);
      setErrorSubmit('Errore durante l\'invio della recensione.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Componente custom per le stelline colorate in oro
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

  return (
    <Box sx={{ p: 2 }}>
      {/* Header con posizione relativa */}
      {loadingCourse ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : errorCourse ? (
        <Typography color="error">{errorCourse}</Typography>
      ) : (
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="div">
              <strong>{courseName}</strong>
            </Typography>
            <Typography variant="subtitle1">
              {<strong>{teacherName}</strong> ? `Professor ${teacherName}` : "No teacher assigned"}
            </Typography>
          </Box>
          <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
            <Link to="/dashboard/my-profile" style={{ textDecoration: 'none', color: 'inherit' }}>
              Your account
            </Link>
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Sezione Medie dei voti */}
      <Box sx={{ my: 3 }}>
        {loadingRatings ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : errorRatings ? (
          <Typography color="error">{errorRatings}</Typography>
        ) : (
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Typography variant="body1" align="center">Lessons Clarity</Typography>
              <CustomRating value={courseRatings.average_clarity} />
            </Grid>
            <Grid item>
              <Typography variant="body1" align="center">Exam Feasibility</Typography>
              <CustomRating value={courseRatings.average_feasibility} />
            </Grid>
            <Grid item>
              <Typography variant="body1" align="center">Teacher Availability</Typography>
              <CustomRating value={courseRatings.average_availability} />
            </Grid>
          </Grid>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Sezione Recensioni */}
      <Box sx={{ my: 3 }}>
        <Typography variant="h5" gutterBottom>
          Reviews
        </Typography>
        {loadingReviews ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : errorReviews ? (
          <Typography color="error">{errorReviews}</Typography>
        ) : reviews.length === 0 ? (
          <Typography variant="body2">No reviews available.</Typography>
        ) : (
          <List>
            {reviews.map((rev) => (
              <ListItem key={rev.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ width: '100%', mb: 1 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="caption">Lessons Clarity:</Typography>
                      <CustomRating value={rev.rating_clarity} />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption">Exam Feasibility:</Typography>
                      <CustomRating value={rev.rating_feasibility} />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption">Teacher Availability:</Typography>
                      <CustomRating value={rev.rating_availability} />
                    </Grid>
                  </Grid>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {new Date(rev.created_at).toLocaleDateString()}
                </Typography>
                <Typography variant="body1">{rev.comment}</Typography>
                <Divider sx={{ my: 1, width: '100%' }} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Sezione per aggiungere una recensione */}
      <Box sx={{ textAlign: 'center', my: 2 }}>
        {(!loadingUser && courseFacultyId !== null && userFacultyId !== courseFacultyId) ? (
          <Typography variant="body2" color="textSecondary">
            Can't add reviews because you are not enrolled in this faculty
          </Typography>
        ) : (
          <Button variant="contained" onClick={() => setShowReviewForm(!showReviewForm)}>
            {showReviewForm ? 'Annulla' : 'Add Review'}
          </Button>
        )}
      </Box>

      {showReviewForm && (
        <Box
          component="form"
          onSubmit={handleReviewSubmit}
          sx={{
            maxWidth: 500,
            mx: 'auto',
            p: 2,
            border: '1px solid #ccc',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" align="center" gutterBottom>
            Add Review
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2">Lessons Clarity</Typography>
              <Rating
                name="rating_clarity"
                value={newReview.rating_clarity}
                precision={1}
                onChange={(event, newValue) => handleReviewChange('rating_clarity', newValue)}
                icon={<StarIcon sx={{ color: '#FFD700' }} />}
                emptyIcon={<StarBorderIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2">Exam Feasibility</Typography>
              <Rating
                name="rating_feasibility"
                value={newReview.rating_feasibility}
                precision={1}
                onChange={(event, newValue) => handleReviewChange('rating_feasibility', newValue)}
                icon={<StarIcon sx={{ color: '#FFD700' }} />}
                emptyIcon={<StarBorderIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2">Teacher Availability</Typography>
              <Rating
                name="rating_availability"
                value={newReview.rating_availability}
                precision={1}
                onChange={(event, newValue) => handleReviewChange('rating_availability', newValue)}
                icon={<StarIcon sx={{ color: '#FFD700' }} />}
                emptyIcon={<StarBorderIcon />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Comment"
                value={newReview.comment}
                onChange={(e) => handleReviewChange('comment', e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            {errorSubmit && (
              <Grid item xs={12}>
                <Typography color="error">{errorSubmit}</Typography>
              </Grid>
            )}
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <Button type="submit" variant="contained" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default SingleCourse;
