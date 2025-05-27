// src/pages/orders/OrderProcessing.js
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Divider,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Grid,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import LocalOffer from '@mui/icons-material/LocalOffer';

import { 
  Check as CheckIcon, 
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { updateDoc, doc, serverTimestamp, addDoc, collection, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { format } from 'date-fns';
import Receipt from '../../components/Receipt';


const OrderProcessing = ({ order, onClose, onUpdate }) => {
  const [user] = useAuthState(auth);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [userData, setUserData] = useState(null);

  // Add this useEffect to fetch user data
React.useEffect(() => {
  const fetchUserData = async () => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserData(docSnap.data());
    }
  };

  fetchUserData();
}, [user]);

  const handleProcessOrder = async (status) => {
  try {
    const updateData = {
      status,
      updatedAt: serverTimestamp()
    };

    if (status === 'completed') {
      updateData.completedBy = user.uid;
      updateData.completedByName = userData?.firstName || user.email.split('@')[0];
    }

    await updateDoc(doc(db, 'orders', order.id), updateData);

    // Add activity log
    await addDoc(collection(db, 'activityLogs'), {
      type: status === 'completed' ? 'order_completed' : 'order_cancelled',
      description: `Order #${order.id.slice(0, 8)} ${status}`,
      userId: user.uid,
      userEmail: user.email,
      userName: userData?.firstName || user.email.split('@')[0],
      orderId: order.id,
      timestamp: serverTimestamp()
    });

    onUpdate();
    onClose();
  } catch (error) {
    console.error('Error updating order:', error);
  }
};

  // In OrderProcessing.js, update the handlePayment function:
const handlePayment = async () => {
  const amount = parseFloat(paymentAmount);
  if (isNaN(amount) || amount < order.total) {
    alert(`Payment amount must be at least ₱${order.total.toFixed(2)}`);
    return;
  }

  try {
    // Update order with payment details and mark as paid
    await updateDoc(doc(db, 'orders', order.id), {
      payment: {
        amount: amount,
        method: paymentMethod,
        date: serverTimestamp(),
        processedBy: user.uid,
        processedByName: userData?.firstName || user.email.split('@')[0]
      },
      status: 'paid',
      updatedAt: serverTimestamp()
    });

    // Add to queue collection
    await addDoc(collection(db, 'queue'), {
      orderId: order.id,
      status: 'waiting',
      createdAt: serverTimestamp(),
      customerName: order.customerName || 'Walk-in',
      total: order.total,
      items: order.items,
      payment: {
        amount: amount,
        method: paymentMethod
      }
    });

    // Add activity log
    await addDoc(collection(db, 'activityLogs'), {
      type: 'payment',
      description: `Payment processed for Order #${order.id.slice(0, 8)}`,
      userId: user.uid,
      userEmail: user.email,
      userName: userData?.firstName || user.email.split('@')[0],
      amount: amount,
      orderId: order.id,
      timestamp: serverTimestamp()
    });

    onUpdate();
    onClose();
  } catch (error) {
    console.error('Error processing payment:', error);
    alert('Error processing payment. Please try again.');
  }
};

  // Update the printReceipt function in OrderProcessing.js
const printReceipt = () => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt for Order #${order.id.slice(0, 8)}</title>
        <style>
          body { 
            font-family: Arial, sans-serif;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 10px;
          }
          .receipt-footer {
            text-align: center;
            margin-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td {
            padding: 3px 0;
          }
          .text-right {
            text-align: right;
          }
          .text-bold {
            font-weight: bold;
          }
          .text-error {
            color: #d32f2f;
          }
          hr {
            border: 0;
            border-top: 1px dashed #000;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
  `);
  
  // Main receipt content
  printWindow.document.write(`
    <div class="receipt-header">
      <h3>Your Cafe Name</h3>
      <p>123 Cafe Street, City</p>
      <p>Tel: (123) 456-7890</p>
    </div>
    <hr>
    <p>Order #: ${order.id.slice(0, 8)}</p>
    <p>Date: ${order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'N/A'}</p>
    <p>Customer: ${order.customerName || 'Walk-in'}</p>
    <hr>
    <table>
      <tbody>
        ${order.items.map((item, index) => `
  <tr>
    <td>
      ${item.isReward ? `<strong>FREE:</strong> ${item.name}` : `${item.quantity}x ${item.name}`}
    </td>
    <td class="text-right">
      ${item.isReward ? 'FREE' : `₱${(item.price * item.quantity).toFixed(2)}`}
    </td>
  </tr>
`).join('')}
        
        ${order.discountApplied > 0 ? `
          <tr>
            <td class="text-error">${order.rewardUsed || 'Discount'}:</td>
            <td class="text-right text-error">-₱${order.discountApplied.toFixed(2)}</td>
          </tr>
        ` : ''}
        
        <tr>
          <td class="text-bold">Subtotal:</td>
          <td class="text-right text-bold">₱${order.total?.toFixed(2) || '0.00'}</td>
        </tr>
        
        ${order.pointsEarned > 0 ? `
          <tr>
            <td>Points Earned:</td>
            <td class="text-right">+${order.pointsEarned} pts</td>
          </tr>
        ` : ''}
        
        ${order.pointsDeducted > 0 ? `
          <tr>
            <td>Points Redeemed:</td>
            <td class="text-right">-${order.pointsDeducted} pts</td>
          </tr>
        ` : ''}
        
        ${order.payment ? `
          <tr>
            <td>Tax:</td>
            <td class="text-right">₱0.00</td>
          </tr>
          <tr>
            <td class="text-bold">Total:</td>
            <td class="text-right text-bold">₱${order.total?.toFixed(2) || '0.00'}</td>
          </tr>
          <tr>
            <td>Payment Method:</td>
            <td class="text-right">
              ${order.payment.method.charAt(0).toUpperCase() + order.payment.method.slice(1)}
            </td>
          </tr>
          <tr>
            <td>Amount Tendered:</td>
            <td class="text-right">
              ₱${order.payment.amount?.toFixed(2) || '0.00'}
            </td>
          </tr>
          <tr>
            <td class="text-bold">Change Due:</td>
            <td class="text-right text-bold">
              ₱${(order.payment.amount - order.total).toFixed(2)}
            </td>
          </tr>
        ` : ''}
      </tbody>
    </table>
    <hr>
    <div class="receipt-footer">
      <p>Thank you for your visit!</p>
      <p>Please come again</p>
    </div>
  `);
  
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  
  // Wait for content to load before printing
  printWindow.onload = function() {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
};

// Calculate change if payment exists
  const changeDue = order.payment 
    ? (order.payment.amount - order.total).toFixed(2)
    : 0;

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <ReceiptIcon />
          </Avatar>
          <Typography variant="h6">Order #{order.id.slice(0, 8)}</Typography>
          <Chip 
            label={order.status} 
            color={order.status === 'pending' ? 'warning' : 'success'}
            sx={{ ml: 2 }}
          />
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Customer: {order.customerName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'N/A'}
              </Typography>
              {order.notes && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Notes:</strong> {order.notes}
                </Typography>
              )}
            </Paper>
            
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Qty</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
  {order.items.map((item, index) => (
  <TableRow key={index}>
    <TableCell>
      {item.isReward ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalOffer color="success" sx={{ mr: 1 }} />
          {item.name} (FREE)
        </Box>
      ) : (
        item.name
      )}
    </TableCell>
    <TableCell align="right">
      {item.isReward ? 'FREE' : `₱${item.price.toFixed(2)}`}
    </TableCell>
    <TableCell align="center">{item.quantity}</TableCell>
    <TableCell align="right">
      {item.isReward ? 'FREE' : `₱${(item.price * item.quantity).toFixed(2)}`}
    </TableCell>
  </TableRow>
))}
  
  {/* Add rewards/discounts display */}
  {order.discountApplied > 0 && (
    <TableRow>
      <TableCell colSpan={3} align="right">
        <Typography color="error">
          {order.rewardUsed || 'Discount'}:
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography color="error">
          -₱{order.discountApplied.toFixed(2)}
        </Typography>
      </TableCell>
    </TableRow>
  )}
  
  <TableRow>
    <TableCell colSpan={3} align="right">
      <strong>Subtotal:</strong>
    </TableCell>
    <TableCell align="right">
      <strong>₱{order.total?.toFixed(2) || '0.00'}</strong>
    </TableCell>
  </TableRow>
  
  {/* Show points earned/deducted if available */}
  {(order.pointsEarned > 0 || order.pointsDeducted > 0) && (
    <>
      {order.pointsEarned > 0 && (
        <TableRow>
          <TableCell colSpan={3} align="right">
            Points Earned:
          </TableCell>
          <TableCell align="right">
            +{order.pointsEarned} pts
          </TableCell>
        </TableRow>
      )}
      {order.pointsDeducted > 0 && (
        <TableRow>
          <TableCell colSpan={3} align="right">
            Points Redeemed:
          </TableCell>
          <TableCell align="right">
            -{order.pointsDeducted} pts
          </TableCell>
        </TableRow>
      )}
    </>
  )}
                  {order.payment && (
                    <>
                      <TableRow>
                        <TableCell colSpan={3} align="right">Tax:</TableCell>
                        <TableCell align="right">₱0.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <strong>Total:</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>₱{order.total?.toFixed(2) || '0.00'}</strong>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} align="right">Payment Method:</TableCell>
                        <TableCell align="right">
                          ₱{order.payment?.method
  ? order.payment.method.charAt(0).toUpperCase() + order.payment.method.slice(1)
  : 'N/A'}

                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} align="right">Amount Tendered:</TableCell>
                        <TableCell align="right">
                          ₱{order.payment.amount?.toFixed(2) || '0.00'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <strong>Change Due:</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>₱{changeDue}</strong>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {order.status === 'pending' ? (
  <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
    <Typography variant="subtitle1" gutterBottom>
      Process Payment
    </Typography>
    
    {/* Add rewards summary before payment */}
    {order.discountApplied > 0 && (
      <Box sx={{ 
        backgroundColor: '#e8f5e9', 
        p: 2, 
        mb: 2, 
        borderRadius: 1 
      }}>
        <Typography variant="body2">
          <strong>Applied Reward:</strong> {order.rewardUsed}
        </Typography>
        <Typography variant="body2">
          <strong>Discount Amount:</strong> -₱{order.discountApplied.toFixed(2)}
        </Typography>
        {order.pointsDeducted > 0 && (
          <Typography variant="body2">
            <strong>Points Deducted:</strong> {order.pointsDeducted} pts
          </Typography>
        )}
      </Box>
    )}
    
    <TextField
      fullWidth
      label="Amount"
      type="number"
      value={paymentAmount}
      onChange={(e) => setPaymentAmount(e.target.value)}
      error={paymentAmount && parseFloat(paymentAmount) < (order.total - (order.discountApplied || 0))}
      helperText={
        paymentAmount && parseFloat(paymentAmount) < (order.total - (order.discountApplied || 0)) ? 
        `Amount must be at least ₱${(order.total - (order.discountApplied || 0)).toFixed(2)}` : ''
      }
      sx={{ mb: 2 }}
      InputProps={{
        startAdornment: <InputAdornment position="start">₱</InputAdornment>,
      }}
    
/>
                <TextField
                  fullWidth
                  select
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Credit Card</MenuItem>
                  <MenuItem value="mobile">Mobile Payment</MenuItem>
                </TextField>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<PaymentIcon />}
                  onClick={handlePayment}
                  disabled={!paymentAmount}
                >
                  Complete Payment
                </Button>
              </Paper>
            ) : (
              <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
    <Typography variant="subtitle1" gutterBottom>
      Payment Details
    </Typography>
    
    {order.discountApplied > 0 && (
      <Box sx={{ mb: 2, p: 1, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
        <Typography variant="body2">
          <strong>Reward Applied:</strong> {order.rewardUsed}
        </Typography>
        <Typography variant="body2">
          <strong>Discount:</strong> -₱{order.discountApplied.toFixed(2)}
        </Typography>
        {order.pointsDeducted > 0 && (
          <Typography variant="body2">
            <strong>Points Used:</strong> {order.pointsDeducted} pts
          </Typography>
        )}
        {order.pointsEarned > 0 && (
          <Typography variant="body2">
            <strong>Points Earned:</strong> +{order.pointsEarned} pts
          </Typography>
        )}
      </Box>
    )}
    
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2">
        <strong>Status:</strong> Completed
      </Typography>
                  <Typography variant="body2">
                    <strong>Payment Method:</strong> {order.payment?.method?.charAt(0).toUpperCase() + order.payment?.method?.slice(1) || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Amount Paid:</strong> ₱{order.payment?.amount?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Change Given:</strong> ₱{changeDue}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Payment Date:</strong> {order.payment?.date?.toDate ? format(order.payment.date.toDate(), 'MMM dd, yyyy HH:mm') : 'N/A'}
                  </Typography>
                </Box>
              </Paper>
            )}
            
            <Paper elevation={0} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Order Actions
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                {order.status === 'pending' && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CloseIcon />}
                      onClick={() => handleProcessOrder('cancelled')}
                    >
                      Cancel Order
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={printReceipt}
                >
                  Print Receipt
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderProcessing;