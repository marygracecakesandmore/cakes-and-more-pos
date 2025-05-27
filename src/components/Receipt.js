// src/components/Receipt.js
import React from 'react';
import { 
  Box, 
  Typography, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow
} from '@mui/material';
import { format } from 'date-fns';

const Receipt = ({ order }) => {
  // Calculate change if payment exists
  const changeDue = order.payment 
    ? (order.payment.amount - order.total).toFixed(2)
    : 0;

  return (
    <Box sx={{ 
      width: '80mm', 
      p: 2,
      '@media print': {
        width: '100%',
        p: 0
      }
    }}>
      <Typography variant="h6" align="center" gutterBottom>
        Your Cafe Name
      </Typography>
      <Typography variant="body2" align="center" gutterBottom>
        123 Cafe Street, City
      </Typography>
      <Typography variant="body2" align="center" gutterBottom>
        Tel: (123) 456-7890
      </Typography>
      
      <Divider sx={{ my: 1 }} />
      
      <Typography variant="body2">
        Order #: {order.id.slice(0, 8)}
      </Typography>
      <Typography variant="body2">
        Date: {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'N/A'}
      </Typography>
      <Typography variant="body2" gutterBottom>
        Customer: {order.customerName || 'Walk-in'}
      </Typography>
      
      <Divider sx={{ my: 1 }} />
      
      <Table size="small">
        <TableBody>
          {order.items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.quantity}x {item.name}</TableCell>
              <TableCell align="right">${(item.price * item.quantity).toFixed(2)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Subtotal:</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle2">
                ${order.total?.toFixed(2) || '0.00'}
              </Typography>
            </TableCell>
          </TableRow>
          {order.payment && (
            <>
              <TableRow>
                <TableCell>Tax:</TableCell>
                <TableCell align="right">$0.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2">Total:</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2">
                    ${order.total?.toFixed(2) || '0.00'}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Payment Method:</TableCell>
                <TableCell align="right">
                  {order.payment.method.charAt(0).toUpperCase() + order.payment.method.slice(1)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Amount Tendered:</TableCell>
                <TableCell align="right">
                  ${order.payment.amount?.toFixed(2) || '0.00'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2">Change Due:</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2">
                    ${changeDue}
                  </Typography>
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
      
      <Divider sx={{ my: 1 }} />
      
      <Typography variant="body2" align="center" gutterBottom>
        Thank you for your visit!
      </Typography>
      <Typography variant="body2" align="center">
        Please come again
      </Typography>
    </Box>
  );
};

export default Receipt;