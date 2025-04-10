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
  IconButton,
} from '@mui/material';
import axios from 'axios';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DownloadIcon from '@mui/icons-material/Download';

const SingleCourse = () => {
  const { courseId } = useParams();

  // Stati per i dettagli del corso
  const [courseName, setCourseName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [courseFacultyId, setCourseFacultyId] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [errorCourse, setErrorCourse] = useState('');

  // Stati per le medie dei voti del corso
  const [courseRatings, setCourseRatings] = useState({
    average_clarity: 0,
    average_feasibility: 0,
    average_availability: 0,
  });
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [errorRatings, setErrorRatings] = useState('');

  // Stati per le recensioni del corso
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState('');

  // Stati per le note con i dettagli aggiuntivi (average rating e le valutazioni per ogni nota)
  const [notesWithDetails, setNotesWithDetails] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [errorNotes, setErrorNotes] = useState('');

  // Stato per il profilo utente (per verificare la faculty dell'utente)
  const [userFacultyId, setUserFacultyId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

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

  // Stati per il form di rating nota (simile al Review Form)
  const [noteRatingFormOpen, setNoteRatingFormOpen] = useState(null);
  const [newNoteRating, setNewNoteRating] = useState(0);
  const [newNoteComment, setNewNoteComment] = useState('');

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
        setReviews([]);
      } else {
        console.error('Errore nel recupero delle recensioni:', error);
        setErrorReviews('Errore nel recupero delle recensioni.');
      }
    } finally {
      setLoadingReviews(false);
    }
  };

  // Funzione per fetchare le note e per ciascuna ottenere average rating e le valutazioni
  const fetchNotesWithDetails = async () => {
    try {
      setLoadingNotes(true);
      const token = localStorage.getItem('access_token');
      const notesResponse = await axios.get(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const notes = notesResponse.data;
      const notesDetailed = await Promise.all(
        notes.map(async (note) => {
          let average_rating = 0;
          let ratings = [];
          try {
            const avgResponse = await axios.get(
              `${process.env.REACT_APP_NOTES_API_URL}/notes/notes/${note.id}/average-rating`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            average_rating = avgResponse.data.average_rating || 0;
          } catch (error) {
            if (!(error.response && error.response.status === 404)) {
              console.error(`Errore per la nota ${note.id} average rating:`, error);
            }
            average_rating = 0;
          }
          try {
            const ratingsResponse = await axios.get(
              `${process.env.REACT_APP_NOTES_API_URL}/notes/notes/${note.id}/reviews`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            ratings = ratingsResponse.data;
          } catch (error) {
            if (!(error.response && error.response.status === 404)) {
              console.error(`Errore per la nota ${note.id} reviews:`, error);
            }
            ratings = [];
          }
          return { ...note, average_rating, ratings };
        })
      );
      setNotesWithDetails(notesDetailed);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setNotesWithDetails([]);
      } else {
        console.error('Errore nel recupero delle note:', error);
        setErrorNotes('Errore nel recupero delle note.');
      }
    } finally {
      setLoadingNotes(false);
    }
  };

  // Fetch dei dettagli del corso e del teacher tramite l'endpoint /courses/{courseId}/teacher
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
        const response = await axios.get(
          `${process.env.REACT_APP_COURSE_API_URL}/courses/${courseId}/teacher`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const teacherData = response.data;
        if (teacherData.first_name && teacherData.last_name) {
          setTeacherName(`${teacherData.first_name} ${teacherData.last_name}`);
        } else if (teacherData.name) {
          setTeacherName(teacherData.name);
        } else {
          setTeacherName("Unknown");
        }
      } catch (error) {
        console.error("Errore nel recupero dei dettagli del teacher:", error);
        setTeacherName("Unknown");
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  // Fetch delle medie dei voti del corso
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoadingRatings(true);
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `${process.env.REACT_APP_COURSE_API_URL}/courses/${courseId}/ratings?timestamp=${new Date().getTime()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourseRatings(response.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setCourseRatings({
            average_clarity: 0,
            average_feasibility: 0,
            average_availability: 0,
          });
        } else {
          console.error('Errore nel recupero delle medie dei voti:', error);
          setErrorRatings('Errore nel recupero dei voti.');
        }
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

  // Fetch delle note con dettagli
  useEffect(() => {
    fetchNotesWithDetails();
  }, [courseId]);

  // Fetch del profilo utente, salvando anche l'oggetto completo
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
        setCurrentUser(response.data);
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
      await fetchReviews();
      await fetchRatings();
      setNewReview({ rating_clarity: 0, rating_feasibility: 0, rating_availability: 0, comment: '' });
      setShowReviewForm(false);
    } catch (error) {
      console.error('Errore durante l\'invio della recensione:', error);
      setErrorSubmit('Errore durante l\'invio della recensione.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handler per il download di una nota
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
      console.error('Errore durante il download della nota:', error);
    }
  };

  // Handler per il submit del rating della nota (simile al Review Form)
  const handleNoteRatingSubmit = async (e, noteId) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const payload = { note_id: noteId, rating: newNoteRating, comment: newNoteComment };
      await axios.post(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/ratings`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchNotesWithDetails();
      setNewNoteRating(0);
      setNewNoteComment('');
      setNoteRatingFormOpen(null);
    } catch (error) {
      console.error("Errore nel rating della nota:", error);
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
              {teacherName ? `Professor ${teacherName}` : "No teacher assigned"}
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
              <CustomRating value={courseRatings.average_clarity || 0} />
            </Grid>
            <Grid item>
              <Typography variant="body1" align="center">Exam Feasibility</Typography>
              <CustomRating value={courseRatings.average_feasibility || 0} />
            </Grid>
            <Grid item>
              <Typography variant="body1" align="center">Teacher Availability</Typography>
              <CustomRating value={courseRatings.average_availability || 0} />
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
                      <CustomRating value={rev.rating_clarity || 0} />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption">Exam Feasibility:</Typography>
                      <CustomRating value={rev.rating_feasibility || 0} />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption">Teacher Availability:</Typography>
                      <CustomRating value={rev.rating_availability || 0} />
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
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <Button type="submit" variant="contained" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Sezione Notes */}
      <Box sx={{ my: 3 }}>
        <Typography variant="h5" gutterBottom>
          Notes
        </Typography>
        {loadingNotes ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : errorNotes ? (
          <Typography color="error">{errorNotes}</Typography>
        ) : notesWithDetails.length === 0 ? (
          <Typography variant="body2">No notes available.</Typography>
        ) : (
          <List>
            {notesWithDetails.map((note) => (
              <ListItem key={note.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                {/* Header della nota: nome, average rating e download */}
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" component="div">
                    <strong>{note.description}</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CustomRating value={note.average_rating || 0} />
                    <IconButton onClick={() => handleDownloadNote(note.id)}>
                      <DownloadIcon />
                    </IconButton>
                  </Box>
                </Box>
                {/* Dettaglio delle valutazioni della nota */}
                {note.ratings.length > 0 ? (
                  note.ratings.map((r, index) => (
                    <Box key={index} sx={{ mt: 1 }}>
                      <Typography variant="caption" display="block">
                        {new Date(r.created_at).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" display="block" color="textSecondary">
                        {r.comment || "No comment"}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption" color="textSecondary">
                    No ratings for this note.
                  </Typography>
                )}
                <Divider sx={{ my: 1, width: '100%' }} />
                {/* Sezione per il rating della nota (simile al Review Form) */}
                {currentUser &&
                  courseFacultyId !== null &&
                  currentUser.faculty_id === courseFacultyId &&
                  note.student_id !== currentUser.id && (
                    <>
                      <Button variant="text" onClick={() => setNoteRatingFormOpen(note.id)}>
                        Rate Note
                      </Button>
                      {noteRatingFormOpen === note.id && (
                        <Box component="form" onSubmit={(e) => handleNoteRatingSubmit(e, note.id)} sx={{ mt: 1, width: '100%' }}>
                          <Rating
                            name={`note-rating-${note.id}`}
                            value={newNoteRating}
                            precision={1}
                            onChange={(event, newValue) => setNewNoteRating(newValue)}
                            icon={<StarIcon sx={{ color: '#FFD700' }} />}
                            emptyIcon={<StarBorderIcon />}
                          />
                          <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Add comment"
                            value={newNoteComment}
                            onChange={(e) => setNewNoteComment(e.target.value)}
                            sx={{ ml: 1 }}
                          />
                          <Button type="submit" variant="contained" size="small" sx={{ ml: 1 }}>
                            Submit
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
              </ListItem>
            ))}
          </List>
        )}
        <Box sx={{ textAlign: 'center', my: 2 }}>
          <Button variant="contained">Add Note</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SingleCourse;
