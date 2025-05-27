// src/pages/shifts/Shifts.js
import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Button,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { format, parseISO, isSameDay, getDay } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const Shifts = () => {
  const [user] = useAuthState(auth);
  const [shifts, setShifts] = useState([]);
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('date'); // 'date' or 'day'
  const [dateFilter, setDateFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');

  const daysOfWeek = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
  ];

  useEffect(() => {
    if (!user) return;

    const fetchShifts = async () => {
      try {
        let q;
        if (user.role === 'manager') {
          // For managers, show all shifts they assigned
          q = query(
            collection(db, 'shifts'),
            where('assignedBy', '==', user.uid),
            orderBy('date', 'desc')
          );
        } else {
          // For regular staff, show only their shifts
          q = query(
            collection(db, 'shifts'),
            where('userId', '==', user.uid),
            orderBy('date', 'desc')
          );
        }
        
        const querySnapshot = await getDocs(q);
        const shiftsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date,
          clockIn: doc.data().clockIn?.toDate(),
          clockOut: doc.data().clockOut?.toDate()
        }));
        setShifts(shiftsData);
        setFilteredShifts(shiftsData);
      } catch (error) {
        console.error('Error fetching shifts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, [user]);

  useEffect(() => {
    let results = shifts;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(shift => 
        shift.userName?.toLowerCase().includes(term) || 
        shift.userEmail?.toLowerCase().includes(term) ||
        format(new Date(shift.date), 'MMM dd, yyyy').toLowerCase().includes(term) ||
        shift.role?.toLowerCase().includes(term)
      );
    }
    
    // Apply date or day filter
    if (filterType === 'date' && dateFilter) {
      const filterDate = new Date(dateFilter);
      results = results.filter(shift => 
        isSameDay(new Date(shift.date), filterDate)
      );
    } else if (filterType === 'day' && dayFilter !== '') {
      results = results.filter(shift => 
        getDay(new Date(shift.date)).toString() === dayFilter
      );
    }
    
    setFilteredShifts(results);
  }, [shifts, searchTerm, filterType, dateFilter, dayFilter]);

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setDateFilter('');
    setDayFilter('');
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          <Typography>Loading shifts...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {user.role === 'manager' ? 'Shifts You Assigned' : 'Your Shifts'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter By</InputLabel>
            <Select
              value={filterType}
              label="Filter By"
              onChange={handleFilterTypeChange}
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="day">Day of Week</MenuItem>
            </Select>
          </FormControl>
          
          {filterType === 'date' ? (
            <TextField
              label="Filter by Date"
              type="date"
              size="small"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ minWidth: 200 }}
            />
          ) : (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Day of Week</InputLabel>
              <Select
                value={dayFilter}
                label="Day of Week"
                onChange={(e) => setDayFilter(e.target.value)}
              >
                <MenuItem value="">All Days</MenuItem>
                {daysOfWeek.map(day => (
                  <MenuItem key={day.value} value={day.value}>{day.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {user.role === 'manager' && <TableCell>Staff</TableCell>}
                <TableCell>Date</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredShifts.length > 0 ? (
                filteredShifts.map((shift) => (
                  <TableRow key={shift.id}>
                    {user.role === 'manager' && (
                      <TableCell>{shift.userName || shift.userEmail}</TableCell>
                    )}
                    <TableCell>{format(new Date(shift.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      {shift.clockIn ? format(shift.clockIn, 'hh:mm a') : 
                       shift.scheduledStart || 'Not scheduled'}
                    </TableCell>
                    <TableCell>
                      {shift.clockOut ? format(shift.clockOut, 'hh:mm a') : 
                       shift.scheduledEnd || 'Not scheduled'}
                    </TableCell>
                    <TableCell>{shift.role || 'Staff'}</TableCell>
                    <TableCell>
                      {shift.clockIn && !shift.clockOut ? 'In Progress' : 
                       shift.clockOut ? 'Completed' : 'Scheduled'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={user.role === 'manager' ? 6 : 5} align="center">
                    No shifts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default Shifts;