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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CoffeeIcon from '@mui/icons-material/Coffee';
import backgroundImage from '../assets/coffee-beans-bg.jpg';
import { validateReferralCode, markReferralCodeAsUsed  } from '../utils/referralUtils';


const theme = createTheme({
  palette: {
    primary: {
      main: '#6F4E37', // Coffee brown
      light: '#A67B5B', // Lighter coffee
      dark: '#4B3621', // Dark coffee
    },
    secondary: {
      main: '#D2B48C', // Tan
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFF8F0', // Cream
    },
  },
  typography: {
    fontFamily: '"Playfair Display", serif',
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

const roles = [
  { value: 'staff', label: 'Staff' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
];

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('staff');
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
      setRole(role); // Auto-set the role based on referral code
    }
  } else {
    setReferralCodeValid(false);
    setReferralRole('');
  }
};

// Update the handleSubmit function to mark the code as used
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!referralCodeValid) {
    return setError('Valid referral code is required');
  }
  if (password !== confirmPassword) return setError('Passwords do not match');
  if (password.length < 6) return setError('Password must be at least 6 characters');

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
      role: referralRole || role,
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
          backgroundImage: `linear-gradient(rgba(255, 248, 240, 0.9), rgba(255, 248, 240, 0.9)), url(${backgroundImage})`,
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
              boxShadow: '0 8px 20px rgba(111, 78, 55, 0.15)',
              border: '1px solid rgba(111, 78, 55, 0.1)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  boxShadow: 3,
                }}
              >
                <CoffeeIcon fontSize="large" />
              </Avatar>
              <Typography
                variant="h1"
                sx={{
                  mt: 2,
                  color: 'primary.dark',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                Brew Haven
              </Typography>
              <Typography
                variant="h2"
                sx={{ mt: 1, color: 'primary.main', fontSize: '1.8rem' }}
              >
                Join Our Coffee Family
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
  select
  label="Role"
  value={role}
  onChange={(e) => setRole(e.target.value)}
  disabled={referralCodeValid} // 🔒 Disable role selection when referral code is valid
  helperText={
    referralCodeValid
      ? `Role assigned via referral code: ${referralRole}`
      : 'Select a role manually'
  }
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
>
  {roles.map((option) => (
    <MenuItem key={option.value} value={option.value}>
      {option.label}
    </MenuItem>
  ))}
</TextField>

                </Grid>
              </Grid>

              <Grid item xs={12}>
    <TextField
      fullWidth
      required
      label="Referral Code"
      value={referralCode}
      onChange={handleReferralCodeChange}
      error={referralCode && !referralCodeValid}
      helperText={referralCode && !referralCodeValid ? "Invalid referral code" : ""}
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: 'primary.light' },
          '&:hover fieldset': { borderColor: referralCodeValid ? 'success.main' : 'primary.main' },
          '&.Mui-focused fieldset': { 
            borderColor: referralCodeValid ? 'success.main' : 'primary.dark' 
          },
        },
      }}
    />
  </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{
                  mt: 4,
                  py: 1.8,
                  borderRadius: theme.shape.borderRadius,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(111, 78, 55, 0.3)',
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
                  Already part of our coffee family?{' '}
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