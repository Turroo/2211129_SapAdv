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
import MoreVertIcon from '@mui/icons-material/MoreVert';

const SingleCourse = () => {
  const { courseId } = useParams();

  // Stati per i dettagli del corso
  const [courseName, setCourseName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [courseFacultyId, setCourseFacultyId] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [errorCourse, setErrorCourse] = useState('');

  // Stati per l'upload delle note
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNoteFile, setNewNoteFile] = useState(null);
  const [newNoteDescription, setNewNoteDescription] = useState('');
  const [uploadingNote, setUploadingNote] = useState(false);
  const [errorUploadNote, setErrorUploadNote] = useState('');

  // Stati per le medie dei voti del corso
  const [courseRatings, setCourseRatings] = useState({
    average_clarity: 0,
    average_feasibility: 0,
    average_availability: 0,
  });
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [errorRatings, setErrorRatings] = useState('');

  // Stati per le recensioni del corso (sola lettura)
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState('');

  // Stati per le note con i dettagli aggiuntivi (sola lettura)
  const [notesWithDetails, setNotesWithDetails] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [errorNotes, setErrorNotes] = useState('');

  // Stato per il profilo utente
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

  // Stati per il form di rating della nota (Note Rating)
  const [noteRatingFormOpen, setNoteRatingFormOpen] = useState(null);
  const [noteRatingValue, setNoteRatingValue] =useState(1);
  const [noteRatingComment, setNoteRatingComment] = useState('');

  // Stati per la segnalazione (report)
  // Per le recensioni:
  const [reportedReviews, setReportedReviews] = useState({});
  const [reviewReportFormOpen, setReviewReportFormOpen] = useState(null);
  const [newReviewReportReason, setNewReviewReportReason] = useState('');
  // Per le note:
  const [reportedNotes, setReportedNotes] = useState({});
  const [noteReportFormOpen, setNoteReportFormOpen] = useState(null);
  const [newNoteReportReason, setNewNoteReportReason] = useState('');

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

  // Funzione per fetchare le note con i dettagli aggiuntivi
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

  // Handler per l'upload della nota
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setUploadingNote(true);
    setErrorUploadNote('');
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('course_id', courseId);
      formData.append('description', newNoteDescription);
      formData.append('file', newNoteFile);
      await axios.post(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      await fetchNotesWithDetails();
      setNewNoteFile(null);
      setNewNoteDescription('');
      setShowNoteForm(false);
    } catch (error) {
      console.error('Errore durante l\'upload della nota:', error);
      setErrorUploadNote('Errore durante l\'upload della nota.');
    } finally {
      setUploadingNote(false);
    }
  };

  // Fetch dei dettagli del corso e del teacher
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

    const fetchTeacherDetails = async (teacherId) => {
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

  // Fetch del profilo utente
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

  // Handler per modificare il form della review (solo per aggiunta; dalla SingleCourse non si possono modificare/eliminare review)
  const handleReviewChange = (field, value) => {
    setNewReview(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Handler per il submit della review
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

  const handleDownloadNote = async (noteId) => {
    try {
      // Recupera il token JWT dal localStorage
      const token = localStorage.getItem('access_token');
  
      // Effettua la richiesta GET all'endpoint di download con responseType 'blob'
      const response = await axios.get(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/download/${noteId}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
  
      // Imposta un nome di default per il file
      let fileName = 'downloaded_note';
  
      // Estrae il nome del file dall'header Content-Disposition usando un'espressione regolare più robusta
      const disposition = response.headers['content-disposition'];
      if (disposition) {
        // Questa regex gestisce sia casi con che senza virgolette
        const fileNameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch != null && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }
  
      // Crea un URL oggetto per il blob
      const blobUrl = window.URL.createObjectURL(response.data);
  
      // Crea un elemento <a> temporaneo e attiva il download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
  
      // Rimuove l'elemento e revoca l'URL per liberare le risorse
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Errore durante il download della nota:', error);
    }
  };
  
  

  // Handler per il submit del rating della nota (Note Rating)
  const handleNoteRatingSubmit = async (e, noteId) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const payload = { note_id: noteId, rating: noteRatingValue, comment: noteRatingComment };
      await axios.post(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/ratings`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchNotesWithDetails();
      setNoteRatingValue(0);
      setNoteRatingComment('');
      setNoteRatingFormOpen(null);
    } catch (error) {
      console.error("Errore nel rating della nota:", error);
    }
  };

  // Handler per il submit del report di una review
  const handleReviewReportSubmit = async (e, reviewId) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const payload = { id_review: reviewId, reason: newReviewReportReason };
      await axios.post(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/reports/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReportedReviews(prev => ({ ...prev, [reviewId]: true }));
      setReviewReportFormOpen(null);
      setNewReviewReportReason('');
    } catch (error) {
      console.error("Error reporting review:", error);
    }
  };

  // Handler per il submit del report di una nota
  const handleNoteReportSubmit = async (e, noteId) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const payload = { id_note: noteId, reason: newNoteReportReason };
      await axios.post(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/reports/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReportedNotes(prev => ({ ...prev, [noteId]: true }));
      setNoteReportFormOpen(null);
      setNewNoteReportReason('');
    } catch (error) {
      console.error("Error reporting note:", error);
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

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
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

      {/* Sezione Reviews (solo lettura) */}
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
              <ListItem key={rev.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
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
                {currentUser && currentUser.faculty_id === courseFacultyId && (
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                    {!reportedReviews[rev.id] && (
                      <IconButton onClick={() => setReviewReportFormOpen(rev.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Box>
                )}
                <Divider sx={{ my: 1, width: '100%' }} />
                {reviewReportFormOpen === rev.id && (
                  <Box component="form" onSubmit={(e) => handleReviewReportSubmit(e, rev.id)} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="Report reason"
                      value={newReviewReportReason}
                      onChange={(e) => setNewReviewReportReason(e.target.value)}
                      fullWidth
                    />
                    <Button type="submit" variant="contained" size="small" sx={{ mt: 1 }}>
                      Report
                    </Button>
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Sezione per aggiungere una review */}
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
              <ListItem key={note.id} sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
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
                {/* Pulsante per segnalare la nota */}
                {currentUser && currentUser.faculty_id === courseFacultyId && (
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                    {!reportedNotes[note.id] && (
                      <IconButton onClick={() => setNoteReportFormOpen(noteReportFormOpen === note.id ? null : note.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Box>
                )}
                {noteReportFormOpen === note.id && (
                  <Box component="form" onSubmit={(e) => handleNoteReportSubmit(e, note.id)} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="Report reason"
                      value={newNoteReportReason}
                      onChange={(e) => setNewNoteReportReason(e.target.value)}
                      fullWidth
                    />
                    <Button type="submit" variant="contained" size="small" sx={{ mt: 1 }}>
                      Report
                    </Button>
                  </Box>
                )}

                {/* Pulsante per aggiungere un Note Rating:
                    Compare solo se la nota appartiene al corso della stessa facoltà e l'utente NON è il proprietario */}
                {currentUser && currentUser.faculty_id === courseFacultyId && currentUser.id !== note.student_id && (
                  <>
                    { note.ratings.some(r => r.student_id === currentUser.id) ? (
                      <Typography variant="body2" color="textSecondary">
                        You have already rated this note.
                      </Typography>
                    ) : (
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                        <Button variant="outlined" onClick={() => setNoteRatingFormOpen(note.id)}>
                          Rate Note
                        </Button>
                      </Box>
                    )}
                  </>
                )}
                {noteRatingFormOpen === note.id && (
                  <Box component="form" onSubmit={(e) => handleNoteRatingSubmit(e, note.id)} sx={{ mt: 1, width: '100%' }}>
                    <Rating
                      name={`note-rating-${note.id}`}
                      value={noteRatingValue}
                      precision={1}
                      onChange={(e, newValue) => setNoteRatingValue(newValue)}
                      icon={<StarIcon sx={{ color: '#FFD700' }} />}
                      emptyIcon={<StarBorderIcon />}
                    />
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="Leave a comment"
                      value={noteRatingComment}
                      onChange={(e) => setNoteRatingComment(e.target.value)}
                      fullWidth
                      sx={{ mt: 1 }}
                    />
                    <Button type="submit" variant="contained" size="small" sx={{ mt: 1 }}>
                      Submit Rating
                    </Button>
                  </Box>
                )}
                <Divider sx={{ my: 1, width: '100%' }} />
              </ListItem>
            ))}
          </List>
        )}
        <Box sx={{ textAlign: 'center', my: 2 }}>
          {currentUser && courseFacultyId !== null && currentUser.faculty_id === courseFacultyId ? (
            <Button variant="contained" onClick={() => setShowNoteForm(!showNoteForm)}>
              {showNoteForm ? 'Cancel' : 'Add Note'}
            </Button>
          ) : (
            <Typography variant="body2" color="textSecondary">
              You are not allowed to add notes for this course.
            </Typography>
          )}
        </Box>
        {showNoteForm && (
          <Box
            component="form"
            onSubmit={handleNoteSubmit}
            sx={{
              maxWidth: 500,
              mx: 'auto',
              p: 2,
              border: '1px solid #ccc',
              borderRadius: 2,
            }}
          >
            <TextField
              label="Description"
              value={newNoteDescription}
              onChange={(e) => setNewNoteDescription(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <input
              type="file"
              onChange={(e) => setNewNoteFile(e.target.files[0])}
              style={{ marginBottom: '16px' }}
            />
            {errorUploadNote && (
              <Typography color="error" variant="caption" display="block">
                {errorUploadNote}
              </Typography>
            )}
            <Button type="submit" variant="contained" disabled={uploadingNote}>
              {uploadingNote ? 'Uploading...' : 'Submit Note'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SingleCourse;
