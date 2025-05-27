// src/pages/employees/Employees.js
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import EmployeeForm from './EmployeeForm';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import { generateReferralCode } from '../../utils/referralUtils';

const roles = [
  { value: 'staff', label: 'Staff', color: 'default' },
  { value: 'manager', label: 'Manager', color: 'primary' },
  { value: 'admin', label: 'Admin', color: 'secondary' },
  { value: 'owner', label: 'Owner', color: 'warning' },
];

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [referralRole, setReferralRole] = useState('staff');
  const [activeReferralCodes, setActiveReferralCodes] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const employeesData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEmployees(employeesData);

        // Fetch active referral codes count for each employee
        const referralCodesQuery = query(collection(db, 'referralCodes'));
        const referralCodesSnapshot = await getDocs(referralCodesQuery);
        
        const codesCount = {};
        referralCodesSnapshot.forEach(doc => {
          const data = doc.data();
          if (!data.used && data.ownerId) {
            codesCount[data.ownerId] = (codesCount[data.ownerId] || 0) + 1;
          }
        });
        
        setActiveReferralCodes(codesCount);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateEmployee = async (employeeData) => {
    try {
      const employeeRef = doc(db, 'users', editingEmployee.id);
      await updateDoc(employeeRef, employeeData);
      setEmployees(employees.map(e => 
        e.id === editingEmployee.id ? { ...e, ...employeeData } : e
      ));
      setEditingEmployee(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await deleteDoc(doc(db, 'users', employeeId));
      setEmployees(employees.filter(e => e.id !== employeeId));
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleGenerateReferralCode = () => {
    const code = generateReferralCode(referralRole);
    setGeneratedCode(code);
  };

  const handleAddReferralCode = async () => {
    if (!selectedEmployee || !generatedCode) return;

    try {
      // Add to referralCodes collection
      await addDoc(collection(db, 'referralCodes'), {
        code: generatedCode,
        role: referralRole,
        used: false,
        ownerId: selectedEmployee.id,
        ownerEmail: selectedEmployee.email,
        createdAt: new Date()
      });

      // Update local state
      const newCount = (activeReferralCodes[selectedEmployee.id] || 0) + 1;
      setActiveReferralCodes({
        ...activeReferralCodes,
        [selectedEmployee.id]: newCount
      });

      setGeneratedCode('');
      setReferralDialogOpen(false);
    } catch (error) {
      console.error('Error adding referral code:', error);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const openReferralDialog = (employee) => {
    setSelectedEmployee(employee);
    setReferralDialogOpen(true);
    setGeneratedCode('');
    setReferralRole('staff');
  };

  const getRoleColor = (roleValue) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.color : 'default';
  };

  const getRoleLabel = (roleValue) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Employees Management
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setReferralDialogOpen(true)}
          sx={{ mb: 2 }}
        >
          Generate Referral Code
        </Button>
        
        {showForm && (
          <EmployeeForm 
            employee={editingEmployee}
            onSubmit={handleUpdateEmployee}
            onCancel={() => {
              setShowForm(false);
              setEditingEmployee(null);
            }}
          />
        )}
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Active Referral Codes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map(employee => (
              <TableRow key={employee.id}>
                <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={getRoleLabel(employee.role)} 
                    color={getRoleColor(employee.role)}
                  />
                </TableCell>
                <TableCell>
                  {activeReferralCodes[employee.id] || 0}
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => {
                      setEditingEmployee(employee);
                      setShowForm(true);
                    }}
                    disabled={employee.id === auth.currentUser?.uid}
                  >
                    <EditIcon color="primary" />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteEmployee(employee.id)}
                    disabled={employee.id === auth.currentUser?.uid}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Referral Code Generation Dialog */}
      <Dialog 
        open={referralDialogOpen} 
        onClose={() => setReferralDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate Referral Code</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Employee</InputLabel>
              <Select
                value={selectedEmployee?.id || ''}
                onChange={(e) => {
                  const employee = employees.find(emp => emp.id === e.target.value);
                  setSelectedEmployee(employee);
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

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Role for Referral</InputLabel>
              <Select
                value={referralRole}
                onChange={(e) => setReferralRole(e.target.value)}
                label="Role for Referral"
              >
                {roles.map(role => (
                  <MenuItem 
                    key={role.value} 
                    value={role.value}
                    disabled={role.value === 'owner'} // Prevent generating owner referral codes
                  >
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box display="flex" alignItems="center" gap={2}>
              <TextField
                fullWidth
                label="Referral Code"
                value={generatedCode}
                InputProps={{
                  readOnly: true,
                }}
              />
              <Button 
                variant="outlined" 
                onClick={handleGenerateReferralCode}
                disabled={!selectedEmployee}
              >
                Generate
              </Button>
              {generatedCode && (
                <Tooltip title="Copy to clipboard">
                  <IconButton onClick={() => handleCopyToClipboard(generatedCode)}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReferralDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddReferralCode}
            variant="contained"
            disabled={!generatedCode || !selectedEmployee}
          >
            Add Referral Code
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employees;