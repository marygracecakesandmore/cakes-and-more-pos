// src/pages/ActivityLogs.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Container, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  TextField, MenuItem, Divider, Avatar, Chip, 
  IconButton, Tooltip, LinearProgress, Button
} from '@mui/material';
import { 
  History, Search, FilterList, Refresh, 
  CalendarToday, ArrowBack, DateRange 
} from '@mui/icons-material';
import { format, subDays, isToday, isYesterday, parseISO } from 'date-fns';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const ActivityLogs = () => {
  const navigate = useNavigate();
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  // Fetch activity logs with filters
  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      
      let q = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'));
      
      // Apply date filters
      if (dateFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        q = query(q, where('timestamp', '>=', today));
      } else if (dateFilter === 'yesterday') {
        const yesterday = subDays(new Date(), 1);
        yesterday.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        q = query(q, where('timestamp', '>=', yesterday), where('timestamp', '<', today));
      } else if (dateFilter === 'custom') {
        const startDate = new Date(customDateRange.start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(customDateRange.end);
        endDate.setHours(23, 59, 59, 999);
        q = query(q, where('timestamp', '>=', startDate), where('timestamp', '<=', endDate));
      }
      
      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [dateFilter, customDateRange]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  const handleRefresh = () => {
    fetchActivityLogs();
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'order_completed':
        return 'success.main';
      case 'payment':
        return 'primary.main';
      case 'order_created':
        return 'info.main';
      case 'error':
        return 'error.main';
      default:
        return 'grey.500';
    }
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'order_completed':
        return '✓';
      case 'payment':
        return '$';
      case 'order_created':
        return '+';
      case 'error':
        return '!';
      default:
        return '•';
    }
  };

  const filteredLogs = activityLogs.filter(log => 
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.orderId && log.orderId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Activity Logs
          </Typography>
          <Tooltip title="Refresh logs">
            <IconButton onClick={handleRefresh} sx={{ ml: 'auto' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Filters Section */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search logs..."
              InputProps={{
                startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />
              }}
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ minWidth: 250, flexGrow: 1 }}
            />
            
            <TextField
              select
              label="Date Filter"
              size="small"
              value={dateFilter}
              onChange={handleDateFilterChange}
              sx={{ minWidth: 180 }}
              InputProps={{
                startAdornment: <FilterList sx={{ color: 'action.active', mr: 1 }} />
              }}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="yesterday">Yesterday</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </TextField>
            
            {dateFilter === 'custom' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  type="date"
                  size="small"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ color: 'action.active', mr: 1 }} />
                  }}
                />
                <Typography>to</Typography>
                <TextField
                  type="date"
                  size="small"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ color: 'action.active', mr: 1 }} />
                  }}
                />
              </Box>
            )}
          </Box>
        </Paper>
        
        {/* Activity Logs Table */}
        <Paper sx={{ overflow: 'hidden' }}>
          {loading ? (
            <LinearProgress />
          ) : (
            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="40px"></TableCell>
                    <TableCell>Activity</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          <Avatar 
                            sx={{ 
                              bgcolor: getActivityColor(log.type),
                              width: 24, 
                              height: 24,
                              fontSize: '0.8rem'
                            }}
                          >
                            {getActivityIcon(log.type)}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {log.description}
                          </Typography>
                          {log.orderId && (
                            <Typography variant="caption" color="text.secondary">
                              Order #{log.orderId.slice(0, 8)}
                            </Typography>
                          )}
                          {log.amount && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              ${log.amount}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                mr: 1,
                                fontSize: '0.7rem',
                                bgcolor: 'grey.200'
                              }}
                            >
                              {log.userName?.charAt(0) || log.userEmail?.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {log.userName || log.userEmail}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {log.timestamp ? format(log.timestamp, 'MMM dd, yyyy') : 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.timestamp ? format(log.timestamp, 'h:mm a') : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={log.type.replace('_', ' ')}
                            size="small"
                            sx={{ 
                              textTransform: 'capitalize',
                              backgroundColor: getActivityColor(log.type),
                              color: 'white'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <History sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                          No activity logs found
                        </Typography>
                        <Button 
                          variant="outlined" 
                          sx={{ mt: 2 }}
                          onClick={handleRefresh}
                        >
                          Refresh
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ActivityLogs;