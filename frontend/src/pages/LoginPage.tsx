import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../context/LoginContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useLogin();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);

      if (!email || !password) {
        setError('Email și parolă sunt obligatorii');
        return;
      }

      await login(email, password);
      navigate('/'); // Redirecționează la home page după login
    } catch (err: any) {
      // Handle specific field errors from backend validation
      const data = err.response?.data;
      if (data?.email) {
        setError(`Email: ${Array.isArray(data.email) ? data.email[0] : data.email}`);
      } else if (data?.password) {
        setError(`Parolă: ${Array.isArray(data.password) ? data.password[0] : data.password}`);
      } else if (data?.non_field_errors) {
        setError(Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors);
      } else if (data?.error) {
        setError(data.error);
      } else {
        setError(err.message || 'Eroare la autentificare');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        
          minHeight: '100dvh',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2.5, sm: 4 },
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Autentificare
          </Typography>

          {error && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            disabled={loading}
            autoComplete="email"

            onKeyPress={handleKeyPress}
          />

          <TextField
            fullWidth
            label="Parolă"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            disabled={loading}
            autoComplete="current-password"

            onKeyPress={handleKeyPress}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogin}
            disabled={loading}
            sx={{ marginTop: 3, marginBottom: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Autentificare'}
          </Button>

          <Typography variant="body2" align="center" color="textSecondary">
            © 2026 | Agricultură Management
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};
