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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

const SingleCourse = () => {
  const { courseId } = useParams();

  // Corso e teacher
  const [courseName, setCourseName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [courseFacultyId, setCourseFacultyId] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [errorCourse, setErrorCourse] = useState('');

  // Medie voti
  const [courseRatings, setCourseRatings] = useState({
    average_clarity: 0,
    average_feasibility: 0,
    average_availability: 0,
  });
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [errorRatings, setErrorRatings] = useState('');

  // Recensioni
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState('');

  // Note + dettagli
  const [notesWithDetails, setNotesWithDetails] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [errorNotes, setErrorNotes] = useState('');

  // Utente
  const [currentUser, setCurrentUser] = useState(null);
  const [userFacultyId, setUserFacultyId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Stato form aggiungi review
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating_clarity: 0,
    rating_feasibility: 0,
    rating_availability: 0,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState('');

  // Stato form upload note
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNoteFile, setNewNoteFile] = useState(null);
  const [newNoteDescription, setNewNoteDescription] = useState('');
  const [uploadingNote, setUploadingNote] = useState(false);
  const [errorUploadNote, setErrorUploadNote] = useState('');

  // Report
  const [reviewReportFormOpen, setReviewReportFormOpen] = useState(null);
  const [newReviewReportReason, setNewReviewReportReason] = useState('');
  const [reportedReviews, setReportedReviews] = useState({});
  const [noteReportFormOpen, setNoteReportFormOpen] = useState(null);
  const [newNoteReportReason, setNewNoteReportReason] = useState('');
  const [reportedNotes, setReportedNotes] = useState({});

  // Rating delle note
  const [noteRatingFormOpen, setNoteRatingFormOpen] = useState(null);
  const [noteRatingValue, setNoteRatingValue] = useState(1);
  const [noteRatingComment, setNoteRatingComment] = useState('');

  // Stelline dorate
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

  // — fetch corso + teacher —
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoadingCourse(true);
        const token = localStorage.getItem('access_token');
        const { data: courseData } = await axios.get(
          `${process.env.REACT_APP_COURSE_API_URL}/courses/${courseId}/details`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourseName(courseData.name);
        setCourseFacultyId(courseData.faculty_id);

        if (courseData.teacher_id) {
          const { data: t } = await axios.get(
            `${process.env.REACT_APP_COURSE_API_URL}/courses/${courseId}/teacher`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setTeacherName(
            t.first_name && t.last_name
              ? `${t.first_name} ${t.last_name}`
              : t.name || 'Unknown'
          );
        } else {
          setTeacherName('No teacher assigned');
        }
      } catch {
        setErrorCourse('Errore nel recupero dei dettagli del corso.');
      } finally {
        setLoadingCourse(false);
      }
    };
    fetchCourseDetails();
  }, [courseId]);

  // — fetch medie voti —
  const fetchRatings = async () => {
    try {
      setLoadingRatings(true);
      const token = localStorage.getItem('access_token');
      const { data } = await axios.get(
        `${process.env.REACT_APP_COURSE_API_URL}/courses/${courseId}/ratings?timestamp=${Date.now()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourseRatings(data);
    } catch {
      setErrorRatings('Errore nel recupero dei voti.');
    } finally {
      setLoadingRatings(false);
    }
  };
  useEffect(() => {
    fetchRatings();
  }, [courseId]);

  // — fetch recensioni —
  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const token = localStorage.getItem('access_token');
      const { data } = await axios.get(
        `${process.env.REACT_APP_COURSE_API_URL}/courses/${courseId}/reviews`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(data);
    } catch (e) {
      if (e.response?.status === 404) setReviews([]);
      else setErrorReviews('Errore nel recupero delle recensioni.');
    } finally {
      setLoadingReviews(false);
    }
  };
  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  // — fetch note + dettagli —
  const fetchNotesWithDetails = async () => {
    try {
      setLoadingNotes(true);
      const token = localStorage.getItem('access_token');
      const notesResp = await axios.get(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const notes = notesResp.data;
      const detailed = await Promise.all(
        notes.map(async (n) => {
          let avg = 0, rates = [];
          try {
            const { data: a } = await axios.get(
              `${process.env.REACT_APP_NOTES_API_URL}/notes/notes/${n.id}/average-rating`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            avg = a.average_rating || 0;
          } catch {}
          try {
            const { data: r } = await axios.get(
              `${process.env.REACT_APP_NOTES_API_URL}/notes/notes/${n.id}/reviews`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            rates = r;
          } catch {}
          return { ...n, average_rating: avg, ratings: rates };
        })
      );
      setNotesWithDetails(detailed);
    } catch {
      setErrorNotes('Errore nel recupero delle note.');
    } finally {
      setLoadingNotes(false);
    }
  };
  useEffect(() => {
    fetchNotesWithDetails();
  }, [courseId]);

  // — fetch utente —
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoadingUser(true);
        const token = localStorage.getItem('access_token');
        const { data } = await axios.get(
          `${process.env.REACT_APP_USER_API_URL}/users/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentUser(data);
        setUserFacultyId(data.faculty_id);
      } catch {} finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // — submit recensione (anche aggiorna medie) —
  const handleReviewChange = (field, v) =>
    setNewReview((p) => ({ ...p, [field]: v }));
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
      setNewReview({
        rating_clarity: 0,
        rating_feasibility: 0,
        rating_availability: 0,
        comment: '',
      });
      setShowReviewForm(false);
      await Promise.all([fetchReviews(), fetchRatings()]);
    } catch {
      setErrorSubmit("Errore durante l'invio della recensione.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // — submit note —
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setUploadingNote(true);
    setErrorUploadNote('');
    try {
      const token = localStorage.getItem('access_token');
      const fd = new FormData();
      fd.append('course_id', courseId);
      fd.append('description', newNoteDescription);
      fd.append('file', newNoteFile);
      await axios.post(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/`,
        fd,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      setShowNoteForm(false);
      setNewNoteDescription('');
      setNewNoteFile(null);
      await fetchNotesWithDetails();
    } catch {
      setErrorUploadNote("Errore durante l'upload della nota.");
    } finally {
      setUploadingNote(false);
    }
  };

  // — download note —
  const handleDownloadNote = async (noteId) => {
    try {
      const token = localStorage.getItem('access_token');
      const resp = await axios.get(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/download/${noteId}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );
      let fn = 'downloaded_note';
      const cd = resp.headers['content-disposition'];
      if (cd) {
        const m = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (m?.[1]) fn = m[1].replace(/['"]/g, '');
      }
      const url = window.URL.createObjectURL(resp.data);
      const a = document.createElement('a');
      a.href = url; a.download = fn; document.body.appendChild(a);
      a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch {}
  };

  // — rating note —
  const handleNoteRatingSubmit = async (e, noteId) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/ratings`,
        { note_id: noteId, rating: noteRatingValue, comment: noteRatingComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNoteRatingFormOpen(null);
      setNoteRatingValue(1);
      setNoteRatingComment('');
      await fetchNotesWithDetails();
    } catch {}
  };

  // — report recensione (solo altri) —
  const handleReviewReportSubmit = async (e, revId) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/reports/`,
        { id_review: revId, reason: newReviewReportReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReportedReviews((p) => ({ ...p, [revId]: true }));
      setReviewReportFormOpen(null);
      setNewReviewReportReason('');
    } catch {}
  };

  // — report nota (solo altri) —
  const handleNoteReportSubmit = async (e, noteId) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${process.env.REACT_APP_NOTES_API_URL}/notes/reports/`,
        { id_note: noteId, reason: newNoteReportReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReportedNotes((p) => ({ ...p, [noteId]: true }));
      setNoteReportFormOpen(null);
      setNewNoteReportReason('');
    } catch {}
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      {loadingCourse ? (
        <Box sx={{ textAlign: 'center', my: 4 }}><CircularProgress /></Box>
      ) : errorCourse ? (
        <Typography color="error">{errorCourse}</Typography>
      ) : (
        <Box sx={{ position: 'relative', mb: 2, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            <strong>{courseName}</strong>
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Professor {teacherName}
          </Typography>
          <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
            <Link to="/dashboard/my-profile" style={{ textDecoration: 'none' }}>
              <Typography>Your account</Typography>
            </Link>
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Medie voti */}
      <Box sx={{ my: 3 }}>
        {loadingRatings ? (
          <Box sx={{ textAlign: 'center' }}><CircularProgress size={24} /></Box>
        ) : errorRatings ? (
          <Typography color="error">{errorRatings}</Typography>
        ) : (
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Typography>Lessons Clarity</Typography>
              <CustomRating value={courseRatings.average_clarity} />
            </Grid>
            <Grid item>
              <Typography>Exam Feasibility</Typography>
              <CustomRating value={courseRatings.average_feasibility} />
            </Grid>
            <Grid item>
              <Typography>Teacher Availability</Typography>
              <CustomRating value={courseRatings.average_availability} />
            </Grid>
          </Grid>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Accordion Reviews */}
      <Accordion disableGutters elevation={0} square sx={{ background: 'transparent' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5">Reviews</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {loadingReviews ? (
            <Box sx={{ textAlign: 'center' }}><CircularProgress size={24} /></Box>
          ) : errorReviews ? (
            <Typography color="error">{errorReviews}</Typography>
          ) : reviews.length === 0 ? (
            <Typography>No reviews available.</Typography>
          ) : (
            <List disablePadding>
              {reviews.map((rev) => (
                <Accordion
                  key={rev.id}
                  disableGutters
                  elevation={0}
                  square
                  sx={{ background: 'transparent', mt: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={4}>
                        <Typography variant="caption">Clarity:</Typography>
                        <CustomRating value={rev.rating_clarity} />
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption">Feasibility:</Typography>
                        <CustomRating value={rev.rating_feasibility} />
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption">Availability:</Typography>
                        <CustomRating value={rev.rating_availability} />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          {new Date(rev.created_at).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ mb: 1 }}>{rev.comment}</Typography>
                    {currentUser &&
                      currentUser.faculty_id === courseFacultyId &&
                      currentUser.id !== rev.student_id &&
                      !reportedReviews[rev.id] && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setReviewReportFormOpen((o) => (o === rev.id ? null : rev.id))
                            }
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                      )}
                    {reviewReportFormOpen === rev.id && (
                      <Box component="form" onSubmit={(e) => handleReviewReportSubmit(e, rev.id)} sx={{ mt: 1 }}>
                        <TextField
                          size="small"
                          placeholder="Reason"
                          value={newReviewReportReason}
                          onChange={(e) => setNewReviewReportReason(e.target.value)}
                          fullWidth
                        />
                        <Button
                          type="submit"
                          size="small"
                          variant="contained"
                          color="primary"
                          sx={{ mt: 1 }}
                        >
                          Report
                        </Button>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          )}

          {/* Add Review */}
          <Box sx={{ textAlign: 'center', my: 2 }}>
            {(!loadingUser && courseFacultyId !== null && userFacultyId !== courseFacultyId) ? (
              <Typography>Can't add reviews – not in your faculty</Typography>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowReviewForm((v) => !v)}
              >
                {showReviewForm ? 'Cancel' : 'Add Review'}
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
                  <Typography>Lessons Clarity</Typography>
                  <Rating
                    name="rating_clarity"
                    value={newReview.rating_clarity}
                    precision={1}
                    onChange={(_, v) => handleReviewChange('rating_clarity', v)}
                    icon={<StarIcon sx={{ color: '#FFD700' }} />}
                    emptyIcon={<StarBorderIcon />}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography>Exam Feasibility</Typography>
                  <Rating
                    name="rating_feasibility"
                    value={newReview.rating_feasibility}
                    precision={1}
                    onChange={(_, v) => handleReviewChange('rating_feasibility', v)}
                    icon={<StarIcon sx={{ color: '#FFD700' }} />}
                    emptyIcon={<StarBorderIcon />}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography>Teacher Availability</Typography>
                  <Rating
                    name="rating_availability"
                    value={newReview.rating_availability}
                    precision={1}
                    onChange={(_, v) => handleReviewChange('rating_availability', v)}
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
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Submitting…' : 'Submit Review'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      {/* Accordion Notes */}
      <Accordion disableGutters elevation={0} square sx={{ background: 'transparent' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5">Notes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {loadingNotes ? (
            <Box sx={{ textAlign: 'center' }}><CircularProgress size={24} /></Box>
          ) : errorNotes ? (
            <Typography color="error">{errorNotes}</Typography>
          ) : notesWithDetails.length === 0 ? (
            <Typography>No notes available.</Typography>
          ) : (
            <List disablePadding>
              {notesWithDetails.map((note) => (
                <ListItem
                  key={note.id}
                  sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1 }}
                >
                  {/* note upload date */}
                  <Typography variant="caption" sx={{ mb: 2 }}>
                    {new Date(note.created_at).toLocaleDateString()}
                  </Typography>

                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1">
                      <strong>{note.description}</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CustomRating value={note.average_rating} />
                      <IconButton size="small" onClick={() => handleDownloadNote(note.id)}>
                        <DownloadIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {note.ratings.length > 0 ? (
                    note.ratings.map((r, i) => (
                      <Box key={i} sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ mb: 2 }}>
                          {new Date(r.created_at).toLocaleDateString() + "  "}
                        </Typography>
                        <Typography variant="caption">
                          {r.comment || 'No comment'}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="caption" sx={{ mt: 0.5 }}>
                      No ratings for this note.
                    </Typography>
                  )}

                  {/* report note: solo altri */}
                  {currentUser &&
                    currentUser.faculty_id === courseFacultyId &&
                    currentUser.id !== note.student_id &&
                    !reportedNotes[note.id] && (
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setNoteReportFormOpen((o) => (o === note.id ? null : note.id))
                          }
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    )}
                  {noteReportFormOpen === note.id && (
                    <Box
                      component="form"
                      onSubmit={(e) => handleNoteReportSubmit(e, note.id)}
                      sx={{ mt: 1 }}
                    >
                      <TextField
                        size="small"
                        placeholder="Reason"
                        value={newNoteReportReason}
                        onChange={(e) => setNewNoteReportReason(e.target.value)}
                        fullWidth
                      />
                      <Button
                        type="submit"
                        size="small"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 1 }}
                      >
                        Report
                      </Button>
                    </Box>
                  )}

                  {/* rate note */}
                  {currentUser &&
                    currentUser.faculty_id === courseFacultyId &&
                    currentUser.id !== note.student_id && (
                      <Box sx={{ mt: 1 }}>
                        {note.ratings.some((r) => r.student_id === currentUser.id) ? (
                          <Typography variant="body2">
                            You have already rated this note.
                          </Typography>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => setNoteRatingFormOpen(note.id)}
                          >
                            Rate Note
                          </Button>
                        )}
                      </Box>
                    )}
                  {noteRatingFormOpen === note.id && (
                    <Box
                      component="form"
                      onSubmit={(e) => handleNoteRatingSubmit(e, note.id)}
                      sx={{ mt: 1, width: '100%' }}
                    >
                      <Rating
                        name={`note-rating-${note.id}`}
                        value={noteRatingValue}
                        precision={1}
                        onChange={(_, v) => setNoteRatingValue(v)}
                        icon={<StarIcon sx={{ color: '#FFD700' }} />}
                        emptyIcon={<StarBorderIcon />}
                      />
                      <TextField
                        size="small"
                        placeholder="Leave a comment"
                        value={noteRatingComment}
                        onChange={(e) => setNoteRatingComment(e.target.value)}
                        fullWidth
                        sx={{ mt: 1 }}
                      />
                      <Button
                        type="submit"
                        size="small"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 1 }}
                      >
                        Submit Rating
                      </Button>
                    </Box>
                  )}

                  <Divider sx={{ my: 1, width: '100%' }} />
                </ListItem>
              ))}
            </List>
          )}

          {/* add note */}
          <Box sx={{ textAlign: 'center', my: 2 }}>
            {currentUser && currentUser.faculty_id === courseFacultyId ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowNoteForm((v) => !v)}
              >
                {showNoteForm ? 'Cancel' : 'Add Note'}
              </Button>
            ) : (
              <Typography>You are not allowed to add notes for this course.</Typography>
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
                accept=".pdf,.doc,.docx,.xlsx,.jpg,.png,.ppt,.pptx"
                onChange={(e) => setNewNoteFile(e.target.files[0])}
                style={{ marginBottom: 8 }}
              />
              <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
                Accepted formats: pdf, doc, docx, xlsx, jpg, png, ppt, pptx
              </Typography>
              {errorUploadNote && (
                <Typography color="error" variant="caption" display="block" sx={{ mb: 1 }}>
                  {errorUploadNote}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={uploadingNote}
              >
                {uploadingNote ? 'Uploading…' : 'Submit Note'}
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default SingleCourse;
