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

const AdminDashboardHome = () => {
  const [overview, setOverview] = useState({
    userCount: 0,
    facultyCount: 0,
    reportCount: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      try {
        // Prepare promises with 404 handling
        const usersPromise = axios
          .get(
            `${process.env.REACT_APP_ADMIN_API_URL}/admin/users`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .catch(err => {
            if (err.response && err.response.status === 404) {
              console.warn('Users endpoint returned 404, using empty array');
              return { data: [] };
            }
            throw err;
          });

        const facultiesPromise = axios
          .get(
            `${process.env.REACT_APP_ADMIN_API_URL}/admin/faculties`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .catch(err => {
            if (err.response && err.response.status === 404) {
              console.warn('Faculties endpoint returned 404, using empty array');
              return { data: [] };
            }
            throw err;
          });

        const reportsPromise = axios
          .get(
            `${process.env.REACT_APP_ADMIN_API_URL}/admin/reports`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .catch(err => {
            if (err.response && err.response.status === 404) {
              console.warn('Reports endpoint returned 404, using empty array');
              return { data: [] };
            }
            throw err;
          });

        // Execute all
        const [usersRes, facultiesRes, reportsRes] = await Promise.all([
          usersPromise,
          facultiesPromise,
          reportsPromise,
        ]);

        // Extract data or default to empty array
        const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
        const facultiesData = Array.isArray(facultiesRes.data) ? facultiesRes.data : [];
        const reportsData = Array.isArray(reportsRes.data) ? reportsRes.data : [];

        // Set overview counts
        setOverview({
          userCount: usersData.length,
          facultyCount: facultiesData.length,
          reportCount: reportsData.length,
        });

        // Sort and set recent reports (latest first), or empty
        const sortedReports = reportsData
          .slice()
          .sort((a, b) => new Date(b.datetime || 0) - new Date(a.datetime || 0));
        setRecentReports(sortedReports);
      } catch (err) {
        console.error('Error loading admin overview:', err);
        setError('Unable to retrieve admin data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ alignItems: 'center', textAlign: 'center',p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <strong>Admin Dashboard</strong>
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center',alignItems: 'center', textAlign: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Overview Cards */}
          <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Users</Typography>
                  <Typography variant="h4">{overview.userCount}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Faculties</Typography>
                  <Typography variant="h4">{overview.facultyCount}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Reports</Typography>
                  <Typography variant="h4">{overview.reportCount}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Reports */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Recent Reports
            </Typography>
            {recentReports.length > 0 ? (
              <List>
                {recentReports.slice(0, 10).map((r) => (
                  <ListItem key={r.id_report} divider>
                    <ListItemText
                      primary={`Report #${r.id_report} by User #${r.id_user}`}
                      secondary={`${r.reason} — ${r.datetime ? new Date(r.datetime).toLocaleString() : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>No reports available.</Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default AdminDashboardHome;