// src/pages/orders/Orders.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  MenuItem,
  Chip
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import OrderForm from './OrderForm';
import OrderList from './OrderList';
import OrderProcessing from './OrderProcessing';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

// Import the date picker components
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Real-time updates for orders
  useEffect(() => {
    let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    if (dateFilter === 'today') {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());
      q = query(
        collection(db, 'orders'),
        where('createdAt', '>=', todayStart),
        where('createdAt', '<=', todayEnd),
        orderBy('createdAt', 'desc')
      );
    } else if (dateFilter === 'week') {
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      q = query(
        collection(db, 'orders'),
        where('createdAt', '>=', weekStart),
        where('createdAt', '<=', weekEnd),
        orderBy('createdAt', 'desc')
      );
    } else if (dateFilter === 'custom' && startDate && endDate) {
      const customStart = startOfDay(startDate);
      const customEnd = endOfDay(endDate);
      q = query(
        collection(db, 'orders'),
        where('createdAt', '>=', customStart),
        where('createdAt', '<=', customEnd),
        orderBy('createdAt', 'desc')
      );
    }
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      applyFilters(ordersData, statusFilter, searchTerm);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dateFilter, startDate, endDate]);

  const applyFilters = (ordersToFilter, status, search) => {
    let filtered = [...ordersToFilter];
    
    if (status !== 'all') {
      filtered = filtered.filter(order => order.status === status);
    }
    
    if (search.trim() !== '') {
      filtered = filtered.filter(order => 
        order.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    
    setFilteredOrders(filtered);
  };

  const handleDateFilterChange = (e) => {
    const value = e.target.value;
    setDateFilter(value);
    if (value !== 'custom') {
      setStartDate(null);
      setEndDate(null);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('available', '==', true));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters(orders, statusFilter, searchTerm);
  }, [statusFilter, searchTerm, orders]);

  const handleAddOrder = async (orderData) => {
    try {
      const user = auth.currentUser;
      const orderWithMetadata = {
        ...orderData,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        status: 'pending',
        total: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };

      await addDoc(collection(db, 'orders'), orderWithMetadata);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleStatusFilterChange = (event, newValue) => {
    setStatusFilter(newValue);
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
        Orders Management
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => setShowForm(!showForm)}
          sx={{ mb: 2 }}
        >
          {showForm ? 'Cancel' : 'Create New Order'}
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            select
            value={dateFilter}
            onChange={handleDateFilterChange}
            size="small"
            sx={{ width: 150 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DateRangeIcon />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="all">All Dates</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
          </TextField>

          {dateFilter === 'custom' && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => (
                  <TextField {...params} size="small" sx={{ width: 150 }} />
                )}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => (
                  <TextField {...params} size="small" sx={{ width: 150 }} />
                )}
                minDate={startDate}
                disabled={!startDate}
              />
            </LocalizationProvider>
          )}
        </Box>
        
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} size="small">
                  <Clear />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ width: 300 }}
        />
      </Box>
      
      <Tabs 
        value={statusFilter} 
        onChange={handleStatusFilterChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab label="All Orders" value="all" />
        <Tab label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            Pending
            <Chip 
              label={orders.filter(o => o.status === 'pending').length} 
              size="small" 
              color="warning" 
              sx={{ ml: 1 }}
            />
          </Box>
        } value="pending" />
        <Tab label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            In Progress
            <Chip 
              label={orders.filter(o => o.status === 'in-progress').length} 
              size="small" 
              color="info" 
              sx={{ ml: 1 }}
            />
          </Box>
        } value="in-progress" />
        <Tab label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            Paid
            <Chip 
              label={orders.filter(o => o.status === 'paid').length} 
              size="small" 
              color="primary" 
              sx={{ ml: 1 }}
            />
          </Box>
        } value="paid" />
        <Tab label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            Completed
            <Chip 
              label={orders.filter(o => o.status === 'completed').length} 
              size="small" 
              color="success" 
              sx={{ ml: 1 }}
            />
          </Box>
        } value="completed" />
        <Tab label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            Cancelled
            <Chip 
              label={orders.filter(o => o.status === 'cancelled').length} 
              size="small" 
              color="error" 
              sx={{ ml: 1 }}
            />
          </Box>
        } value="cancelled" />
      </Tabs>

      {showForm && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <OrderForm 
            products={products} 
            onSubmit={handleAddOrder} 
            onCancel={() => setShowForm(false)}
          />
        </Paper>
      )}
      
      <OrderList 
        orders={filteredOrders} 
        onOrderClick={setSelectedOrder}
        currencySymbol="₱"
      />
      
      {selectedOrder && (
        <OrderProcessing 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          onUpdate={() => {}} // No need to manually refresh anymore
          currencySymbol="₱"
        />
      )}
    </Box>
  );
};

export default Orders;