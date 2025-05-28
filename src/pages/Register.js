import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  TextField, Button, Container, Typography, Box, Paper, Alert,
  Avatar, MenuItem, Grid, CircularProgress, CssBaseline
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import CakeIcon from '@mui/icons-material/Cake';
import backgroundImage from '../assets/background_4.jpg';
import logoImage from '../assets/logo.png';
import { validateReferralCode, markReferralCodeAsUsed } from '../utils/referralUtils';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5D8BF4',
      light: '#85A6FF',
      dark: '#3D56B2',
    },
    secondary: {
      main: '#F4B95D',
    },
    background: {
      default: '#F5F9FF',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Montserrat", sans-serif',
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

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState('');
  const [referralCodeValid, setReferralCodeValid] = useState(false);
  const [referralRole, setReferralRole] = useState('');

  const handleReferralCodeChange = async (e) => {
    const code = e.target.value;
    setReferralCode(code);
    
    if (code) {
      const isValid = await validateReferralCode(code);
      setReferralCodeValid(isValid);
      if (isValid) {
        const role = code.split('-')[1].toLowerCase();
        setReferralRole(role);
      } else {
        setReferralRole('');
      }
    } else {
      setReferralCodeValid(false);
      setReferralRole('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!referralCodeValid) {
      return setError('Valid referral code is required');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setError('');
    setLoading(true);

    try {
      // First mark the referral code as used
      await markReferralCodeAsUsed(referralCode);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        role: referralRole,
        createdAt: new Date(),
        referredBy: referralCode,
      });

      navigate('/dashboard');
    } catch (err) {
      const code = err.code;
      const messages = {
        'auth/email-already-in-use': 'Email already in use',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/invalid-email': 'Invalid email address',
      };
      setError(messages[code] || err.message);
    } finally {
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
          backgroundImage: `linear-gradient(rgba(245, 249, 255, 0.9), rgba(245, 249, 255, 0.9)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <CssBaseline />
          <Paper
            elevation={6}
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: theme.shape.borderRadius * 2,
              backgroundColor: 'background.paper',
              boxShadow: '0 8px 20px rgba(93, 139, 244, 0.15)',
              border: '1px solid rgba(93, 139, 244, 0.1)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                component="img"
                src={logoImage}
                alt="Mary Grace Cakes and More"
                sx={{
                  height: 120,
                  mx: 'auto',
                  mb: 3,
                  objectFit: 'contain',
                  maxWidth: '100%',
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  mt: 1,
                  color: 'primary.dark',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                Mary Grace Cakes and More
              </Typography>
              <Typography
                variant="h2"
                sx={{ 
                  mt: 1, 
                  color: 'primary.main', 
                  fontSize: '1.8rem',
                  mb: 2
                }}
              >
                Join Our Sweet Family
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    helperText="At least 6 characters"
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Referral Code"
                    value={referralCode}
                    onChange={handleReferralCodeChange}
                    error={referralCode && !referralCodeValid}
                    helperText={
                      referralCode && !referralCodeValid 
                        ? "Invalid referral code" 
                        : referralCodeValid 
                          ? `Valid code for ${referralRole} role`
                          : "Enter a valid referral code provided by your manager"
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { 
                          borderColor: referralCodeValid ? 'success.main' : 'primary.light' 
                        },
                        '&:hover fieldset': { 
                          borderColor: referralCodeValid ? 'success.main' : 'primary.main' 
                        },
                        '&.Mui-focused fieldset': { 
                          borderColor: referralCodeValid ? 'success.main' : 'primary.dark' 
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading || !referralCodeValid}
                sx={{
                  mt: 4,
                  py: 1.8,
                  borderRadius: theme.shape.borderRadius,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(93, 139, 244, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
                startIcon={<PersonAddIcon />}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} /> Registering...
                  </Box>
                ) : (
                  'Create Account'
                )}
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Already part of our sweet family?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: theme.palette.primary.dark,
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Sign in here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Register;