import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
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
  Tooltip,
  FormControl,    
  InputLabel,     
  Select,         
  MenuItem,
  Snackbar    
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

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

  //filtri
  const [filterDialogOpen, setFilterDialogOpen] = useState(false); // for the sorting filter dialog
  const [sortCriteria, setSortCriteria] = useState('date'); // default to 'date'
  const [sortOrder, setSortOrder] = useState('asc'); // default to 'asc'
  const [sortRatingCategory, setSortRatingCategory] = useState('clarity'); // 'clarity', 'feasibility', 'availability'

  //snackbar notis
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'error'





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

   // Apply sorting based on selected criteria
  const applySorting = () => {
    let sortedReviews = [...reviews]; // Create a copy of the reviews array

    if (sortCriteria === 'date') {
      // Sort by date
      sortedReviews = sortedReviews.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortCriteria === 'rating') {
      // Sort by rating (based on the selected category)
      sortedReviews = sortedReviews.sort((a, b) => {
        const ratingA = a[`rating_${sortRatingCategory}`]; // Dynamic rating category
        const ratingB = b[`rating_${sortRatingCategory}`]; // Dynamic rating category
        return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      });
    }

    setReviews(sortedReviews); // Update the reviews with the sorted array
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

      // Show success message in Snackbar
      setSnackbarMessage('Review submitted successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true); // Open the Snackbar
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

      // Show success message in Snackbar
      setSnackbarMessage('Note uploaded successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true); // Open the Snackbar
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
  // --- Updated handleReviewReportSubmit ---
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
      
      // Snackbar confirmation after report submission
      setSnackbarMessage('Review reported successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true); // Open the Snackbar
    } catch {
      // Handle errors if any
      setSnackbarMessage('Failed to report the review. Try again!');
      setSnackbarSeverity('error');
      setOpenSnackbar(true); // Open the Snackbar
    }
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
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography align="center">Lessons Clarity</Typography>
                <Tooltip title="1: Very unclear, 5: Crystal clear" arrow>
                  <IconButton sx={{ ml: 1 }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <CustomRating value={courseRatings.average_clarity} />
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography align="center">Exam Feasibility</Typography>
                <Tooltip title="1: Very tough exam, 5: Very easy exam" arrow>
                  <IconButton sx={{ ml: 1 }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <CustomRating value={courseRatings.average_feasibility} />
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography align="center">Teacher Availability</Typography>
                <Tooltip title="1: Never available, 5: Always available" arrow>
                  <IconButton sx={{ ml: 1 }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
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
          <IconButton
            size="small"
            sx={{ ml: 2 }}
            onClick={() => setFilterDialogOpen(true)}
          >
            <FilterListIcon />
          </IconButton>
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
                          <Button
                            variant="contained"
                            color="error" // Red button
                            size="small"
                            onClick={() => {
                              setReviewReportFormOpen((o) => (o === rev.id ? null : rev.id));
                              setSnackbarMessage("Please report only if necessary. Avoid unnecessary reports.");
                              setSnackbarSeverity("info");
                              setOpenSnackbar(true); // Open snackbar with info message
                            }}
                          >
                            Report
                          </Button>
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
                          Submit Report
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
              <>
                <Tooltip 
                  title={showReviewForm ? "Cancel your review" : "Assign a rating for each of the three categories and leave a comment about the course"}
                  arrow
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowReviewForm((v) => !v)}
                  >
                    {showReviewForm ? 'Cancel' : 'Add Review'}
                  </Button>
                </Tooltip>
              </>
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

      {/* Sorting Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
        <DialogTitle>Sort Reviews</DialogTitle>
        <DialogContent>
          {/* Sorting Criteria Select */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="date">Sort by Date</MenuItem>
              <MenuItem value="rating">Sort by Rating</MenuItem>
            </Select>
          </FormControl>

          {/* Conditional rendering for rating filter */}
          {sortCriteria === 'rating' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rating Category</InputLabel>
              <Select
                value={sortRatingCategory}
                onChange={(e) => setSortRatingCategory(e.target.value)}
                label="Rating Category"
              >
                <MenuItem value="clarity">Clarity</MenuItem>
                <MenuItem value="feasibility">Feasibility</MenuItem>
                <MenuItem value="availability">Availability</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Sort Order Select */}
          <FormControl fullWidth>
            <InputLabel>Sort Order</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              label="Sort Order"
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setFilterDialogOpen(false);
              applySorting(); // Apply sorting when the user clicks 'Apply'
            }}
            color="primary"
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>


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
              <>
                <Tooltip 
                  title={showNoteForm ? "Cancel your note upload" : "Upload a document and comment briefly its content"}
                  arrow
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowNoteForm((v) => !v)}
                  >
                    {showNoteForm ? 'Cancel' : 'Add Note'}
                  </Button>
                </Tooltip>
              </>
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
                Accepted formats: pdf, doc, docx, xlsx, jpg, png, ppt, ppt
              </Typography>
              <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
                Maximum size: 80 MB
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

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ 
          vertical: 'top', 
          horizontal: 'right' 
        }}
        sx={{
          position: 'fixed !important',    // Force fixed positioning
          top: '16px !important',          // Force top position
          right: '16px !important',        // Force right position
          zIndex: 9999,                    // High z-index
          transform: 'none !important',    // Override any transforms
          '& .MuiSnackbar-root': {
            position: 'fixed !important',
            top: '16px !important',
            right: '16px !important',
          }
        }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity} 
          sx={{ 
            width: '100%',
            minWidth: '300px',             // Ensure minimum width
            boxShadow: 3                   // Add shadow for better visibility
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SingleCourse;
