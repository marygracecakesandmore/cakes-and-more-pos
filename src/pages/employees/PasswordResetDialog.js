// src/pages/employees/PasswordResetDialog.js
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const PasswordResetDialog = ({ open, onClose, employees }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleGenerateResetLink = async () => {
    if (!selectedEmployee) return;
    
    setIsGenerating(true);
    try {
      const employee = employees.find(e => e.id === selectedEmployee);
      const auth = getAuth();
      const actionCodeSettings = {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      };
      
      // Generate the password reset link by sending the email and capturing the link
      // Note: In Firebase v9+, we can't directly generate the link without sending the email
      // So we'll use a workaround to create a similar link
      const baseUrl = `https://${auth.config.authDomain}`;
      const apiKey = auth.config.apiKey;
      const email = encodeURIComponent(employee.email);
      
      // This creates a similar link to what Firebase would generate
      const link = `${baseUrl}/__/auth/action?apiKey=${apiKey}&mode=resetPassword&oobCode=GENERATED_CODE&continueUrl=${encodeURIComponent(actionCodeSettings.url)}&lang=en`;
      
      setResetLink(link);
      setIsSent(false);
    } catch (error) {
      console.error('Error generating reset link:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!selectedEmployee) return;
    
    try {
      const employee = employees.find(e => e.id === selectedEmployee);
      const auth = getAuth();
      const actionCodeSettings = {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      };
      
      await sendPasswordResetEmail(auth, employee.email, actionCodeSettings);
      setIsSent(true);
      setResetLink(''); // Clear the manually generated link since we're sending the email
    } catch (error) {
      console.error('Error sending reset email:', error);
    }
  };

  const handleCopyToClipboard = () => {
    if (resetLink) {
      navigator.clipboard.writeText(resetLink);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Password Reset</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Employee</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => {
                setSelectedEmployee(e.target.value);
                setResetLink('');
                setIsSent(false);
              }}
              label="Select Employee"
            >
              {employees.map(employee => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} ({employee.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {resetLink && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Reset Link (expires in 1 hour):
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  fullWidth
                  value={resetLink}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Tooltip title="Copy to clipboard">
                  <IconButton onClick={handleCopyToClipboard}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Note: This is a simulated link. For actual password reset, use the "Send Reset Email" button.
              </Typography>
            </Box>
          )}

          {isSent && (
            <Typography color="success.main" sx={{ mb: 2 }}>
              Password reset email has been sent successfully!
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSendResetEmail}
          variant="contained"
          disabled={!selectedEmployee || isSent}
        >
          {isSent ? 'Email Sent' : 'Send Reset Email'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordResetDialog;