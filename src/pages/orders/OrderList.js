// src/pages/orders/OrderList.js
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography,
  Chip,
  Box
} from '@mui/material';
import { format } from 'date-fns';

const statusColors = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'error',
  paid: 'primary',
  'in-progress': 'info'
};

const OrderList = ({ orders, onOrderClick }) => {
  if (orders.length === 0) {
    return (
      <Typography variant="body1" sx={{ mt: 2 }}>
        No orders found. Create your first order!
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Items</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map(order => (
            <TableRow 
              key={order.id} 
              hover 
              onClick={() => onOrderClick(order)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>#{order.id.slice(0, 8)}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>
                {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'N/A'}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {order.items.map((item, index) => (
                    <Typography key={index} variant="body2">
                      {item.quantity}x {item.name}
                    </Typography>
                  ))}
                </Box>
              </TableCell>
              <TableCell>₱{order.total?.toFixed(2) || '0.00'}</TableCell>
              <TableCell>
                <Chip 
                  label={order.status.replace('-', ' ')}
                  color={statusColors[order.status] || 'default'} 
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrderList;