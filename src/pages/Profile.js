import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Paper,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { AccountCircle, Save, Cancel, Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  updateEmail,
  verifyBeforeUpdateEmail,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';

const Profile = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || user.email || ''
          });
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      setUserData(prev => ({ ...prev, ...formData }));
      setEditing(false);
      showSnackbar('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar('Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const initiateEmailChange = () => {
    setChangingEmail(true);
  };

  const cancelEmailChange = () => {
    setChangingEmail(false);
    setPassword('');
    setFormData(prev => ({ ...prev, email: user.email }));
  };

  const handleEmailChange = async () => {
  if (!formData.email || formData.email === user.email) {
    showSnackbar('Email is the same as current email', 'warning');
    return;
  }

  try {
    setLoading(true);
    
    // Reauthenticate user
    const credential = EmailAuthProvider.credential(
      user.email,
      password
    );
    await reauthenticateWithCredential(user, credential);

    // Send verification to new email
    await verifyBeforeUpdateEmail(user, formData.email);
    
    showSnackbar('Verification email sent to your new address. Please verify to complete the change.', 'success');
    cancelEmailChange();
  } catch (error) {
    console.error('Error changing email:', error);
    
    let errorMessage = error.message;
    if (error.code === 'auth/user-token-expired' || error.code === 'auth/requires-recent-login') {
      errorMessage = 'Your session has expired. Please log in again.';
      // Redirect to login page with the error message
      navigate('/login', { state: { error: errorMessage } });
      return;
    }
    
    showSnackbar(errorMessage, 'error');
  } finally {
    setLoading(false);
  }
};

  // In Profile.js, update the checkEmailVerification logic
useEffect(() => {
  let intervalId;
  
  const checkEmailVerification = async () => {
    try {
      if (user) {
        await user.reload();
        
        // If email is verified and different from our form state
        if (user.emailVerified && formData.email !== user.email) {
          try {
            // Update email in Firestore
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              email: user.email
            });
            
            // Update local state
            setFormData(prev => ({ ...prev, email: user.email }));
            setUserData(prev => ({ ...prev, email: user.email }));
            
            showSnackbar('Email updated successfully! Please log in again.', 'success');
            
            // Clear the interval and redirect to login
            clearInterval(intervalId);
            await auth.signOut();
            navigate('/login', { 
              state: { 
                message: 'Email updated successfully! Please log in with your new email.',
                severity: 'success'
              } 
            });
            return;
          } catch (error) {
            console.error('Error updating email in Firestore:', error);
          }
        }
      }
    } catch (error) {
      // Handle token expiration specifically
      if (error.code === 'auth/user-token-expired') {
        clearInterval(intervalId);
        navigate('/login', { 
          state: { 
            message: 'Session expired. Please log in with your new email.',
            severity: 'info'
          } 
        });
        return;
      }
      console.error('Error checking email verification:', error);
    }
  };

  intervalId = setInterval(checkEmailVerification, 5000); // Check every 5 seconds
  
  return () => clearInterval(intervalId);
}, [user, formData.email, navigate]);

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}>
            {userData?.firstName?.charAt(0) || <AccountCircle sx={{ fontSize: 40 }} />}
          </Avatar>
          <Typography variant="h5" component="h1">
            {userData?.firstName} {userData?.lastName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {userData?.role}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {editing ? (
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />
            
            {changingEmail ? (
              <>
                <TextField
                  fullWidth
                  label="New Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  variant="outlined"
                  helperText="Enter your current password to verify"
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={cancelEmailChange}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleEmailChange}
                    disabled={loading || !password || !formData.email}
                    startIcon={<Email />}
                  >
                    Verify New Email
                  </Button>
                </Box>
              </>
            ) : (
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                margin="normal"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <Button 
                      size="small" 
                      onClick={initiateEmailChange}
                      disabled={loading}
                    >
                      Change
                    </Button>
                  )
                }}
              />
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => {
                  setEditing(false);
                  cancelEmailChange();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={loading || changingEmail}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>First Name:</strong> {userData?.firstName || 'Not set'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Last Name:</strong> {userData?.lastName || 'Not set'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Email:</strong> {user.email} {user.emailVerified ? '(Verified)' : '(Unverified)'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Role:</strong> {userData?.role}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Member Since:</strong> {userData?.createdAt?.toDate?.().toLocaleDateString() || 'Unknown'}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;