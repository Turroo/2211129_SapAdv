import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText,
  Alert
} from '@mui/material';
import axios from 'axios';

const DashboardHome = () => {
  // State to store the username
  const [username, setUsername] = useState('');
  // State for overview statistics
  const [overview, setOverview] = useState({
    courseReviewsCount: 0,
    notesCount: 0,
    noteRatingsCount: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');

        // Retrieve user details to get the username
        // Assuming the GET /me endpoint is available on the course API URL
        const userRes = await axios.get(`${process.env.REACT_APP_USER_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(`${userRes.data.first_name} ${userRes.data.last_name}`);

        // Make parallel API calls while handling 404 errors gracefully
        const courseReviewsPromise = axios
          .get(`${process.env.REACT_APP_COURSE_API_URL}/courses/my-reviews`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(err => {
            if (err.response && err.response.status === 404) {
              console.warn('Course reviews not found (404)');
              return { data: [] };
            }
            throw err;
          });
        const notesPromise = axios
          .get(`${process.env.REACT_APP_NOTES_API_URL}/notes/usr/my-notes`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(err => {
            if (err.response && err.response.status === 404) {
              console.warn('Uploaded notes not found (404)');
              return { data: [] };
            }
            throw err;
          });
        const noteRatingsPromise = axios
          .get(`${process.env.REACT_APP_NOTES_API_URL}/notes/usr/my-reviews`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(err => {
            if (err.response && err.response.status === 404) {
              console.warn('Note reviews not found (404)');
              return { data: [] };
            }
            throw err;
          });
        const coursesPromise = axios
          .get(`${process.env.REACT_APP_COURSE_API_URL}/courses/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(err => {
            if (err.response && err.response.status === 404) {
              console.warn('Courses not found (404)');
              return { data: [] };
            }
            throw err;
          });

        const [courseReviewsRes, notesRes, noteRatingsRes, coursesRes] = await Promise.all([
          courseReviewsPromise,
          notesPromise,
          noteRatingsPromise,
          coursesPromise,
        ]);

        setOverview({
          courseReviewsCount: Array.isArray(courseReviewsRes.data) ? courseReviewsRes.data.length : 0,
          notesCount: Array.isArray(notesRes.data) ? notesRes.data.length : 0,
          noteRatingsCount: Array.isArray(noteRatingsRes.data) ? noteRatingsRes.data.length : 0,
        });

        // Build a mapping: course ID -> course name
        const courseMap = {};
        if (Array.isArray(coursesRes.data)) {
          coursesRes.data.forEach(course => {
            courseMap[course.id] = course.name;
          });
        }

        // Aggregate recent activities, highlighting course names in bold
        let activities = [];
        if (Array.isArray(courseReviewsRes.data)) {
          courseReviewsRes.data.forEach(review => {
            activities.push({
              id: `course-review-${review.id}`,
              description: (
                <>You left a review for the course <strong>{courseMap[review.course_id] || review.course_id}</strong>.</>
              ),
              timestamp: review.created_at,
            });
          });
        }
        if (Array.isArray(notesRes.data)) {
          notesRes.data.forEach(note => {
            activities.push({
              id: `note-${note.id}`,
              description: (
                <>You uploaded a note for the course <strong>{courseMap[note.course_id] || note.course_id}</strong>.</>
              ),
              timestamp: note.created_at,
            });
          });
        }
        if (Array.isArray(noteRatingsRes.data)) {
          noteRatingsRes.data.forEach(noteRating => {
            activities.push({
              id: `note-rating-${noteRating.id}`,
              description: 'You left a review for a note.',
              timestamp: noteRating.created_at,
            });
          });
        }
        // Sort activities by descending timestamp (most recent first)
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRecentActivities(activities);
      } catch (err) {
        console.error('Error retrieving data:', err);
        setError('Unable to retrieve information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {/* Global CSS to hide the cursor on all elements except input, textarea, and contenteditable */}
      <Box className="no-cursor" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Sapienza Advisor, <strong>{username}</strong>
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Overview Section */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={3}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Course Reviews
                  </Typography>
                  <Typography variant="body1">
                    {overview.courseReviewsCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Uploaded Notes
                  </Typography>
                  <Typography variant="body1">
                    {overview.notesCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Note Reviews
                  </Typography>
                  <Typography variant="body1">
                    {overview.noteRatingsCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Recent Activities Section */}
        <Box sx={{ mt: 4, width: '100%', maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activities
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box>
              {recentActivities.length > 0 ? (
                <List>
                  {recentActivities.map(activity => (
                    <ListItem key={activity.id}>
                      <ListItemText 
                        primary={activity.description} 
                        secondary={new Date(activity.timestamp).toLocaleString()} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2">
                  No recent activities.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default DashboardHome;
