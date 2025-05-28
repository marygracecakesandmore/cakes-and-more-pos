// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import {
  TextField, Button, Container, Typography, Box, Paper, Alert,
  Avatar, CssBaseline, Slide, Fade, CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import logo from '../assets/logo.png';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import backgroundImage from '../assets/background_4.jpg'; // Changed background image import

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2', // Blue
      light: '#64B5F6', // Light blue
      dark: '#0D47A1', // Dark blue
    },
    secondary: {
      main: '#4DB6AC', // Teal
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF', // White
    },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.8rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      let errorMessage = err.message;
      if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          py: 4,
        }}
      >
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Slide direction="up" in={true} mountOnEnter unmountOnExit>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Fade in={true} timeout={1000}>
                <Avatar
                  sx={{
                    m: 1,
                    bgcolor: 'transparent',
                    width: 120,
                    height: 120,
                    boxShadow: 3,
                  }}
                  src={logo}
                  alt="Mary Grace Cakes & More Logo"
                />
              </Fade>
              <Typography
                component="h1"
                variant="h1"
                sx={{
                  mb: 2,
                  color: 'primary.dark',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                }}
              >
                Welcome to Mary Grace Cakes
              </Typography>

              <Paper
                elevation={6}
                sx={{
                  padding: 4,
                  width: '100%',
                  borderRadius: theme.shape.borderRadius * 2,
                  backgroundColor: 'background.paper',
                  boxShadow: '0 8px 20px rgba(25, 118, 210, 0.15)',
                  border: '1px solid rgba(25, 118, 210, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <LockOutlinedIcon />
                  </Avatar>
                  <Typography component="h2" variant="h2" sx={{ color: 'primary.dark' }}>
                    Login to Your Account
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
                    Please enter your credentials to access the system
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mt: 3, mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    sx={{
                      mt: 3,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'primary.light' },
                        '&:hover fieldset': { borderColor: 'primary.main' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.dark' },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'primary.dark',
                      },
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'primary.light' },
                        '&:hover fieldset': { borderColor: 'primary.main' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.dark' },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'primary.dark',
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 4,
                      mb: 2,
                      py: 1.5,
                      borderRadius: theme.shape.borderRadius,
                      bgcolor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
                        Signing In...
                      </Box>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Slide>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Login;