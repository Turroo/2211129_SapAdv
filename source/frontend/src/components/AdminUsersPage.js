import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_ADMIN_API_URL}/admin/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Unable to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search text
  useEffect(() => {
    setFiltered(
      users.filter(u => {
        const term = search.toLowerCase();
        return (
          u.first_name.toLowerCase().includes(term) ||
          u.last_name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
        );
      })
    );
  }, [search, users]);

  // Handle delete user
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const token = localStorage.getItem('access_token');
    try {
      await axios.delete(
        `${process.env.REACT_APP_ADMIN_API_URL}/admin/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Rimuovi utente dallo stato
      const remaining = users.filter(u => u.id !== id);
      setUsers(remaining);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Unable to delete user.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" textAlign='center'><strong>User Accounts</strong></Typography>
        <TextField
          placeholder="Search for an user"
          variant="outlined"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ border: '1px solid #ccc', maxHeight: '60vh', overflowY: 'auto' }}>
          <List disablePadding>
            {filtered.map((u, i) => (
              <ListItem
                key={u.id}
                sx={{ bgcolor: i % 2 ? 'grey.100' : 'white' }}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleDelete(u.id)}>
                    <CloseIcon sx={{ color: 'red' }} />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${i + 1}. ${u.first_name} ${u.last_name}`}
                  secondary={u.email}
                />
              </ListItem>
            ))}
          </List>
          {filtered.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography>No users found.</Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AdminUsersPage;
