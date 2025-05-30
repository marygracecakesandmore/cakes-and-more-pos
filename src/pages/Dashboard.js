// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import OrderProcessing from '../pages/orders/OrderProcessing';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { QrCode } from '@mui/icons-material';
import QRCode from 'react-qr-code';
import { RateReview } from '@mui/icons-material';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png';


import { jsPDF } from 'jspdf';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Assessment from '@mui/icons-material/Assessment';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf';
import GridOn from '@mui/icons-material/GridOn';


import OwnerDashboard from './owner/OwnerDashboard';

import History from '@mui/icons-material/History';
import { 
  doc, getDoc, setDoc, collection, query, where, getDocs, 
  orderBy, limit, onSnapshot, serverTimestamp, addDoc, writeBatch 
} from 'firebase/firestore';
// Add these if you're using Material UI icons and components
import Delete from '@mui/icons-material/Delete';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

// MUI Icons
import BarChart from '@mui/icons-material/BarChart';
import Group from '@mui/icons-material/Group';
import Warehouse from '@mui/icons-material/Warehouse';
import TrendingUp from '@mui/icons-material/TrendingUp';
import TrendingDown from '@mui/icons-material/TrendingDown';
import Print from '@mui/icons-material/Print';
import Email from '@mui/icons-material/Email';
import Forum from '@mui/icons-material/Forum';
import MoreVert from '@mui/icons-material/MoreVert';
import Add from '@mui/icons-material/Add';
import Person from '@mui/icons-material/Person';
import Description from '@mui/icons-material/Description';
import TableRestaurant from '@mui/icons-material/TableRestaurant';
import ViewList from '@mui/icons-material/ViewList';
import Queue from '@mui/icons-material/Queue';
import School from '@mui/icons-material/School';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import PointOfSale from '@mui/icons-material/PointOfSale';

// MUI Component
import Rating from '@mui/material/Rating';
import ButtonGroup from '@mui/material/ButtonGroup';

import { 
  Typography, Button, Container, Box, CircularProgress,
  Grid, Paper, Card, CardContent, CardHeader, CardActions,
  Avatar, Divider, List, ListItem, ListItemText, ListItemIcon,
  LinearProgress, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Badge, MenuItem, Select, Snackbar, Alert
} from '@mui/material';
import {
  LocalCafe, People, Inventory, Receipt, AttachMoney,
  Star, Note, Edit, Close, Check, Announcement,
  Report, ShoppingCart, Schedule, AccessTime, Refresh, Cake, BakeryDining, Restaurant, NightsStay, Favorite
} from '@mui/icons-material';
import { format, isToday } from 'date-fns';
import { CalendarToday, SwapHoriz } from '@mui/icons-material';
import { Loyalty, CardGiftcard } from '@mui/icons-material';
import { Lightbulb, WbSunny, AcUnit } from '@mui/icons-material';
import { updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import ListAlt from '@mui/icons-material/ListAlt';
// MUI Icons
import AddCircle from '@mui/icons-material/AddCircle';
import Logout from '@mui/icons-material/Logout';
import Login from '@mui/icons-material/Login';
import Today from '@mui/icons-material/Today';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import Search from '@mui/icons-material/Search';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ChevronRight from '@mui/icons-material/ChevronRight';
import AddShoppingCart from '@mui/icons-material/AddShoppingCart';

// MUI Components
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';

import { 
  IconButton,
  Autocomplete 
} from '@mui/material';
import { increment } from 'firebase/firestore';
   import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
  } from '@mui/material';
  import { deleteDoc } from 'firebase/firestore';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ orders: 0, employees: 0 });
  const [orders, setOrders] = useState([]);
  const [performance, setPerformance] = useState({
    todayOrders: 0,
    todaySales: 0,
    efficiency: 0
  });
  const [salesReportDateRange, setSalesReportDateRange] = useState({
  start: format(new Date(), 'yyyy-MM-dd'),
  end: format(new Date(), 'yyyy-MM-dd')
});
const [allCustomers, setAllCustomers] = useState([]);
const [showAllCustomersDialog, setShowAllCustomersDialog] = useState(false);
const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [shiftNotes, setShiftNotes] = useState('');
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [currentShiftNote, setCurrentShiftNote] = useState(null);
  const [isRefreshingShifts, setIsRefreshingShifts] = useState(false);
  // Add to your state variables
const [showFeedbackForm, setShowFeedbackForm] = useState(false);
const [feedbackCustomer, setFeedbackCustomer] = useState(null);
const [manualCustomerName, setManualCustomerName] = useState('');
const [feedbackRating, setFeedbackRating] = useState(3);
const [feedbackComment, setFeedbackComment] = useState('');
  
  // New state for the requested features
  const [showLowIngredientDialog, setShowLowIngredientDialog] = useState(false);
  const [showSupplyRequestDialog, setShowSupplyRequestDialog] = useState(false);
  const [ingredient, setIngredient] = useState('');
  const [ingredientLevel, setIngredientLevel] = useState('low');
  const [supplyRequest, setSupplyRequest] = useState('');
  const [currentShift, setCurrentShift] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [upcomingShifts, setUpcomingShifts] = useState([]);
const [showShiftSwapDialog, setShowShiftSwapDialog] = useState(false);
const [selectedShiftForSwap, setSelectedShiftForSwap] = useState(null);
const [swapReason, setSwapReason] = useState('');
const [customerSearch, setCustomerSearch] = useState('');
const [customerResults, setCustomerResults] = useState([]);
const [selectedCustomer, setSelectedCustomer] = useState(null);
const [showLoyaltyDialog, setShowLoyaltyDialog] = useState(false);
const [pointsToRedeem, setPointsToRedeem] = useState(0);
const [availableRewards, setAvailableRewards] = useState([]);
const [productSuggestions, setProductSuggestions] = useState([]);
// Add these state variables to your main Dashboard component
const [showStaffManagement, setShowStaffManagement] = useState(false);
const [staffMembers, setStaffMembers] = useState([]);
const [showInventoryDialog, setShowInventoryDialog] = useState(false);
const [inventoryItems, setInventoryItems] = useState([]);
const [showSalesReportDialog, setShowSalesReportDialog] = useState(false);
const [salesData, setSalesData] = useState([]);
const [shiftSwapRequests, setShiftSwapRequests] = useState([]);
const [supplyRequests, setSupplyRequests] = useState([]);
const [showShiftAssignmentDialog, setShowShiftAssignmentDialog] = useState(false);
const [lowIngredientReports, setLowIngredientReports] = useState([]);
const [showFeedbackQRDialog, setShowFeedbackQRDialog] = useState(false);
const [feedbackFormURL, setFeedbackFormURL] = useState('https://forms.gle/YOUR_GOOGLE_FORM_LINK');
const [newShift, setNewShift] = useState({
  staffId: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  startTime: '09:00',
  endTime: '17:00',
  role: 'barista'
});
const [showAddRewardDialog, setShowAddRewardDialog] = useState(false);
const [newReward, setNewReward] = useState({
  name: '',
  description: '',
  pointsRequired: 100,
  active: true
});

const fetchStaffSalesData = async () => {
  try {
    const startDate = new Date(salesReportDateRange.start);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(salesReportDateRange.end);
    endDate.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'orders'),
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate),
      where('completedBy', '==', user.uid), // Changed from staffId to completedBy
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const salesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));

    return salesData;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    showSnackbar('Failed to fetch sales data', 'error');
    return [];
  }
};

const generatePDFReport = async () => {
  try {
    const salesData = await fetchStaffSalesData();
    if (!salesData || salesData.length === 0) {
      showSnackbar('No sales data found for the selected period', 'info');
      return;
    }

    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm'
    });
    
    // Set document properties
    doc.setProperties({
      title: `Sales Report - ${format(new Date(), 'yyyy-MM-dd')}`,
      subject: 'Staff Sales Report',
      author: userData?.name || user.email,
      creator: 'Mary Grace Cakes and More POS'
    });
    
    let currentY = 20;
    
    // Add centered logo with light blue accent
    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 40;
      const logoX = (pageWidth - logoWidth) / 2; // Center the logo
      doc.addImage(logo, 'PNG', logoX, 10, logoWidth, 20);
    } catch (e) {
      console.warn('Could not load logo:', e);
    }
    
    // Title with light blue theme
    currentY += 25; // Adjusted for centered logo
    doc.setFontSize(18);
    doc.setTextColor(70, 130, 180); // Light blue color
    doc.setFont('helvetica', 'bold');
    doc.text('SALES PERFORMANCE REPORT', 105, currentY, { align: 'center' });
    currentY += 10;
    
    // Subtitle with subtle styling
    doc.setFontSize(12);
    doc.setTextColor(100, 149, 237); // Lighter blue
    doc.text('Mary Grace Cakes and More', 105, currentY, { align: 'center' });
    currentY += 15;
    
    // Report metadata with light styling
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setDrawColor(200, 220, 240); // Very light blue divider
    doc.setLineWidth(0.2);
    doc.line(14, currentY, 196, currentY);
    currentY += 5;
    
    // Metadata columns
    const leftCol = 14;
    const rightCol = 190;
    
    // Report period
    doc.setTextColor(70, 130, 180); // Light blue
    doc.setFont('helvetica', 'bold');
    doc.text('Report Period:', leftCol, currentY);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`${format(new Date(salesReportDateRange.start), 'MMM d, yyyy')} to ${format(new Date(salesReportDateRange.end), 'MMM d, yyyy')}`, leftCol + 28, currentY);
    
    // Staff name
    currentY += 5;
    doc.setTextColor(70, 130, 180);
    doc.setFont('helvetica', 'bold');
    doc.text('Staff Member:', leftCol, currentY);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(userData?.name || user.email, leftCol + 28, currentY);
    
    // Page number
    doc.text(`Page 1`, rightCol, currentY - 5, { align: 'right' });
    currentY += 10;
    
    // Summary stats with light blue accent
    const totalSales = salesData.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = salesData.length;
    
    // Summary box with light background
    doc.setFillColor(240, 248, 255); // Alice blue background
    doc.rect(leftCol, currentY, 182, 20, 'F');
    doc.setDrawColor(200, 220, 240);
    doc.rect(leftCol, currentY, 182, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(70, 130, 180);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY', leftCol + 5, currentY + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Orders: ${totalOrders}`, leftCol + 50, currentY + 7);
    doc.text(`Total Sales: K ${totalSales.toFixed(2)}`, leftCol + 120, currentY + 7);
    currentY += 25;
    
    // Sales table with light blue theme
    const tableData = salesData.map(order => [
      `#${order.orderNumber || order.id.slice(0, 4)}`,

      order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM d, yyyy h:mm a') : format(new Date(order.createdAt), 'MMM d, yyyy h:mm a') || 'N/A',
      order.customerName || 'Walk-in',
      `K ${order.total?.toFixed(2) || '0.00'}`,
      order.status || 'completed'
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [['Order ID', 'Date', 'Customer', 'Amount', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [70, 130, 180], // Light blue header
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: { 
        cellPadding: 5,
        fontSize: 9,
        textColor: 60,
        lineColor: [220, 230, 240] // Very light grid lines
      },
      margin: { left: leftCol },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 20, halign: 'center' }
      },
      pageBreak: 'auto',
      tableLineColor: [220, 230, 240] // Light table border
    });
    
    // Footer with light styling
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setDrawColor(220, 230, 240);
      doc.setLineWidth(0.2);
      doc.line(leftCol, 280, 196, 280);
      doc.text(`Page ${i} of ${pageCount}`, rightCol, 285, { align: 'right' });
      doc.setTextColor(70, 130, 180);
      doc.text('Mary Grace Cakes and More', leftCol, 285);
    }
    
    doc.save('Sales Performance Report.pdf');
    showSnackbar('PDF report generated successfully!', 'success');
  } catch (error) {
    console.error('Error generating PDF:', error);
    showSnackbar('Failed to generate PDF report', 'error');
  }
};

const generateExcelReport = async () => {
  try {
    const salesData = await fetchStaffSalesData();
    if (!salesData || salesData.length === 0) {
      showSnackbar('No sales data found for the selected period', 'info');
      return;
    }

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');
    
    // Add title and metadata with Mary Grace styling
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'MARY GRACE CAKES AND MORE';
    titleCell.font = { 
      size: 16, 
      bold: true,
      color: { argb: '963250' } // Mary Grace brand color
    };
    titleCell.alignment = { horizontal: 'center' };
    
    worksheet.mergeCells('A2:E2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = 'Staff Sales Report';
    subtitleCell.font = { 
      size: 14,
      bold: true
    };
    subtitleCell.alignment = { horizontal: 'center' };
    
    worksheet.mergeCells('A3:E3');
    const dateRangeCell = worksheet.getCell('A3');
    dateRangeCell.value = `From ${format(new Date(salesReportDateRange.start), 'MMM d, yyyy')} to ${format(new Date(salesReportDateRange.end), 'MMM d, yyyy')}`;
    dateRangeCell.alignment = { horizontal: 'center' };
    
    worksheet.getCell('A4').value = `Staff: ${userData?.name || user.email}`;
    worksheet.getCell('A5').value = `Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`;
    
    // Add summary stats with PNG currency
    const totalSales = salesData.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = salesData.length;
    
    worksheet.getCell('A7').value = 'Performance Summary';
    worksheet.getCell('A7').font = { bold: true };
    worksheet.getCell('A8').value = `Total Orders Processed: ${totalOrders}`;
    worksheet.getCell('A9').value = `Total Sales Generated: K ${totalSales.toFixed(2)}`;
    
    // Add table headers with Mary Grace styling
    const headers = ['Order ID', 'Order Number', 'Date', 'Customer', 'Amount (K)', 'Status'];

    worksheet.addRow(headers);
    
    // Style headers
    const headerRow = worksheet.getRow(11);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '963250' } // Mary Grace brand color
      };
      cell.alignment = { horizontal: 'center' };
    });
    
    // Add data rows
    salesData.forEach((order) => {
     const row = worksheet.addRow([
  `#${order.id.slice(0, 4)}`,
  order.orderNumber || 'N/A',
  order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM d, yyyy h:mm a') : format(new Date(order.createdAt), 'MMM d, yyyy h:mm a') || 'N/A',
  order.customerName || 'Walk-in',
  order.total || 0,
  order.status || 'completed'
]);

      
      // Format the amount column with K currency
      const amountCell = row.getCell(4);
      amountCell.numFmt = '"K"#,##0.00';
      
      // Center the status column
      row.getCell(5).alignment = { horizontal: 'center' };
    });
    
    // Auto-fit columns with some padding
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 30);
    });
    
    // Add footer note
    worksheet.mergeCells(`A${worksheet.rowCount + 2}:E${worksheet.rowCount + 2}`);
    const footerCell = worksheet.getCell(`A${worksheet.rowCount}`);
    footerCell.value = 'Mary Grace Cakes and More - Confidential';
    footerCell.font = { italic: true, size: 9 };
    footerCell.alignment = { horizontal: 'center' };
    
    // Save the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Mary Grace Cakes and More - Staff Sales Report.xlsx`);
    showSnackbar('Excel report generated successfully!', 'success');
  } catch (error) {
    console.error('Error generating Excel:', error);
    showSnackbar('Failed to generate Excel report', 'error');
  }
};

const handleAddReward = async () => {
  try {
    await addDoc(collection(db, 'loyaltyRewards'), {
      ...newReward,
      createdAt: serverTimestamp(),
      createdBy: user.uid
    });
    setShowAddRewardDialog(false);
    setNewReward({
      name: '',
      description: '',
      pointsRequired: 100,
      active: true
    });
    fetchAvailableRewards();
    showSnackbar('Reward added successfully!', 'success');
  } catch (error) {
    console.error('Error adding reward:', error);
    showSnackbar('Failed to add reward', 'error');
  }
};

useEffect(() => {
  if (userData?.role !== 'manager') return;

  const fetchLowIngredientReports = async () => {
  const q = query(
    collection(db, 'lowIngredientReports'),
    where('resolved', '==', false),
    orderBy('timestamp', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, async (snapshot) => {
    // Fetch first names for all reports
    const reportsWithNames = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const firstName = await fetchUserFirstName(data.reportedBy);
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate(),
          firstName // Add firstName to the report object
        };
      })
    );
    
    setLowIngredientReports(reportsWithNames);
  });
  
  return unsubscribe;
};

  fetchLowIngredientReports();
}, [userData?.role]);

const handleResolveReport = async (reportId) => {
  try {
    const reportRef = doc(db, 'lowIngredientReports', reportId);
    const reportSnap = await getDoc(reportRef);
    
    if (!reportSnap.exists()) {
      showSnackbar('Report not found', 'error');
      return;
    }
    
    const reportData = reportSnap.data();
    
    // Update the report status
    await updateDoc(reportRef, {
      resolved: true,
      resolvedAt: serverTimestamp(),
      resolvedBy: user.uid,
      resolvedByName: user.displayName || user.email,
      status: 'resolved'
    });
    
    // Create notification
    await createIngredientResolvedNotification(reportData.ingredient, user.uid, reportData.reportedBy);
    
    showSnackbar('Report marked as resolved!', 'success');
  } catch (error) {
    console.error('Error resolving report:', error);
    showSnackbar('Failed to resolve report', 'error');
  }
};

const handleDeleteReward = async (rewardId) => {
  try {
    await deleteDoc(doc(db, 'loyaltyRewards', rewardId));
    fetchAvailableRewards();
    showSnackbar('Reward deleted successfully!', 'success');
  } catch (error) {
    console.error('Error deleting reward:', error);
    showSnackbar('Failed to delete reward', 'error');
  }
};

const [allStaff, setAllStaff] = useState([]);
const [allShifts, setAllShifts] = useState([]);
const [showAllShiftsDialog, setShowAllShiftsDialog] = useState(false);
// Add these with your other state declarations
const [dailySales, setDailySales] = useState({
  today: 0,
  yesterday: 0,
  transactions: 0
});
const [showAllMemosDialog, setShowAllMemosDialog] = useState(false);
const [attendanceLogs, setAttendanceLogs] = useState([]);
const [customerFeedback, setCustomerFeedback] = useState([]);
const [loyaltyData, setLoyaltyData] = useState({
  pointsEarned: 0,
  pointsRedeemed: 0,
  topCustomers: []
});
const [staffPerformance, setStaffPerformance] = useState([]);
const [productPerformance, setProductPerformance] = useState([]);
const [wasteRecords, setWasteRecords] = useState([]);
const [internalMemos, setInternalMemos] = useState([]);
const [dailyTasks, setDailyTasks] = useState([]);
const [reservations, setReservations] = useState([]);
const [queueStatus, setQueueStatus] = useState({
  waiting: 0,
  avgWaitTime: 0
});
const [trainingStatus, setTrainingStatus] = useState([]);
// Add these with your other state declarations
const [showTableManagementDialog, setShowTableManagementDialog] = useState(false);
const [showQueueDialog, setShowQueueDialog] = useState(false);
const [showTrainingDialog, setShowTrainingDialog] = useState(false);
// Add this state near your other state declarations
const [newMemo, setNewMemo] = useState({
  title: '',
  content: ''
});
const [showAddMemoDialog, setShowAddMemoDialog] = useState(false);
const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
const [showAllAnnouncementsDialog, setShowAllAnnouncementsDialog] = useState(false);
const [queue, setQueue] = useState([]);
const [currentOrder, setCurrentOrder] = useState(null);
const [showReservationDialog, setShowReservationDialog] = useState(false);
const [newReservation, setNewReservation] = useState({
  customerName: '',
  partySize: 2,
  date: format(new Date(), 'yyyy-MM-dd'),
  time: '18:00',
  tableNumber: reservations.length + 1
});

const [selectedReservation, setSelectedReservation] = useState(null);
const [showManageReservationDialog, setShowManageReservationDialog] = useState(false);
const [showAllFeedbackDialog, setShowAllFeedbackDialog] = useState(false);

// Updated queue listener with proper error handling
useEffect(() => {
  if (!userData || (userData?.role !== 'manager' && userData?.role !== 'staff' && userData?.role !== 'barista' 
    && userData?.role !== 'cashier' && userData?.role !== 'shift-lead'
  )) return;

  const q = query(
    collection(db, 'queue'),
    where('status', 'in', ['waiting', 'in-progress']),
    orderBy('status'),
    orderBy('createdAt', 'asc')
  );
  
  const unsubscribe = onSnapshot(q, 
    (snapshot) => {
      const queueData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      // Set current order if any order is in-progress
      const inProgressOrder = queueData.find(order => order.status === 'in-progress');
      if (inProgressOrder) {
        setCurrentOrder(inProgressOrder);
      }
      
      // Set queue to waiting orders only
      setQueue(queueData.filter(order => order.status === 'waiting'));
      updateQueueStatus(queueData);
    },
    (error) => {
      console.error("Queue listener error:", error);
      showSnackbar('Error loading queue data', 'error');
    }
  );

  return () => unsubscribe();
}, [userData?.role, userData]);

// Update the queue status calculation
const updateQueueStatus = (queueData) => {
  const now = new Date();
  let totalWaitTime = 0;
  let validOrders = 0;

  queueData.forEach(order => {
    if (order.createdAt) {
      const createdAt = order.createdAt instanceof Date ? 
        order.createdAt : 
        new Date(order.createdAt);
      const waitTime = (now - createdAt) / (1000 * 60); // in minutes
      totalWaitTime += waitTime;
      validOrders++;
    }
  });

  setQueueStatus({
    waiting: queueData.length,
    avgWaitTime: validOrders > 0 ? Math.round(totalWaitTime / validOrders) : 0
  });
};



// Add these functions for queue management
const addToQueue = async (orderId) => {
  try {
    // First check if order exists and is pending
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      showSnackbar('Order not found', 'error');
      return;
    }
    
    if (orderSnap.data().status !== 'pending') {
      showSnackbar('Order is not pending', 'warning');
      return;
    }
    
    // Add to queue
    await addDoc(collection(db, 'queue'), {
      orderId,
      status: 'waiting',
      createdAt: serverTimestamp(),
      customerName: orderSnap.data().customerName || 'Unknown',
      total: orderSnap.data().total || 0,
      items: orderSnap.data().items || []
    });
    
    // Update order status to 'queued'
    await updateDoc(orderRef, {
      status: 'queued'
    });
    
    showSnackbar('Order added to queue', 'success');
  } catch (error) {
    console.error('Error adding to queue:', error);
    showSnackbar('Failed to add to queue', 'error');
  }
};

// Fix the processNextOrder function
const processNextOrder = async () => {
  if (queue.length === 0) {
    showSnackbar('No orders in queue', 'info');
    return;
  }
  
  const nextOrder = queue[0];
  try {
    // Get the full order details
    const orderDoc = await getDoc(doc(db, 'orders', nextOrder.orderId));
    if (!orderDoc.exists()) {
      showSnackbar('Order not found', 'error');
      return;
    }

    const orderData = orderDoc.data();
    const orderNumber = orderData.orderNumber; // Get the actual order number
    
    // Update both order and queue documents in a batch
    const batch = writeBatch(db);
    
    // Update order status
    const orderRef = doc(db, 'orders', nextOrder.orderId);
    batch.update(orderRef, {
      status: 'in-progress',
      startedAt: serverTimestamp(),
      assignedTo: user.uid,
      assignedToName: user.displayName || user.email
    });
    
    // Update queue status
    const queueRef = doc(db, 'queue', nextOrder.id);
    batch.update(queueRef, {
      status: 'in-progress',
      processedAt: serverTimestamp(),
      processedBy: user.uid
    });
    
    await batch.commit();
    
    // Set current order with all necessary data including orderNumber
    setCurrentOrder({
      ...nextOrder,
      ...orderData,
      id: nextOrder.id,
      orderNumber: orderNumber // Ensure orderNumber is included
    });
    
    // Update local queue state
    setQueue(prevQueue => prevQueue.filter(order => order.id !== nextOrder.id));
    
    // Show order number in snackbar instead of ID snippet
    showSnackbar(`Now processing order #${orderNumber}`, 'success');
  } catch (error) {
    console.error('Error processing order:', error);
    showSnackbar('Failed to process order', 'error');
  }
};

const completeCurrentOrder = async () => {
  if (!currentOrder) {
    showSnackbar('No order being processed', 'warning');
    return;
  }

  try {
    // First get the full order details to access orderNumber
    const orderDoc = await getDoc(doc(db, 'orders', currentOrder.orderId));
    if (!orderDoc.exists()) {
      throw new Error('Order document not found');
    }
    const orderData = orderDoc.data();
    const orderNumber = orderData.orderNumber;

    const batch = writeBatch(db);
    
    // Complete the current order
    const orderRef = doc(db, 'orders', currentOrder.orderId);
    batch.update(orderRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
      completedBy: user.uid,
      completedByName: user.displayName || user.email
    });
    
    // Remove from queue
    const queueRef = doc(db, 'queue', currentOrder.id);
    batch.delete(queueRef);
    
    await batch.commit();
    
    // Add activity log WITH ORDER NUMBER
    await addDoc(collection(db, 'activityLogs'), {
      type: 'order_completed',
      description: `Order #${orderNumber} completed`,  // Use actual order number
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || user.email,
      orderId: currentOrder.orderId,
      orderNumber: orderNumber,  // Store order number in log
      timestamp: serverTimestamp()
    });

    // Automatically process the next order if available
    const q = query(
      collection(db, 'queue'),
      where('status', '==', 'waiting'),
      orderBy('createdAt', 'asc'),
      limit(1)
    );
    
    const nextOrderSnapshot = await getDocs(q);
    if (!nextOrderSnapshot.empty) {
      const nextOrderDoc = nextOrderSnapshot.docs[0];
      const nextOrder = {
        id: nextOrderDoc.id,
        ...nextOrderDoc.data(),
        createdAt: nextOrderDoc.data().createdAt?.toDate()
      };
      
      // Get the full order details (including orderNumber)
      const nextOrderDocData = await getDoc(doc(db, 'orders', nextOrder.orderId));
      if (nextOrderDocData.exists()) {
        const nextOrderData = nextOrderDocData.data();
        
        // Update both order and queue documents in a batch
        const nextBatch = writeBatch(db);
        
        // Update order status
        const nextOrderRef = doc(db, 'orders', nextOrder.orderId);
        nextBatch.update(nextOrderRef, {
          status: 'in-progress',
          startedAt: serverTimestamp(),
          assignedTo: user.uid,
          assignedToName: user.displayName || user.email
        });
        
        // Update queue status
        const nextQueueRef = doc(db, 'queue', nextOrder.id);
        nextBatch.update(nextQueueRef, {
          status: 'in-progress',
          processedAt: serverTimestamp(),
          processedBy: user.uid
        });
        
        await nextBatch.commit();
        
        // Set current order with all necessary data including orderNumber
        setCurrentOrder({
          ...nextOrder,
          ...nextOrderData,
          id: nextOrder.id,
          orderNumber: nextOrderData.orderNumber  // Ensure orderNumber is included
        });
        
        showSnackbar(`Now processing order #${nextOrderData.orderNumber}`, 'success');  // Show order number
      }
    } else {
      // No more orders in queue
      setCurrentOrder(null);
      showSnackbar(`Order #${orderNumber} completed successfully`, 'success');  // Show completed order number
    }
  } catch (error) {
    console.error('Error completing order:', error);
    showSnackbar('Failed to complete order', 'error');
  }
};

// Add to your useEffect or data fetching function
const fetchCustomerFeedback = async () => {
  const q = query(
    collection(db, 'customerFeedback'),
    orderBy('timestamp', 'desc'),
    limit(50)
  );
  const querySnapshot = await getDocs(q);
  const feedbackData = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate()
  }));
  setCustomerFeedback(feedbackData);
};

// Add this function to handle memo submission
const handleAddMemo = async () => {
  if (!newMemo.title || !newMemo.content) {
    showSnackbar('Please enter both title and content', 'warning');
    return;
  }

  try {
    await addDoc(collection(db, 'internalMemos'), {
      title: newMemo.title,
      content: newMemo.content,
      postedBy: user.displayName || user.email,
      timestamp: serverTimestamp()
    });
    
    setShowAddMemoDialog(false);
    setNewMemo({ title: '', content: '' });
    showSnackbar('Memo added successfully!', 'success');
  } catch (error) {
    console.error('Error adding memo:', error);
    showSnackbar('Failed to add memo', 'error');
  }
};

// Add this useEffect hook near your other useEffect hooks in the manager dashboard section
useEffect(() => {
  if (userData?.role !== 'manager') return;

  // Fetch internal memos
  const fetchInternalMemos = async () => {
  const q = query(
    collection(db, 'internalMemos'),
    orderBy('timestamp', 'desc'),
    limit(10)
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    setInternalMemos(snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure timestamp is properly converted to Date
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
      };
    }));
  });
  return unsubscribe;
};

  fetchInternalMemos();
}, [userData?.role]);

useEffect(() => {
  // Fetch internal memos
  const fetchInternalMemos = async () => {
    const q = query(
      collection(db, 'internalMemos'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInternalMemos(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })));
    });
    return unsubscribe;
  };

  fetchInternalMemos();
}, []);

const getManagerAndOwnerIds = async () => {
  const q = query(
    collection(db, 'users'),
    where('role', 'in', ['manager', 'owner'])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.id);
};

/**
 * Creates a notification when a staff member reports low ingredients
 * @param {string} ingredient - The ingredient that's low
 * @param {string} level - The severity level ('low', 'very_low', 'out')
 * @param {string} reportedById - The user ID of the staff who reported it
 */
const createLowIngredientNotification = async (ingredient, level, reportedById) => {
  try {
    const staffDoc = await getDoc(doc(db, 'users', reportedById));
    const staffName = staffDoc.exists() ? 
      `${staffDoc.data().firstName} ${staffDoc.data().lastName}` : 
      'Unknown staff';

    // Get all manager/owner IDs
    const managerOwnerIds = await getManagerAndOwnerIds();

    // Create notification for each manager/owner
    await Promise.all(managerOwnerIds.map(async (userId) => {
      await addDoc(collection(db, 'notifications'), {
        type: 'low_ingredient',
        title: 'Low Ingredient Reported',
        message: `${staffName} reported ${ingredient} as ${getIngredientLevelText(level)}`,
        relatedDocId: null,
        recipients: [userId], // Send to each manager/owner individually
        readBy: [],
        createdAt: serverTimestamp(),
        createdBy: reportedById,
        priority: level === 'out' ? 'high' : 'medium'
      });
    }));

    // Acknowledgment for staff
    await addDoc(collection(db, 'notifications'), {
      type: 'low_ingredient_ack',
      title: 'Low Ingredient Reported',
      message: `Your report for ${ingredient} has been received`,
      relatedDocId: null,
      recipients: [reportedById],
      readBy: [],
      createdAt: serverTimestamp(),
      createdBy: 'system',
      priority: 'low'
    });
  } catch (error) {
    console.error('Error creating low ingredient notification:', error);
  }
};

/**
 * Creates a notification when a staff member requests supplies
 * @param {string} request - The supply request details
 * @param {string} requestedById - The user ID of the staff who made the request
 */
const createSupplyRequestNotification = async (request, requestedById) => {
  try {
    const staffDoc = await getDoc(doc(db, 'users', requestedById));
    const staffName = staffDoc.exists() ? 
      `${staffDoc.data().firstName} ${staffDoc.data().lastName}` : 
      'Unknown staff';

    // Get all manager/owner IDs
    const managerOwnerIds = await getManagerAndOwnerIds();

    // Create notification for each manager/owner
    await Promise.all(managerOwnerIds.map(async (userId) => {
      await addDoc(collection(db, 'notifications'), {
        type: 'supply_request',
        title: 'New Supply Request',
        message: `${staffName} requested: ${request}`,
        relatedDocId: null,
        recipients: [userId],
        readBy: [],
        createdAt: serverTimestamp(),
        createdBy: requestedById,
        priority: 'medium'
      });
    }));

    // Acknowledgment for staff
    await addDoc(collection(db, 'notifications'), {
      type: 'supply_request_ack',
      title: 'Supply Request Submitted',
      message: `Your request for "${request}" has been received`,
      relatedDocId: null,
      recipients: [requestedById],
      readBy: [],
      createdAt: serverTimestamp(),
      createdBy: 'system',
      priority: 'low'
    });
  } catch (error) {
    console.error('Error creating supply request notification:', error);
  }
};

useEffect(() => {
  if (!currentOrder && queue.length > 0) {
    const timer = setTimeout(() => {
      processNextOrder();
    }, 1000); // Small delay to allow state updates
    
    return () => clearTimeout(timer);
  }
}, [currentOrder, queue]);

/**
 * Creates a notification when a staff member requests a shift swap
 * @param {string} shiftId - The ID of the shift being swapped
 * @param {string} reason - The reason for the swap
 * @param {string} requestedById - The user ID of the staff who requested the swap
 */
const createShiftSwapRequestNotification = async (shiftId, reason, requestedById) => {
  try {
    const staffDoc = await getDoc(doc(db, 'users', requestedById));
    const staffName = staffDoc.exists() ? 
      `${staffDoc.data().firstName} ${staffDoc.data().lastName}` : 
      'Unknown staff';

    const shiftDoc = await getDoc(doc(db, 'shifts', shiftId));
    const shiftDate = shiftDoc.exists() ? 
      format(new Date(shiftDoc.data().date), 'MMM dd, yyyy') : 
      'unknown date';

    // Get all manager IDs
    const managerIds = await getManagerAndOwnerIds();

    // Create notification for each manager
    await Promise.all(managerIds.map(async (userId) => {
      await addDoc(collection(db, 'notifications'), {
        type: 'shift_swap_request',
        title: 'New Shift Swap Request',
        message: `${staffName} requested to swap shift on ${shiftDate}. Reason: ${reason}`,
        relatedDocId: shiftId,
        recipients: [userId],
        readBy: [],
        createdAt: serverTimestamp(),
        createdBy: requestedById,
        priority: 'medium'
      });
    }));

    // Acknowledgment for staff
    await addDoc(collection(db, 'notifications'), {
      type: 'shift_swap_request_ack',
      title: 'Shift Swap Requested',
      message: `Your request to swap shift on ${shiftDate} has been received`,
      relatedDocId: shiftId,
      recipients: [requestedById],
      readBy: [],
      createdAt: serverTimestamp(),
      createdBy: 'system',
      priority: 'low'
    });
  } catch (error) {
    console.error('Error creating shift swap notification:', error);
  }
};

const fetchAllLoyaltyCustomers = async () => {
  setIsLoadingCustomers(true);
  try {
    const q = query(collection(db, 'loyaltyCustomers'), orderBy('joinedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const customers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt // Keep as timestamp
    }));
    setAllCustomers(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    showSnackbar('Error loading customers', 'error');
  } finally {
    setIsLoadingCustomers(false);
  }
};

/**
 * Creates a notification when a manager accepts a shift swap request
 * @param {string} shiftId - The ID of the shift being swapped
 * @param {string} requestedById - The user ID who originally requested the swap
 * @param {string} approvedById - The manager's user ID who approved it
 */
const createShiftSwapApprovalNotification = async (shiftId, requestedById, approvedById) => {
  try {
    // Get manager's name
    const managerDoc = await getDoc(doc(db, 'users', approvedById));
    const managerName = managerDoc.exists() ? 
      `${managerDoc.data().firstName} ${managerDoc.data().lastName}` : 
      'Manager';

    // Get shift details
    const shiftDoc = await getDoc(doc(db, 'shifts', shiftId));
    const shiftDate = shiftDoc.exists() ? 
      format(new Date(shiftDoc.data().date), 'MMM dd, yyyy') : 
      'unknown date';

    // Create notification for the staff who requested the swap
    await addDoc(collection(db, 'notifications'), {
      type: 'shift_swap_approved',
      title: 'Shift Swap Approved',
      message: `${managerName} has approved your shift swap request for ${shiftDate}`,
      relatedDocId: shiftId,
      recipients: [requestedById],
      readBy: [],
      createdAt: serverTimestamp(),
      createdBy: approvedById,
      priority: 'high'
    });
  } catch (error) {
    console.error('Error creating shift swap approval notification:', error);
  }
};

const createShiftSwapRejectionNotification = async (shiftId, requestedById, rejectedById) => {
  try {
    // Get manager's name
    const managerDoc = await getDoc(doc(db, 'users', rejectedById));
    const managerName = managerDoc.exists() ? 
      `${managerDoc.data().firstName} ${managerDoc.data().lastName}` : 
      'Manager';

    // Get shift details
    const shiftDoc = await getDoc(doc(db, 'shifts', shiftId));
    const shiftDate = shiftDoc.exists() ? 
      format(new Date(shiftDoc.data().date), 'MMM dd, yyyy') : 
      'unknown date';

    // Create notification for the staff who requested the swap
    await addDoc(collection(db, 'notifications'), {
      type: 'shift_swap_rejected',
      title: 'Shift Swap Rejected',
      message: `${managerName} has rejected your shift swap request for ${shiftDate}`,
      relatedDocId: shiftId,
      recipients: [requestedById],
      readBy: [],
      createdAt: serverTimestamp(),
      createdBy: rejectedById,
      priority: 'high'
    });
  } catch (error) {
    console.error('Error creating shift swap rejection notification:', error);
  }
};

/**
 * Creates a notification when a manager resolves a low ingredient report
 * @param {string} ingredient - The ingredient that was resolved
 * @param {string} resolvedById - The manager's user ID who resolved it
 * @param {string} reportedById - The original staff who reported it
 */
const createIngredientResolvedNotification = async (ingredient, resolvedById, reportedById) => {
  try {
    // Get manager's name
    const managerDoc = await getDoc(doc(db, 'users', resolvedById));
    const managerName = managerDoc.exists() ? 
      `${managerDoc.data().firstName} ${managerDoc.data().lastName}` : 
      'Manager';

    // Create notification for the original reporter
    await addDoc(collection(db, 'notifications'), {
      type: 'ingredient_resolved',
      title: 'Ingredient Restocked',
      message: `${managerName} has resolved your low ingredient report for ${ingredient}`,
      relatedDocId: null,
      recipients: [reportedById],
      readBy: [],
      createdAt: serverTimestamp(),
      createdBy: resolvedById,
      priority: 'medium'
    });
  } catch (error) {
    console.error('Error creating ingredient resolved notification:', error);
  }
};

/**
 * Creates a notification when a manager fulfills a supply request
 * @param {string} request - The supply request that was fulfilled
 * @param {string} fulfilledById - The manager's user ID who fulfilled it
 * @param {string} requestedById - The original staff who requested it
 */
const createSupplyRequestFulfilledNotification = async (request, fulfilledById, requestedById) => {
  try {
    // Get manager's name
    const managerDoc = await getDoc(doc(db, 'users', fulfilledById));
    const managerName = managerDoc.exists() ? 
      `${managerDoc.data().firstName} ${managerDoc.data().lastName}` : 
      'Manager';

    // Create notification for the original requester
    await addDoc(collection(db, 'notifications'), {
      type: 'supply_request_fulfilled',
      title: 'Supply Request Fulfilled',
      message: `${managerName} has fulfilled your request for "${request}"`,
      relatedDocId: null,
      recipients: [requestedById],
      readBy: [],
      createdAt: serverTimestamp(),
      createdBy: fulfilledById,
      priority: 'medium'
    });
  } catch (error) {
    console.error('Error creating supply fulfilled notification:', error);
  }
};

/**
 * Creates a notification when a manager assigns a shift to a staff member
 * @param {string} shiftId - The ID of the assigned shift
 * @param {string} staffId - The staff member's user ID
 * @param {string} assignedById - The manager's user ID who assigned the shift
 */
const createShiftAssignedNotification = async (shiftId, staffId, assignedById) => {
  try {
    // Get manager's name
    const managerDoc = await getDoc(doc(db, 'users', assignedById));
    const managerName = managerDoc.exists() ? 
      `${managerDoc.data().firstName} ${managerDoc.data().lastName}` : 
      'Manager';

    // Get shift details
    const shiftDoc = await getDoc(doc(db, 'shifts', shiftId));
    const shiftDate = shiftDoc.exists() ? 
      format(new Date(shiftDoc.data().date), 'MMM dd, yyyy') : 
      'unknown date';
    const shiftTime = shiftDoc.exists() ? 
      `${shiftDoc.data().scheduledStart} - ${shiftDoc.data().scheduledEnd}` : 
      'unknown time';

    // Create notification for the assigned staff member
    await addDoc(collection(db, 'notifications'), {
      type: 'shift_assigned',
      title: 'New Shift Assigned',
      message: `${managerName} assigned you a shift on ${shiftDate} (${shiftTime})`,
      relatedDocId: shiftId,
      recipients: [staffId],
      readBy: [],
      createdAt: serverTimestamp(),
      createdBy: assignedById,
      priority: 'high'
    });
  } catch (error) {
    console.error('Error creating shift assigned notification:', error);
  }
};

// Helper function to get human-readable text for ingredient level
const getIngredientLevelText = (level) => {
  switch(level) {
    case 'low': return 'running low';
    case 'very_low': return 'very low';
    case 'out': return 'out of stock';
    default: return 'low';
  }
};

// Add these useEffect hooks in your manager dashboard section
useEffect(() => {
  if (userData?.role !== 'manager') return;

  // Fetch daily sales data
  const fetchDailySales = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', today),
      where('status', '==', 'completed')
    );
    const yesterdayQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', yesterday),
      where('createdAt', '<', today),
      where('status', '==', 'completed')
    );

    const [todaySnapshot, yesterdaySnapshot] = await Promise.all([
      getDocs(todayQuery),
      getDocs(yesterdayQuery)
    ]);

    setDailySales({
      today: todaySnapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0),
      yesterday: yesterdaySnapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0),
      transactions: todaySnapshot.size
    });
  };

  const addToQueue = async (orderId) => {
  try {
    // First check if order exists and is pending
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      showSnackbar('Order not found', 'error');
      return;
    }
    
    if (orderSnap.data().status !== 'pending') {
      showSnackbar('Order is not pending', 'warning');
      return;
    }
    
    // Add to queue
    await addDoc(collection(db, 'queue'), {
      orderId,
      status: 'waiting',
      createdAt: serverTimestamp(),
      customerName: orderSnap.data().customerName || 'Unknown',
      total: orderSnap.data().total || 0
    });
    
    // Update order status to 'queued'
    await updateDoc(orderRef, {
      status: 'queued'
    });
    
    showSnackbar('Order added to queue', 'success');
  } catch (error) {
    console.error('Error adding to queue:', error);
    showSnackbar('Failed to add to queue', 'error');
  }
};

  // Fetch attendance logs
  const fetchAttendanceLogs = async () => {
    const q = query(
      collection(db, 'shifts'),
      where('date', '==', format(new Date(), 'yyyy-MM-dd')),
      orderBy('clockIn', 'desc')
    );
    const snapshot = await getDocs(q);
    setAttendanceLogs(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      clockIn: doc.data().clockIn?.toDate(),
      clockOut: doc.data().clockOut?.toDate()
    })));
  };

  const fetchCustomerFeedback = async () => {
  const q = query(
    collection(db, 'customerFeedback'),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  const querySnapshot = await getDocs(q);
  const feedbackData = await Promise.all(
    querySnapshot.docs.map(async (feedbackDoc) => {
      const data = feedbackDoc.data();

      // Fetch staff first name
      let firstName = 'Staff';
      if (data.staffId) {
        const staffDoc = await getDoc(doc(db, 'users', data.staffId));
        if (staffDoc.exists()) {
          firstName = staffDoc.data().firstName || 'Staff';
        }
      }

      return {
        id: feedbackDoc.id,
        ...data,
        timestamp: data.timestamp?.toDate(),
        staffFirstName: firstName,
      };
    })
  );

  setCustomerFeedback(feedbackData);
};


  // Fetch loyalty data
  const fetchLoyaltyData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pointsEarnedQuery = query(
      collection(db, 'loyaltyPoints'),
      where('timestamp', '>=', today)
    );
    const pointsRedeemedQuery = query(
      collection(db, 'loyaltyRedemptions'),
      where('timestamp', '>=', today)
    );

    const [earnedSnapshot, redeemedSnapshot] = await Promise.all([
      getDocs(pointsEarnedQuery),
      getDocs(pointsRedeemedQuery)
    ]);

    setLoyaltyData({
      pointsEarned: earnedSnapshot.size,
      pointsRedeemed: redeemedSnapshot.size,
      topCustomers: [] // You'll need to implement this separately
    });
  };

  // Call all fetch functions
  fetchDailySales();
  fetchAttendanceLogs();
  fetchCustomerFeedback();
  fetchLoyaltyData();
}, [userData?.role]);

// Update this useEffect for fetching all shifts
useEffect(() => {
  if (userData?.role !== 'manager') return;

  const fetchAllShifts = async () => {
    const q = query(
      collection(db, 'shifts'),
      where('assignedBy', '==', user.uid), // Only show shifts assigned by this manager
      orderBy('date', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    const shiftsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date,
      clockIn: doc.data().clockIn?.toDate(),
      clockOut: doc.data().clockOut?.toDate()
    }));
    setAllShifts(shiftsData);
  };

  fetchAllShifts();
}, [userData?.role, user?.uid]); // Add user.uid to dependencies

const handleAssignShift = async () => {
  if (!newShift.staffId || !newShift.date) {
    showSnackbar('Please select staff and date', 'warning');
    return;
  }

  try {
    const shiftData = {
      userId: newShift.staffId,
      userEmail: allStaff.find(s => s.id === newShift.staffId)?.email,
      userName: allStaff.find(s => s.id === newShift.staffId)?.firstName + ' ' + 
                allStaff.find(s => s.id === newShift.staffId)?.lastName,
      date: newShift.date,
      clockIn: null,
      clockOut: null,
      scheduledStart: newShift.startTime,
      scheduledEnd: newShift.endTime,
      role: newShift.role,
      assignedBy: user.uid,
      assignedByName: user.displayName || user.email,
      assignedAt: serverTimestamp(),
      status: 'scheduled',
      duration: 0
    };

    // Create the shift
    const shiftRef = await addDoc(collection(db, 'shifts'), shiftData);
    
    // Create notification
    await createShiftAssignedNotification(shiftRef.id, newShift.staffId, user.uid);
    
    setShowShiftAssignmentDialog(false);
    setNewShift({
      staffId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '17:00',
      role: 'barista'
    });
    
    showSnackbar('Shift assigned successfully!', 'success');
  } catch (error) {
    console.error('Error assigning shift:', error);
    showSnackbar('Failed to assign shift', 'error');
  }
};

const fetchAllStaff = async () => {
  const q = query(collection(db, 'users'), where('role', 'in', ['staff', 'barista', 'cashier', 'shift-lead']));
  const querySnapshot = await getDocs(q);
  const staffData = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  setAllStaff(staffData);
};

useEffect(() => {
  if (userData?.role === 'manager') {
    fetchAllStaff();
    fetchAvailableRewards();
    
  }
}, [userData?.role]);

// Add these useEffect hooks to your main Dashboard component
useEffect(() => {
  if (userData?.role !== 'manager') return;
  
  const fetchStaff = async () => {
    const q = query(collection(db, 'users'), where('role', '==', 'staff', 'barista', 'cashier', 'shift-lead'));
    const querySnapshot = await getDocs(q);
    const staffData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setStaffMembers(staffData);
  };
  fetchStaff();
}, [userData?.role]);

// Add these useEffect hooks in your manager dashboard section
useEffect(() => {
  if (userData?.role !== 'manager') return;

  // Fetch reservations
  const fetchReservations = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const q = query(
    collection(db, 'reservations'),
    where('date', '>=', format(today, 'yyyy-MM-dd')),
    orderBy('date', 'asc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const reservationsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      date: doc.data().date, // already in yyyy-MM-dd format
      time: doc.data().time, // stored as "HH:mm"
      status: doc.data().status || 'Reserved'
    }));
    setReservations(reservationsData);
  });
  
  return unsubscribe;
};

  // Fetch queue status
  const fetchQueueStatus = async () => {
    const q = query(collection(db, 'queue'), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      setQueueStatus(snapshot.docs[0].data());
    }
  };

  // Fetch training status
  const fetchTrainingStatus = async () => {
    const q = query(collection(db, 'trainingProgress'), limit(10));
    const snapshot = await getDocs(q);
    setTrainingStatus(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      completedAt: doc.data().completedAt?.toDate()
    })));
  };

  fetchReservations();
  fetchQueueStatus();
  fetchTrainingStatus();
}, [userData?.role]);

useEffect(() => {
  if (userData?.role !== 'manager') return;
  
  const fetchInventory = async () => {
    const q = query(collection(db, 'products'));
    const querySnapshot = await getDocs(q);
    const inventoryData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setInventoryItems(inventoryData);
  };
  fetchInventory();
}, [userData?.role]);

useEffect(() => {
  if (userData?.role !== 'manager') return;
  
  const fetchSalesData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const q = query(
      collection(db, 'orders'),
      where('createdAt', '>=', today),
      where('status', '==', 'completed')
    );
    
    const querySnapshot = await getDocs(q);
    const sales = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setSalesData(sales);
  };
  fetchSalesData();
}, [userData?.role]);

const fetchUserFirstName = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data().firstName : userId; // fallback to userId if no doc
};



// Move these functions outside of useEffect
const fetchShiftSwapRequests = async () => {
  if (userData?.role !== 'manager') return;
  
  const q = query(
    collection(db, 'shiftSwapRequests'),
    where('status', '==', 'pending')
  );
  const querySnapshot = await getDocs(q);
  
  // Fetch first names for all requests
  const requestsWithNames = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const firstName = await fetchUserFirstName(data.requestedBy);
      return {
        id: doc.id,
        ...data,
        firstName // Add firstName to the request object
      };
    })
  );
  
  setShiftSwapRequests(requestsWithNames);
};

const calculateAverageWaitTime = (queue) => {
  if (queue.length === 0) return 0;
  
  const now = new Date();
  const totalWait = queue.reduce((sum, order) => {
    const createdAt = order.createdAt instanceof Date ? 
      order.createdAt : 
      new Date(order.createdAt?.seconds * 1000) || now;
    return sum + (now - createdAt) / (1000 * 60); // minutes
  }, 0);
  
  return Math.round(totalWait / queue.length);
};

const fetchSupplyRequests = async () => {
  if (userData?.role !== 'manager') return;
  
  const q = query(
    collection(db, 'supplyRequests'),
    where('fulfilled', '==', false)
  );
  const querySnapshot = await getDocs(q);
  
  // Fetch first names for all requests
  const requestsWithNames = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const firstName = await fetchUserFirstName(data.requestedBy);
      return {
        id: doc.id,
        ...data,
        firstName // Add firstName to the request object
      };
    })
  );
  
  setSupplyRequests(requestsWithNames);
};

// Then update the useEffect hooks to call these functions
useEffect(() => {
  fetchShiftSwapRequests();
}, [userData?.role]);

useEffect(() => {
  fetchSupplyRequests();
}, [userData?.role]);

  // Fetch user data and initial dashboard data
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    };

    const fetchStats = async () => {
      const ordersQuery = query(collection(db, 'orders'));
      const ordersSnapshot = await getDocs(ordersQuery);
      
      const usersQuery = query(collection(db, 'users'), where('role', '!=', 'customer'));
      const usersSnapshot = await getDocs(usersQuery);
      
      setStats({
        orders: ordersSnapshot.size,
        employees: usersSnapshot.size
      });
    };

    

    const fetchActiveOrders = async () => {
      const q = query(
        collection(db, 'orders'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchStaffPerformance = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        collection(db, 'orders'),
        where('createdBy', '==', user.uid),
        where('createdAt', '>=', today),
        where('status', '==', 'completed')
      );
      
      const querySnapshot = await getDocs(q);
      const todayOrders = querySnapshot.size;
      const todaySales = querySnapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
      const efficiency = Math.min(100, Math.round((todayOrders / 30) * 100));
      
      setPerformance({ todayOrders, todaySales, efficiency });
    };

    const fetchRecentActivity = async () => {
  const q = query(
    collection(db, 'activityLogs'),
    orderBy('timestamp', 'desc'),
    limit(10)
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    setRecentActivity(snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    })));
  });
  return unsubscribe;
};

    


    const fetchCurrentShiftNote = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const noteRef = doc(db, 'shiftNotes', `${user.uid}_${today}`);
      const noteSnap = await getDoc(noteRef);
      
      if (noteSnap.exists()) {
        setCurrentShiftNote(noteSnap.data());
        setShiftNotes(noteSnap.data().notes);
      }
    };

    const fetchCurrentShift = async () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const shiftsRef = collection(db, 'shifts');
  const q = query(
    shiftsRef,
    where('userId', '==', user.uid),
    where('date', '==', today),
    orderBy('clockIn', 'desc'),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const shiftData = querySnapshot.docs[0].data();
    const clockIn = shiftData.clockIn?.toDate();
    const clockOut = shiftData.clockOut?.toDate();
    
    // Determine status based on clock in/out times
    let status;
    if (clockIn && !clockOut) {
      status = 'in-progress';
    } else if (clockIn && clockOut) {
      status = 'completed';
    } else {
      status = 'scheduled';
    }
    
    setCurrentShift({ 
      id: querySnapshot.docs[0].id, 
      ...shiftData,
      clockIn,
      clockOut,
      status // Use the determined status
    });
  } else {
    setCurrentShift(null);
  }
};

    fetchUserData();
    fetchStats();
    fetchActiveOrders();
    fetchStaffPerformance();
    fetchRecentActivity();
    fetchCurrentShiftNote();
    fetchCurrentShift();

    // Set up real-time listener for announcements
    const announcementsQuery = query(
      collection(db, 'announcements'),
      orderBy('timestamp', 'desc'),
      limit(3)
    );
    
    const unsubscribeAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeAnnouncements();
    };
  }, [user]);

  const submitFeedback = async () => {
  try {
    // Create feedback document
    const feedbackRef = await addDoc(collection(db, 'customerFeedback'), {
      customerId: feedbackCustomer?.id || null,
      customerName: feedbackCustomer?.name || manualCustomerName || 'Anonymous',
      cardNumber: feedbackCustomer?.cardNumber || null,
      rating: feedbackRating,
      comment: feedbackComment,
      timestamp: serverTimestamp(),
      staffId: user.uid,
      staffName: user.displayName,
      location: 'In-store' // Could be dynamic if you have multiple locations
    });

    // Add loyalty points if it's a registered customer
    if (feedbackCustomer?.id) {
      await updateDoc(doc(db, 'loyaltyCustomers', feedbackCustomer.id), {
        points: increment(5) // Add 5 points for feedback
      });
      
      // Record points transaction
      await addDoc(collection(db, 'loyaltyPointsTransactions'), {
        customerId: feedbackCustomer.id,
        customerName: feedbackCustomer.name,
        cardNumber: feedbackCustomer.cardNumber,
        pointsChange: 5,
        reason: 'Feedback submission',
        timestamp: serverTimestamp(),
        feedbackId: feedbackRef.id
      });
    }

    showSnackbar('Feedback submitted successfully!', 'success');
    setShowFeedbackForm(false);
    setFeedbackCustomer(null);
    setManualCustomerName('');
    setFeedbackRating(3);
    setFeedbackComment('');
  } catch (error) {
    console.error('Error submitting feedback:', error);
    showSnackbar('Failed to submit feedback', 'error');
  }
};

  const fetchCurrentShift = async () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const shiftsRef = collection(db, 'shifts');
  const q = query(
    shiftsRef,
    where('userId', '==', user.uid),
    where('date', '==', today),
    orderBy('clockIn', 'desc'),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const shiftData = querySnapshot.docs[0].data();
    const clockIn = shiftData.clockIn?.toDate();
    const clockOut = shiftData.clockOut?.toDate();
    
    // Determine status based on clock in/out times
    let status;
    if (clockIn && !clockOut) {
      status = 'in-progress';
    } else if (clockIn && clockOut) {
      status = 'completed';
    } else {
      status = 'scheduled';
    }
    
    setCurrentShift({ 
      id: querySnapshot.docs[0].id, 
      ...shiftData,
      clockIn,
      clockOut,
      status // Use the determined status
    });
  } else {
    setCurrentShift(null);
  }
};



  const fetchUpcomingShifts = async () => {
  setIsRefreshingShifts(true);
  try {
    const today = new Date();
    let q;
    
    if (userData?.role === 'manager') {
      q = query(
        collection(db, 'shifts'),
        where('assignedBy', '==', user.uid),
        where('date', '>=', format(today, 'yyyy-MM-dd')),
        orderBy('date', 'asc')
      );
    } else {
      q = query(
        collection(db, 'shifts'),
        where('userId', '==', user.uid),
        where('date', '>=', format(today, 'yyyy-MM-dd')),
        orderBy('date', 'asc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const shifts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date,
        clockIn: data.clockIn?.toDate(),
        clockOut: data.clockOut?.toDate(),
        status: data.status || 'scheduled'
      };
    });
    
    setUpcomingShifts(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    showSnackbar('Failed to refresh shifts', 'error');
  } finally {
    setIsRefreshingShifts(false);
  }
};


useEffect(() => {
  if (!user) return;
  
  fetchUpcomingShifts();
  
  // Set up real-time listener for shifts
  const today = new Date();
  let q;
  
  if (userData?.role === 'manager') {
    q = query(
      collection(db, 'shifts'),
      where('assignedBy', '==', user.uid),
      where('date', '>=', format(today, 'yyyy-MM-dd')),
      orderBy('date', 'asc')
    );
  } else {
    q = query(
      collection(db, 'shifts'),
      where('userId', '==', user.uid),
      where('date', '>=', format(today, 'yyyy-MM-dd')),
      orderBy('date', 'asc')
    );
  }
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const shifts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date,
        clockIn: data.clockIn?.toDate(),
        clockOut: data.clockOut?.toDate(),
        status: data.status || 'scheduled'
      };
    });
    setUpcomingShifts(shifts);
  });
  
  return () => unsubscribe();
}, [user, userData?.role]);



useEffect(() => {
  if (!customerSearch || customerSearch.length < 2) {
    setCustomerResults([]);
    return;
  }

  const searchCustomers = async () => {
    try {
      const searchTerm = customerSearch.toLowerCase();
      const customersRef = collection(db, 'loyaltyCustomers');

      // Fetch up to 50 customers (adjust as needed)
      const snapshot = await getDocs(query(customersRef, limit(50)));

      const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(customer => {
          const name = customer.name?.toLowerCase() || '';
          const email = customer.email?.toLowerCase() || '';
          const card = customer.cardNumber?.toLowerCase() || '';
          return (
            name.includes(searchTerm) ||
            email.includes(searchTerm) ||
            card.includes(searchTerm)
          );
        });

      setCustomerResults(results);
    } catch (error) {
      console.error('Error searching customers:', error);
      showSnackbar('Error searching customers', 'error');
    }
  };

  const timer = setTimeout(searchCustomers, 300);
  return () => clearTimeout(timer);
}, [customerSearch]);


const getBakerySuggestions = () => {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth();
  const isHot = hour >= 10 && hour <= 18 && month >= 5 && month <= 8; // Summer months, daytime
  const isCold = hour <= 8 || hour >= 20 || month <= 2 || month >= 10; // Early/late hours or winter months

  const suggestions = [];
  
  // Weather-based suggestions
  if (isHot) {
    suggestions.push({
      message: "It's a warm day — perfect for our refreshing treats!",
      products: ["Iced Lemon Cake", "Fruit Tartlets", "Chilled Cheesecake", "Mango Mousse"],
      icon: <WbSunny color="warning" />
    });
  } else if (isCold) {
    suggestions.push({
      message: "Cozy up with our warm comfort desserts!",
      products: ["Hot Chocolate Fudge Cake", "Bread Pudding", "Apple Pie", "Cinnamon Rolls"],
      icon: <AcUnit color="info" />
    });
  }

  // Time-based suggestions
  if (hour >= 6 && hour <= 10) {
    suggestions.push({
      message: "Good morning! Try our fresh breakfast pastries",
      products: ["Croissants", "Danish Pastries", "Morning Buns", "Scones"],
      icon: <WbSunny color="secondary" />
    });
  } else if (hour >= 11 && hour <= 14) {
    suggestions.push({
      message: "Lunch time! Pair your meal with our specialties",
      products: ["Quiche", "Savory Pies", "Sandwich Breads", "Salad Bread Bowls"],
      icon: <Restaurant color="primary" />
    });
  } else if (hour >= 15 && hour <= 17) {
    suggestions.push({
      message: "Afternoon tea time! Enjoy our sweet treats",
      products: ["Macarons", "Petit Fours", "Tea Cakes", "Madeleines"],
      icon: <LocalCafe color="primary" />
    });
  } else if (hour >= 18 && hour <= 21) {
    suggestions.push({
      message: "Evening dessert specials",
      products: ["Chocolate Lava Cake", "Tiramisu", "Crème Brûlée", "Seasonal Cake Slices"],
      icon: <NightsStay color="primary" />
    });
  }

  // Special occasion detection
  const day = now.getDate();
  if ((month === 1 && day === 14) || (month === 1 && now.getDay() === 6 && day >= 7 && day <= 14)) {
    suggestions.push({
      message: "Valentine's Specials!",
      products: ["Heart-shaped Cakes", "Chocolate Strawberry Tart", "Red Velvet Cupcakes", "Love Letter Cookies"],
      icon: <Favorite color="error" />
    });
  } else if (month === 11 && day >= 20 && day <= 30) {
    suggestions.push({
      message: "Holiday Season Favorites!",
      products: ["Yule Log Cake", "Gingerbread House", "Fruit Cake", "Peppermint Brownies"],
      icon: <Star color="warning" />
    });
  }

  return suggestions;
};

// Add this useEffect to set suggestions
useEffect(() => {
  setProductSuggestions(getBakerySuggestions());
}, []);

// Add this function to fetch rewards
const fetchAvailableRewards = async () => {
  try {
    const q = query(
      collection(db, 'loyaltyRewards'), 
      where('active', '==', true),
      orderBy('pointsRequired', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const rewards = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAvailableRewards(rewards);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    showSnackbar('Error loading rewards', 'error');
  }
};



// Add this function to redeem points
const handleRedeemPoints = async (rewardId) => {
  if (!selectedCustomer || !rewardId) return;

  const reward = availableRewards.find(r => r.id === rewardId);
  if (!reward) {
    showSnackbar('Reward not found', 'warning');
    return;
  }

  // Get fresh customer data to ensure we have current points
  const customerDoc = await getDoc(doc(db, 'loyaltyCustomers', selectedCustomer.id));
  if (!customerDoc.exists()) {
    showSnackbar('Customer not found', 'error');
    return;
  }

  const currentCustomer = customerDoc.data();
  if (currentCustomer.points < reward.pointsRequired) { // Changed from loyaltyPoints to points
    showSnackbar(`Customer needs ${reward.pointsRequired - currentCustomer.points} more points for this reward`, 'warning');
    return;
  }

  try {
    // Create redemption record
    await addDoc(collection(db, 'loyaltyRedemptions'), {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name || selectedCustomer.email,
      rewardId: reward.id,
      rewardName: reward.name,
      pointsUsed: reward.pointsRequired,
      redeemedBy: user.uid,
      redeemedByName: user.displayName || user.email,
      timestamp: serverTimestamp()
    });

    // Update customer points
    await updateDoc(doc(db, 'loyaltyCustomers', selectedCustomer.id), {
      points: increment(-reward.pointsRequired) // Changed from loyaltyPoints to points
    });

    showSnackbar(`Reward redeemed successfully! ${reward.name}`, 'success');
    
    // Refresh customer data
    const updatedDoc = await getDoc(doc(db, 'loyaltyCustomers', selectedCustomer.id));
    if (updatedDoc.exists()) {
      setSelectedCustomer({
        id: updatedDoc.id,
        ...updatedDoc.data(),
        points: updatedDoc.data().points || 0 // Ensure points field is set
      });
    }
    
    // Close the dialog
    setShowLoyaltyDialog(false);
  } catch (error) {
    console.error('Error redeeming points:', error);
    showSnackbar('Failed to redeem reward', 'error');
  }
};

const handleRequestShiftSwap = async () => {
  if (!selectedShiftForSwap || !swapReason) {
    showSnackbar('Please select a shift and provide a reason', 'warning');
    return;
  }

  try {
    // Create the shift swap request
    await addDoc(collection(db, 'shiftSwapRequests'), {
      originalShiftId: selectedShiftForSwap.id,
      requestedBy: user.uid,
      requestedByName: user.displayName || user.email,
      reason: swapReason,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    // Create notification
    await createShiftSwapRequestNotification(selectedShiftForSwap.id, swapReason, user.uid);
    
    setShowShiftSwapDialog(false);
    setSelectedShiftForSwap(null);
    setSwapReason('');
    showSnackbar('Shift swap request submitted successfully!', 'success');
  } catch (error) {
    console.error('Error requesting shift swap:', error);
    showSnackbar('Failed to submit shift swap request', 'error');
  }
};

  const handleSaveShiftNotes = async () => {
    if (!user) return;
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const noteRef = doc(db, 'shiftNotes', `${user.uid}_${today}`);
      
      await setDoc(noteRef, {
        userId: user.uid,
        userEmail: user.email,
        userName: userData?.firstName || user.email.split('@')[0], // Add this
        date: today,
        notes: shiftNotes,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      setCurrentShiftNote({
        userId: user.uid,
        userEmail: user.email,
        date: today,
        notes: shiftNotes
      });
      
      setShowNotesDialog(false);
      showSnackbar('Shift notes saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving shift notes:', error);
      showSnackbar('Failed to save shift notes', 'error');
    }
  };

  const handleReportLowIngredient = async () => {
  if (!ingredient) {
    showSnackbar('Please select an ingredient', 'warning');
    return;
  }
  
  try {
    // Create the low ingredient report
    const reportRef = await addDoc(collection(db, 'lowIngredientReports'), {
      ingredient,
      level: ingredientLevel,
      reportedBy: user.uid,
      reportedByName: user.displayName || user.email,
      timestamp: serverTimestamp(),
      status: 'pending',
      resolved: false
    });
    
    // Create notification
    await createLowIngredientNotification(ingredient, ingredientLevel, user.uid);
    
    setShowLowIngredientDialog(false);
    setIngredient('');
    setIngredientLevel('low');
    showSnackbar('Low ingredient reported successfully!', 'success');
  } catch (error) {
    console.error('Error reporting low ingredient:', error);
    showSnackbar('Failed to report low ingredient', 'error');
  }
};

  const handleSubmitSupplyRequest = async () => {
  if (!supplyRequest) {
    showSnackbar('Please enter your supply request', 'warning');
    return;
  }
  
  try {
    // Create the supply request
    await addDoc(collection(db, 'supplyRequests'), {
      request: supplyRequest,
      requestedBy: user.uid,
      requestedByName: user.displayName || user.email,
      timestamp: serverTimestamp(),
      status: 'pending',
      fulfilled: false
    });
    
    // Create notification
    await createSupplyRequestNotification(supplyRequest, user.uid);
    
    setShowSupplyRequestDialog(false);
    setSupplyRequest('');
    showSnackbar('Supply request submitted successfully!', 'success');
  } catch (error) {
    console.error('Error submitting supply request:', error);
    showSnackbar('Failed to submit supply request', 'error');
  }
};

  const getActivityColor = (activityType) => {
  switch(activityType) {
    case 'order_completed':
      return 'success.main';
    case 'order_created':
      return 'primary.main';
    case 'shift_clock_in':
      return 'info.main';
    case 'shift_clock_out':
      return 'warning.main';
    case 'error':
      return 'error.main';
    default:
      return 'grey.500';
  }
};

const getActivityIcon = (activityType) => {
  switch(activityType) {
    case 'order_completed':
      return <Check />;
    case 'order_created':
      return <AddShoppingCart />;
    case 'shift_clock_in':
      return <Login />;
    case 'shift_clock_out':
      return <Logout />;
    case 'error':
      return <Report />;
    default:
      return <List />;
  }
};

  const handleClockIn = async () => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    
    // First check if there's a scheduled shift for today
    const shiftsRef = collection(db, 'shifts');
    const q = query(
      shiftsRef,
      where('userId', '==', user.uid),
      where('date', '==', today),
      where('status', 'in', ['scheduled', 'in-progress']),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const shiftDoc = querySnapshot.docs[0];
      const shiftData = shiftDoc.data();
      
      // Check if current time is before scheduled start (early clock-in)
      if (shiftData.scheduledStart && currentTime < shiftData.scheduledStart) {
        showSnackbar(`You're clocking in early (scheduled at ${shiftData.scheduledStart})`, 'info');
      }
      
      // Update existing scheduled shift with clock-in data
      await updateDoc(doc(db, 'shifts', shiftDoc.id), {
        clockIn: now,
        clockInTimestamp: serverTimestamp(),
        status: 'in-progress',
        actualStart: currentTime // Store actual clock-in time
      });
      
      setCurrentShift({ 
        id: shiftDoc.id, 
        ...shiftData,
        clockIn: now,
        status: 'in-progress'
      });
    } else {
      // Create new shift record if no scheduled shift exists
      const shiftData = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email.split('@')[0],
        date: today,
        clockIn: now,
        role: userData?.role || 'staff',
        clockInTimestamp: serverTimestamp(),
        status: 'in-progress',
        actualStart: currentTime
      };
      
      const docRef = await addDoc(collection(db, 'shifts'), shiftData);
      setCurrentShift({ 
        id: docRef.id, 
        ...shiftData,
        clockIn: now
      });
    }
    
    showSnackbar('Clocked in successfully!', 'success');
  } catch (error) {
    console.error('Error clocking in:', error);
    showSnackbar('Failed to clock in', 'error');
  }
};


  const handleClockOut = async () => {
  if (!currentShift) {
    showSnackbar('No active shift found', 'error');
    return;
  }
  
  try {
    const shiftRef = doc(db, 'shifts', currentShift.id);
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    
    // Validate clock-in exists
    if (!currentShift.clockIn) {
      showSnackbar('Cannot clock out - no clock-in recorded', 'error');
      return;
    }
    
    // Calculate duration in minutes
    const clockInDate = currentShift.clockIn instanceof Date ? 
      currentShift.clockIn : 
      new Date(currentShift.clockIn);
    const duration = Math.floor((now - clockInDate) / 60000);
    
    await updateDoc(shiftRef, {
      clockOut: now,
      clockOutTimestamp: serverTimestamp(),
      duration: duration,
      status: 'completed',
      actualEnd: currentTime
    });
    
    setCurrentShift(null);
    showSnackbar('Clocked out successfully!', 'success');
  } catch (error) {
    console.error('Error clocking out:', error);
    showSnackbar('Failed to clock out', 'error');
  }
};

const validateShiftStatus = (shift) => {
  if (!shift) return false;
  
  // Check if shift is already completed
  if (shift.status === 'completed') {
    showSnackbar('This shift is already completed', 'warning');
    return false;
  }
  
  // Check if clock-out exists without clock-in
  if (shift.clockOut && !shift.clockIn) {
    showSnackbar('Invalid shift data - clock out exists without clock in', 'error');
    return false;
  }
  
  return true;
};

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  const renderStaffDashboard = () => (
  <Grid container spacing={3} sx={{ backgroundColor: '#f5f0e6', p: 3 }}>
    {/* Quick Actions Card - Now with Coffee Theme */}
    <Grid item xs={12} md={4}>
      <Card sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(to bottom, #ffffff 0%, #fff9f0 100%)',
        border: '1px solid #e0d6c2',
        borderRadius: '16px',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 6px 24px 0 rgba(0,0,0,0.12)'
        }
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ 
              bgcolor: 'transparent',
              color: '#6f4e37',
              border: '2px solid #6f4e37'
            }}>
              <Cake />
            </Avatar>
          }
          title="Quick Actions"
          titleTypographyProps={{ 
            variant: 'h6', 
            fontWeight: 'bold',
            color: '#6f4e37',
            fontFamily: '"Playfair Display", serif'
          }}
          sx={{
            borderBottom: '1px solid #e0d6c2',
            background: 'linear-gradient(to right, #ffffff 0%, #f8f3e9 100%)'
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => window.location.href = '/orders'}
                sx={{ 
                  mb: 1,
                  py: 1.5,
                  fontWeight: 'bold',
                  backgroundColor: '#6f4e37',
                  color: '#fff',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  boxShadow: '0 2px 8px rgba(111, 78, 55, 0.2)',
                  '&:hover': { 
                    backgroundColor: '#5a3d2a',
                    boxShadow: '0 4px 12px rgba(111, 78, 55, 0.3)'
                  }
                }}
              >
                <AddCircle sx={{ mr: 1 }} /> New Order
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => window.location.href = '/orders'}
                sx={{ 
                  mb: 1,
                  py: 1.5,
                  fontWeight: 'bold',
                  border: '2px solid #6f4e37',
                  color: '#6f4e37',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { 
                    backgroundColor: 'rgba(111, 78, 55, 0.08)',
                    border: '2px solid #5a3d2a'
                  }
                }}
              >
                <ListAlt sx={{ mr: 1 }} /> View Orders
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<Note sx={{ color: '#6f4e37' }} />}
                onClick={() => setShowNotesDialog(true)}
                sx={{ 
                  mb: 1,
                  py: 1.5,
                  fontWeight: 'bold',
                  border: '2px solid #d4a762',
                  color: '#d4a762',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { 
                    backgroundColor: 'rgba(212, 167, 98, 0.08)',
                    border: '2px solid #c09552'
                  }
                }}
              >
                {currentShiftNote ? 'Edit Shift Notes' : 'Add Shift Notes'}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<Report sx={{ color: '#e74c3c' }} />}
                onClick={() => setShowLowIngredientDialog(true)}
                sx={{ 
                  mb: 1,
                  py: 1.5,
                  fontWeight: 'bold',
                  border: '2px solid #e74c3c',
                  color: '#e74c3c',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { 
                    backgroundColor: 'rgba(231, 76, 60, 0.08)',
                    border: '2px solid #c0392b'
                  }
                }}
              >
                Report Low Ingredient
              </Button>
            </Grid>
            <Grid item xs={12}>
  <Button 
    variant="outlined" 
    fullWidth 
    startIcon={<RateReview sx={{ color: '#6f4e37' }} />}
    onClick={() => setShowFeedbackForm(true)}
    sx={{ 
      mb: 1,
      py: 1.5,
      fontWeight: 'bold',
      border: '2px solid #6f4e37',
      color: '#6f4e37',
      borderRadius: '12px',
      textTransform: 'none',
      fontSize: '0.9rem',
      '&:hover': { 
        backgroundColor: 'rgba(111, 78, 55, 0.08)',
        border: '2px solid #5a3d2a'
      }
    }}
  >
    Collect Customer Feedback
  </Button>
</Grid>

<Grid item xs={12}>
  <Card sx={{ 
    background: 'linear-gradient(to bottom, #ffffff 0%, #fff9f0 100%)',
    border: '1px solid #e0d6c2',
    borderRadius: '16px',
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
    '&:hover': {
      boxShadow: '0 6px 24px 0 rgba(0,0,0,0.12)'
    }
  }}>
    <CardHeader
      avatar={
        <Avatar sx={{ 
          bgcolor: 'transparent',
          color: '#6f4e37',
          border: '2px solid #6f4e37'
        }}>
          <Assessment />
        </Avatar>
      }
      title="Generate Sales Report"
      titleTypographyProps={{ 
        variant: 'h6', 
        fontWeight: 'bold',
        color: '#6f4e37',
        fontFamily: '"Playfair Display", serif'
      }}
      sx={{
        borderBottom: '1px solid #e0d6c2',
        background: 'linear-gradient(to right, #ffffff 0%, #f8f3e9 100%)'
      }}
    />
    <CardContent>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Start Date"
            type="date"
            value={salesReportDateRange.start}
            onChange={(e) => setSalesReportDateRange({...salesReportDateRange, start: e.target.value})}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: '#e0d6c2',
                },
                '&:hover fieldset': {
                  borderColor: '#d4a762',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6f4e37',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="End Date"
            type="date"
            value={salesReportDateRange.end}
            onChange={(e) => setSalesReportDateRange({...salesReportDateRange, end: e.target.value})}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: '#e0d6c2',
                },
                '&:hover fieldset': {
                  borderColor: '#d4a762',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6f4e37',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            fullWidth
            onClick={generatePDFReport}
            startIcon={<PictureAsPdf />}
            sx={{
              py: 1.5,
              fontWeight: 'bold',
              backgroundColor: '#e74c3c',
              color: '#fff',
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '0.9rem',
              boxShadow: '0 2px 8px rgba(231, 76, 60, 0.2)',
              '&:hover': { 
                backgroundColor: '#c0392b',
                boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)'
              }
            }}
          >
            Download PDF
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            fullWidth
            onClick={generateExcelReport}
            startIcon={<GridOn />}
            sx={{
              py: 1.5,
              fontWeight: 'bold',
              backgroundColor: '#2ecc71',
              color: '#fff',
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '0.9rem',
              boxShadow: '0 2px 8px rgba(46, 204, 113, 0.2)',
              '&:hover': { 
                backgroundColor: '#27ae60',
                boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
              }
            }}
          >
            Download Excel
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
</Grid>
            <Grid item xs={12}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<ShoppingCart sx={{ color: '#3498db' }} />}
                onClick={() => setShowSupplyRequestDialog(true)}
                sx={{ 
                  mb: 1,
                  py: 1.5,
                  fontWeight: 'bold',
                  border: '2px solid #3498db',
                  color: '#3498db',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { 
                    backgroundColor: 'rgba(52, 152, 219, 0.08)',
                    border: '2px solid #2980b9'
                  }
                }}
              >
                Request Supplies
              </Button>
            </Grid>
            <Grid item xs={12}>
              {currentShift?.status === 'in-progress' ? (
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<Logout />}
                  onClick={handleClockOut}
                  sx={{ 
                    mb: 1,
                    py: 1.5,
                    fontWeight: 'bold',
                    backgroundColor: '#e74c3c',
                    color: '#fff',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(231, 76, 60, 0.2)',
                    '&:hover': { 
                      backgroundColor: '#c0392b',
                      boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)'
                    }
                  }}
                >
                  Clock Out
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<Login />}
                  onClick={handleClockIn}
                  sx={{ 
                    mb: 1,
                    py: 1.5,
                    fontWeight: 'bold',
                    backgroundColor: '#2ecc71',
                    color: '#fff',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(46, 204, 113, 0.2)',
                    '&:hover': { 
                      backgroundColor: '#27ae60',
                      boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
                    }
                  }}
                  disabled={!!currentShift?.clockOut} 
                >
                  {currentShift ? 'Continue Shift' : 'Clock In'}
                </Button>
              )}
              {currentShift && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mt: 1,
                  p: 1.5,
                  backgroundColor: 'rgba(111, 78, 55, 0.05)',
                  borderRadius: '12px',
                  border: '1px dashed #d4a762'
                }}>
                  <AccessTime sx={{ color: '#6f4e37', mr: 1 }} />
                  <Typography variant="caption" color="#6f4e37" sx={{ fontWeight: 'medium' }}>
                    {currentShift.clockIn ? 
                      `Clocked in at: ${format(new Date(currentShift.clockIn), 'h:mm a')}` : 
                      'Not clocked in yet'}
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={fetchCurrentShift}
                    sx={{ 
                      ml: 'auto',
                      color: '#6f4e37',
                      textTransform: 'none',
                      fontSize: '0.75rem'
                    }}
                  >
                    Refresh Status
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>

          {/* Current Shift Notes Preview */}
          {currentShiftNote && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              border: '1px dashed #d4a762', 
              borderRadius: '12px',
              backgroundColor: 'rgba(255,243,224,0.7)'
            }}>
              <Box display="flex" alignItems="center" mb={1}>
                <Note sx={{ color: '#d4a762', mr: 1 }} />
                <Typography variant="subtitle2" fontWeight="bold" color="#6f4e37">
                  Your Shift Notes:
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#5a3d2a' }}>
                {currentShiftNote.notes}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>

    {/* Shift Schedule Card - Coffee Themed */}
    <Grid item xs={12} md={4}>
      <Card sx={{ 
        height: '100%',
        background: 'linear-gradient(to bottom, #ffffff 0%, #fff9f0 100%)',
        border: '1px solid #e0d6c2',
        borderRadius: '16px',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 6px 24px 0 rgba(0,0,0,0.12)'
        }
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ 
              bgcolor: 'transparent',
              color: '#6f4e37',
              border: '2px solid #6f4e37'
            }}>
              <Schedule />
            </Avatar>
          }
          title="Your Shift Schedule"
          titleTypographyProps={{ 
            variant: 'h6', 
            fontWeight: 'bold',
            color: '#6f4e37',
            fontFamily: '"Playfair Display", serif'
          }}
          subheaderTypographyProps={{ color: '#9c8c72' }}
          action={
  <Tooltip title="Refresh">
    <IconButton 
      onClick={fetchUpcomingShifts} 
      size="small"
      disabled={isRefreshingShifts}
      sx={{
        color: '#6f4e37',
        '&:hover': {
          backgroundColor: 'rgba(111, 78, 55, 0.1)'
        }
      }}
    >
      {isRefreshingShifts ? <CircularProgress size={20} /> : <Refresh />}
    </IconButton>
  </Tooltip>
}
          sx={{
            borderBottom: '1px solid #e0d6c2',
            background: 'linear-gradient(to right, #ffffff 0%, #f8f3e9 100%)'
          }}
        />
        <CardContent>
          <List sx={{ 
            maxHeight: 300, 
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#d4a762',
              borderRadius: '10px',
            },
          }}>
            {upcomingShifts.length > 0 ? (
  upcomingShifts.slice(0, 3).map((shift) => (
    <ListItem 
      key={shift.id} 
      sx={{
        mb: 1,
        borderRadius: '12px',
        backgroundColor: shift.id === selectedShiftForSwap?.id ? 
          'rgba(111, 78, 55, 0.08)' : 'transparent',
        '&:hover': {
          backgroundColor: 'rgba(111, 78, 55, 0.05)'
        }
      }}
      secondaryAction={
        <Tooltip title="Request swap">
          <IconButton 
            edge="end" 
            onClick={() => {
              setSelectedShiftForSwap(shift);
              setShowShiftSwapDialog(true);
            }}
            sx={{
              color: '#6f4e37',
              '&:hover': {
                backgroundColor: 'rgba(111, 78, 55, 0.1)'
              }
            }}
          >
            <SwapHoriz />
          </IconButton>
        </Tooltip>
      }
    >
      <ListItemAvatar>
        <Avatar sx={{ 
          bgcolor: shift.date && isToday(new Date(shift.date)) ? 
            '#d4a762' : 'rgba(111, 78, 55, 0.2)',
          color: shift.date && isToday(new Date(shift.date)) ? 
            '#fff' : '#6f4e37'
        }}>
          <Today />
        </Avatar>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Typography fontWeight="medium" color="#6f4e37">
            {shift.date ? format(new Date(shift.date), 'EEEE, MMMM d') : 'Date not set'}
          </Typography>
        }
        secondary={
          <Typography color="#9c8c72">
            {shift.scheduledStart ? 
              `${shift.scheduledStart} - ${shift.scheduledEnd}` :
              'Shift times not set'}
          </Typography>
        }
      />
    </ListItem>
  ))
) : (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    p: 3
  }}>
    <Schedule sx={{ fontSize: 48, color: '#d4a762', mb: 1 }} />
    <Typography variant="body2" color="#9c8c72" align="center">
      No upcoming shifts scheduled
    </Typography>
  </Box>
)}
          </List>
        </CardContent>
        <CardActions sx={{ 
          borderTop: '1px solid #e0d6c2',
          background: 'rgba(255,255,255,0.5)'
        }}>
          <Button 
            size="small" 
            onClick={() => window.location.href = '/shifts'}
            startIcon={<CalendarMonth sx={{ color: '#6f4e37' }} />}
            sx={{ 
              color: '#6f4e37',
              textTransform: 'none',
              fontWeight: 'medium',
              '&:hover': {
                backgroundColor: 'rgba(111, 78, 55, 0.1)'
              }
            }}
          >
            View Full Schedule
          </Button>
        </CardActions>
      </Card>
    </Grid>

    {/* Loyalty Points Card - Coffee Themed */}
    <Grid item xs={12} md={4}>
      <Card sx={{ 
        height: '100%',
        background: 'linear-gradient(to bottom, #ffffff 0%, #fff9f0 100%)',
        border: '1px solid #e0d6c2',
        borderRadius: '16px',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 6px 24px 0 rgba(0,0,0,0.12)'
        }
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ 
              bgcolor: 'transparent',
              color: '#6f4e37',
              border: '2px solid #6f4e37'
            }}>
              <Loyalty />
            </Avatar>
          }
          action={
    <Tooltip title="View all loyalty customers">
      <IconButton 
        onClick={() => {
          setShowAllCustomersDialog(true);
          fetchAllLoyaltyCustomers();
        }}
        sx={{ color: '#6f4e37' }}
      >
        <People />
      </IconButton>
    </Tooltip>
  }
  title="Loyalty Points Tracker"
  titleTypographyProps={{ 
    variant: 'h6', 
    fontWeight: 'bold',
    color: '#6f4e37',
    fontFamily: '"Playfair Display", serif'
  }}
  sx={{
    borderBottom: '1px solid #e0d6c2',
    background: 'linear-gradient(to right, #ffffff 0%, #f8f3e9 100%)'
  }}
/>
        <CardContent>
          <Autocomplete
            freeSolo
            options={customerResults}
            getOptionLabel={(option) => 
              typeof option === 'string' ? option : 
              `${option.name || option.email} (Card: ${option.cardNumber || 'N/A'}, ${option.points || 0} pts)`
            }
            inputValue={customerSearch}
            onInputChange={(event, newValue) => {
              setCustomerSearch(newValue);
              if (newValue === '') {
                setCustomerResults([]);
                setSelectedCustomer(null);
              }
            }}
            onChange={(event, newValue) => {
              if (newValue === null || typeof newValue === 'string') {
                setSelectedCustomer(null);
                return;
              }
              if (typeof newValue === 'object') {
                setSelectedCustomer({
                  ...newValue,
                  points: newValue.points || 0
                });
                setShowLoyaltyDialog(true);
                fetchAvailableRewards();
              }
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Search customer by name, email, or card number" 
                variant="outlined" 
                size="small"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#9c8c72' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#e0d6c2',
                    },
                    '&:hover fieldset': {
                      borderColor: '#d4a762',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6f4e37',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#9c8c72',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#6f4e37',
                  },
                }}
              />
            )}
            noOptionsText={customerSearch.length > 0 ? "No customers found" : "Start typing to search"}
            sx={{
              '& .MuiAutocomplete-popper': {
                borderRadius: '12px',
              }
            }}
          />
          {selectedCustomer && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              backgroundColor: 'rgba(255,243,224,0.7)', 
              borderRadius: '12px',
              border: '1px dashed #d4a762'
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight="bold" color="#6f4e37">
                  {selectedCustomer.name || selectedCustomer.email}
                </Typography>
                <Chip 
                  label={`${selectedCustomer.points || 0} pts`} 
                  sx={{ 
                    backgroundColor: '#d4a762',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.75rem'
                  }}
                  size="small"
                />
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<CardGiftcard sx={{ color: '#6f4e37' }} />}
                onClick={() => {
                  setShowLoyaltyDialog(true);
                  fetchAvailableRewards();
                }}
                sx={{ 
                  mt: 1,
                  border: '2px solid #6f4e37',
                  color: '#6f4e37',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'rgba(111, 78, 55, 0.08)',
                    border: '2px solid #5a3d2a'
                  }
                }}
                fullWidth
              >
                Redeem Rewards
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>

    <Dialog 
  open={showAllCustomersDialog} 
  onClose={() => setShowAllCustomersDialog(false)}
  maxWidth="lg"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: '16px',
      background: 'linear-gradient(to bottom, #ffffff 0%, #fff9f0 100%)',
      border: '1px solid #e0d6c2'
    }
  }}
>
  <DialogTitle sx={{ 
    backgroundColor: '#f8f3e9',
    borderBottom: '1px solid #e0d6c2',
    color: '#6f4e37',
    fontFamily: '"Playfair Display", serif',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <Box display="flex" alignItems="center">
      <span>All Loyalty Customers</span>
      <Tooltip title="Refresh">
        <IconButton 
          onClick={fetchAllLoyaltyCustomers} 
          sx={{ ml: 1, color: '#6f4e37' }}
          disabled={isLoadingCustomers}
        >
          <Refresh />
        </IconButton>
      </Tooltip>
    </Box>
    <IconButton onClick={() => setShowAllCustomersDialog(false)}>
      <Close sx={{ color: '#6f4e37' }} />
    </IconButton>
  </DialogTitle>
  <DialogContent sx={{ backgroundColor: '#fff9f0', p: 0 }}>
    {isLoadingCustomers ? (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress sx={{ color: '#6f4e37' }} />
      </Box>
    ) : (
      <TableContainer sx={{ maxHeight: '60vh' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f3e9' }}>
              <TableCell sx={{ color: '#6f4e37', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: '#6f4e37', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: '#6f4e37', fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell sx={{ color: '#6f4e37', fontWeight: 'bold' }}>Card Number</TableCell>
              <TableCell sx={{ color: '#6f4e37', fontWeight: 'bold' }}>Points</TableCell>
              <TableCell sx={{ color: '#6f4e37', fontWeight: 'bold' }}>Joined Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allCustomers.length > 0 ? (
              allCustomers.map((customer) => (
                <TableRow 
                  key={customer.id}
                  hover
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
                    '&:nth-of-type(even)': { backgroundColor: 'rgba(248, 243, 233, 0.5)' },
                    '&:hover': { backgroundColor: 'rgba(212, 167, 98, 0.1)' },
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowAllCustomersDialog(false);
                    setShowLoyaltyDialog(true);
                    fetchAvailableRewards();
                  }}
                >
                  <TableCell>{customer.name || '-'}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>{customer.cardNumber || '-'}</TableCell>
                  <TableCell>{customer.points || 0}</TableCell>
                  <TableCell>
                    {customer.joinedAt?.toDate ? 
                      customer.joinedAt.toDate().toLocaleString() : 
                      '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    No loyalty customers found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </DialogContent>
  <DialogActions sx={{ 
    backgroundColor: '#f8f3e9', 
    borderTop: '1px solid #e0d6c2',
    padding: '8px 16px'
  }}>
    <Typography variant="caption" sx={{ color: '#9c8c72', mr: 1 }}>
      {allCustomers.length} customer(s) registered
    </Typography>
    <Button 
      onClick={() => setShowAllCustomersDialog(false)}
      sx={{ 
        color: '#6f4e37',
        fontWeight: 'bold',
        '&:hover': {
          backgroundColor: 'rgba(111, 78, 55, 0.08)'
        }
      }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>

    {/* Active Orders Card - Coffee Themed */}
    <Grid item xs={12} md={6}>
      <Card sx={{ 
        background: 'linear-gradient(to bottom, #ffffff 0%, #fff9f0 100%)',
        border: '1px solid #e0d6c2',
        borderRadius: '16px',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 6px 24px 0 rgba(0,0,0,0.12)'
        }
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ 
              bgcolor: 'transparent',
              color: '#6f4e37',
              border: '2px solid #6f4e37'
            }}>
              <Receipt />
            </Avatar>
          }
          title="Active Orders"
          titleTypographyProps={{ 
            variant: 'h6', 
            fontWeight: 'bold',
            color: '#6f4e37',
            fontFamily: '"Playfair Display", serif'
          }}
          subheader={`${orders.length} pending`}
          subheaderTypographyProps={{ color: '#9c8c72' }}
          action={
            <Chip 
              label={`${queueStatus.waiting} in queue`} 
              sx={{ 
                mr: 1,
                backgroundColor: queueStatus.waiting > 3 ? '#e74c3c' : '#6f4e37',
                color: '#fff',
                fontWeight: 'bold'
              }}
              size="small"
            />
          }
          sx={{
            borderBottom: '1px solid #e0d6c2',
            background: 'linear-gradient(to right, #ffffff 0%, #f8f3e9 100%)'
          }}
        />
        <CardContent>
          <List sx={{ 
            maxHeight: 300, 
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#d4a762',
              borderRadius: '10px',
            },
          }}>
            {orders.slice(0, 5).map((order) => (
              <ListItem 
                key={order.id} 
                dense
                sx={{
                  mb: 1,
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: 'rgba(111, 78, 55, 0.05)'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: order.priority === 'high' ? '#e74c3c' : 
                             order.priority === 'medium' ? '#d4a762' : '#6f4e37',
                    width: 32,
                    height: 32,
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>
                    {order.id.slice(0, 3)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <Typography fontWeight="medium" color="#6f4e37">
  Order #{order.orderNumber} - K{order.total?.toFixed(2)}
</Typography>
                  } 
                  secondary={
                    <Box component="span" sx={{ color: '#9c8c72' }}>
                      {order.customerName} • 
                      {order.createdAt?.toDate ? 
                        format(order.createdAt.toDate(), 'h:mm a') : 
                        'N/A'}
                      {order.priority === 'high' && (
                        <Chip 
                          label="Priority" 
                          size="small" 
                          sx={{ 
                            ml: 1, 
                            height: 18,
                            backgroundColor: '#e74c3c',
                            color: '#fff',
                            fontSize: '0.65rem',
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Process order">
                    <IconButton 
                      edge="end" 
                      onClick={() => setSelectedOrder(order)}
                      sx={{
                        color: '#6f4e37',
                        '&:hover': {
                          backgroundColor: 'rgba(111, 78, 55, 0.1)'
                        }
                      }}
                    >
                      <ArrowForward />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {orders.length === 0 && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                p: 3
              }}>
                <Receipt sx={{ fontSize: 48, color: '#d4a762', mb: 1 }} />
                <Typography variant="body2" color="#9c8c72" align="center">
                  No active orders
                </Typography>
              </Box>
            )}
          </List>
          <Button 
            fullWidth 
            variant="text" 
            size="small" 
            sx={{ 
              mt: 1,
              color: '#6f4e37',
              textTransform: 'none',
              fontWeight: 'medium',
              '&:hover': {
                backgroundColor: 'rgba(111, 78, 55, 0.1)'
              }
            }}
            onClick={() => window.location.href = '/orders'}
            endIcon={<ChevronRight sx={{ color: '#6f4e37' }} />}
          >
            View All Orders
          </Button>
        </CardContent>
      </Card>
    </Grid>
  

    {/* Staff Performance Card - Coffee Themed */}
    <Grid item xs={12} md={6}>
      <Card sx={{ 
        background: 'linear-gradient(to bottom, #ffffff 0%, #fff9f0 100%)',
        border: '1px solid #e0d6c2',
        borderRadius: '16px',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 6px 24px 0 rgba(0,0,0,0.12)'
        }
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ 
              bgcolor: 'transparent',
              color: '#6f4e37',
              border: '2px solid #6f4e37'
            }}>
              <Star />
            </Avatar>
          }
          title="Your Performance"
          titleTypographyProps={{ 
            variant: 'h6', 
            fontWeight: 'bold',
            color: '#6f4e37',
            fontFamily: '"Playfair Display", serif'
          }}
          action={
            <Tooltip title="This week">
              <Chip 
                label="Today" 
                size="small" 
                sx={{ 
                  mr: 1,
                  backgroundColor: '#d4a762',
                  color: '#fff',
                  fontWeight: 'bold'
                }} 
              />
            </Tooltip>
          }
          sx={{
            borderBottom: '1px solid #e0d6c2',
            background: 'linear-gradient(to right, #ffffff 0%, #f8f3e9 100%)'
          }}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ 
                p: 2, 
                textAlign: 'center',
                backgroundColor: 'rgba(111, 78, 55, 0.05)',
                borderRadius: '12px',
                border: '1px dashed #d4a762'
              }}>
                <Typography variant="h4" color="#6f4e37" fontWeight="bold">
                  {performance.todayOrders}
                </Typography>
                <Typography variant="body2" color="#9c8c72">
                  Orders Processed
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ 
                p: 2, 
                textAlign: 'center',
                backgroundColor: 'rgba(111, 78, 55, 0.05)',
                borderRadius: '12px',
                border: '1px dashed #d4a762'
              }}>
                <Typography variant="h4" color="#6f4e37" fontWeight="bold">
                  K{performance.todaySales.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="#9c8c72">
                  Sales Generated
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight="bold" color="#6f4e37">
                    Efficiency:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="#6f4e37">
                    {performance.efficiency}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={performance.efficiency} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: 'rgba(111, 78, 55, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: performance.efficiency >= 85 ? '#d4a762' : '#6f4e37',
                      borderRadius: 5
                    }
                  }}
                />
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="caption" color="#9c8c72">
                    Goal: 85%
                  </Typography>
                  <Typography variant="caption" color={performance.efficiency >= 85 ? '#d4a762' : '#6f4e37'} sx={{ fontWeight: 'bold' }}>
                    {performance.efficiency >= 85 ? 'On target' : 'Needs improvement'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>

    {/* Queue Status Card - Coffee Themed */}
    <Grid item xs={12} md={6}>
      <Card sx={{ 
        background: 'linear-gradient(to bottom, #ffffff 0%, #fff9f0 100%)',
        border: '1px solid #e0d6c2',
        borderRadius: '16px',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 6px 24px 0 rgba(0,0,0,0.12)'
        }
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ 
              bgcolor: queueStatus.waiting > 0 ? '#d4a762' : '#6f4e37',
              color: '#fff',
              fontWeight: 'bold'
            }}>
              {queueStatus.waiting}
            </Avatar>
          }
          title="Queue Status"
          titleTypographyProps={{ 
            variant: 'h6', 
            fontWeight: 'bold',
            color: '#6f4e37',
            fontFamily: '"Playfair Display", serif'
          }}
          subheader={`Updated ${format(new Date(), 'h:mm a')}`}
          subheaderTypographyProps={{ color: '#9c8c72' }}
          action={
            <Tooltip title="Refresh queue">
              <IconButton 
                onClick={() => setShowQueueDialog(true)}
                sx={{
                  color: '#6f4e37',
                  '&:hover': {
                    backgroundColor: 'rgba(111, 78, 55, 0.1)'
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          }
          sx={{
            borderBottom: '1px solid #e0d6c2',
            background: 'linear-gradient(to right, #ffffff 0%, #f8f3e9 100%)'
          }}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ 
                p: 2, 
                backgroundColor: 'rgba(212, 167, 98, 0.1)',
                borderRadius: '12px',
                border: '1px dashed #d4a762'
              }}>
                <Typography variant="h5" color="#6f4e37" fontWeight="bold">
                  {queueStatus.waiting}
                </Typography>
                <Typography variant="body2" color="#9c8c72">
                  Waiting Orders
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ 
                p: 2, 
                backgroundColor: 'rgba(212, 167, 98, 0.1)',
                borderRadius: '12px',
                border: '1px dashed #d4a762'
              }}>
                <Typography variant="h5" color="#6f4e37" fontWeight="bold">
                  {queueStatus.avgWaitTime} min
                </Typography>
                <Typography variant="body2" color="#9c8c72">
                  Avg. Wait Time
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" fontWeight="bold" color="#6f4e37">
                Queue Pressure:
              </Typography>
              <Typography variant="body2" fontWeight="bold" color={
                queueStatus.waiting > 5 ? '#e74c3c' : 
                queueStatus.waiting > 2 ? '#d4a762' : '#6f4e37'
              }>
                {queueStatus.waiting > 5 ? 'High' : 
                 queueStatus.waiting > 2 ? 'Medium' : 'Low'}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(100, queueStatus.waiting * 10)} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: 'rgba(111, 78, 55, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: queueStatus.waiting > 5 ? '#e74c3c' : 
                                  queueStatus.waiting > 2 ? '#d4a762' : '#6f4e37',
                  borderRadius: 5
                }
              }}
            />
          </Box>
          <Button 
            variant="contained" 
            fullWidth
            sx={{ 
              mt: 2,
              backgroundColor: '#6f4e37',
              color: '#fff',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#5a3d2a',
                boxShadow: '0 4px 12px rgba(111, 78, 55, 0.3)'
              }
            }}
            onClick={() => setShowQueueDialog(true)}
            disabled={queueStatus.waiting === 0}
            startIcon={<ListAlt sx={{ color: '#fff' }} />}
          >
            View Queue Details
          </Button>
        </CardContent>
      </Card>
    </Grid>

    {/* Announcements Card - Coffee Themed */}
    <Grid item xs={12} md={6}>
      <Card sx={{ 
        background: 'linear-gradient(to bottom, #ffffff 0%, #fff9f0 100%)',
        border: '1px solid #e0d6c2',
        borderRadius: '16px',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 6px 24px 0 rgba(0,0,0,0.12)'
        }
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ 
              bgcolor: 'transparent',
              color: '#6f4e37',
              border: '2px solid #6f4e37'
            }}>
              <Announcement />
            </Avatar>
          }
          title={
            <Box display="flex" alignItems="center">
              <Typography variant="h6" fontWeight="bold" color="#6f4e37" fontFamily='"Playfair Display", serif'>
                Announcements & Memos
              </Typography>
              {(announcements.length > 0 || internalMemos.length > 0) && (
                <Chip 
                  label="New" 
                  sx={{ 
                    ml: 1,
                    backgroundColor: '#e74c3c',
                    color: '#fff',
                    fontWeight: 'bold'
                  }} 
                  size="small" 
                />
              )}
            </Box>
          }
          sx={{
            borderBottom: '1px solid #e0d6c2',
            background: 'linear-gradient(to right, #ffffff 0%, #f8f3e9 100%)'
          }}
        />
        <CardContent>
          {announcements.length > 0 || internalMemos.length > 0 ? (
            <List sx={{ 
              maxHeight: 300, 
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#d4a762',
                borderRadius: '10px',
              },
            }}>
              {/* Show internal memos first */}
              {internalMemos.slice(0, 2).map(memo => (
                <ListItem 
                  key={memo.id} 
                  alignItems="flex-start"
                  sx={{
                    mb: 1,
                    backgroundColor: 'rgba(255,243,224,0.7)',
                    borderRadius: '12px',
                    border: '1px dashed #d4a762'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: '#d4a762',
                      color: '#fff',
                      width: 32, 
                      height: 32 
                    }}>
                      <Note fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography fontWeight="bold" color="#6f4e37">
                        Manager Memo: {memo.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="#9c8c72"
                          sx={{ display: 'block', mb: 1 }}
                        >
                          {memo.timestamp instanceof Date && !isNaN(memo.timestamp) ? 
                            format(memo.timestamp, 'MMM dd, yyyy HH:mm') : 
                            'Date not available'} • {memo.postedBy}
                        </Typography>
                        <Typography variant="body2" color="#5a3d2a">
                          {memo.content}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
              
              {/* Then show regular announcements */}
              {announcements.slice(0, 2).map(announcement => (
                <ListItem 
                  key={announcement.id} 
                  alignItems="flex-start"
                  sx={{
                    mb: 1,
                    backgroundColor: 'rgba(224,242,254,0.5)',
                    borderRadius: '12px',
                    border: '1px dashed #6f4e37'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: '#6f4e37',
                      color: '#fff',
                      width: 32, 
                      height: 32 
                    }}>
                      <Announcement fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography fontWeight="bold" color="#6f4e37">
                        {announcement.title || 'No title'}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="#9c8c72"
                          sx={{ display: 'block', mb: 1 }}
                        >
                          {announcement.timestamp?.toDate ? 
                            format(announcement.timestamp.toDate(), 'MMM dd, yyyy HH:mm') : 
                            'Date not available'}
                        </Typography>
                        <Typography variant="body2" color="#5a3d2a">
                          {announcement.message || 'No message content'}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              p: 3
            }}>
              <Announcement sx={{ fontSize: 48, color: '#d4a762', mb: 1 }} />
              <Typography variant="body2" color="#9c8c72" align="center">
                No announcements or memos
              </Typography>
            </Box>
          )}
        </CardContent>
        <CardActions sx={{ 
          justifyContent: 'flex-end',
          borderTop: '1px solid #e0d6c2',
          background: 'rgba(255,255,255,0.5)'
        }}>
          <Button 
            size="small" 
            onClick={() => setShowAllAnnouncementsDialog(true)}
            endIcon={<ChevronRight sx={{ color: '#6f4e37' }} />}
            sx={{ 
              color: '#6f4e37',
              textTransform: 'none',
              fontWeight: 'medium',
              '&:hover': {
                backgroundColor: 'rgba(111, 78, 55, 0.1)'
              }
            }}
          >
            View All
          </Button>
        </CardActions>
      </Card>
    </Grid>

    {/* Product Suggestions Card - Coffee Themed */}
    <Grid item xs={12}>
      <Card sx={{ 
        background: 'linear-gradient(to bottom, #ffffff 0%, #fff9f0 100%)',
        border: '1px solid #e0d6c2',
        borderRadius: '16px',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 6px 24px 0 rgba(0,0,0,0.12)'
        }
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ 
              bgcolor: 'transparent',
              color: '#6f4e37',
              border: '2px solid #6f4e37'
            }}>
              <Lightbulb />
            </Avatar>
          }
          title="Product Suggestions"
          titleTypographyProps={{ 
            variant: 'h6', 
            fontWeight: 'bold',
            color: '#6f4e37',
            fontFamily: '"Playfair Display", serif'
          }}
          subheader="AI-powered recommendations based on time and weather"
          subheaderTypographyProps={{ color: '#9c8c72' }}
          sx={{
            borderBottom: '1px solid #e0d6c2',
            background: 'linear-gradient(to right, #ffffff 0%, #f8f3e9 100%)'
          }}
        />
        <CardContent>
          {productSuggestions.length > 0 ? (
            <Grid container spacing={2}>
              {productSuggestions.map((suggestion, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    height: '100%',
                    borderLeft: `4px solid ${suggestion.icon.props.color || '#d4a762'}`,
                    backgroundColor: 'rgba(111, 78, 55, 0.05)',
                    borderRadius: '12px',
                    border: '1px dashed #e0d6c2',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      backgroundColor: 'rgba(111, 78, 55, 0.08)'
                    }
                  }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      {React.cloneElement(suggestion.icon, { sx: { color: '#d4a762' } })}
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ ml: 1, color: '#6f4e37' }}>
                        {suggestion.message}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="#9c8c72">
                      Suggested items: {suggestion.products.join(", ")}
                    </Typography>
                    <Button 
                      size="small" 
                      sx={{ 
                        mt: 1,
                        color: '#6f4e37',
                        border: '1px solid #6f4e37',
                        textTransform: 'none',
                        fontWeight: 'medium',
                        '&:hover': {
                          backgroundColor: 'rgba(111, 78, 55, 0.1)',
                          border: '1px solid #5a3d2a'
                        }
                      }}
                      onClick={() => window.location.href = '/menu'}
                      startIcon={<AddShoppingCart sx={{ color: '#6f4e37' }} />}
                    >
                      Add to Order
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              p: 3
            }}>
              <Lightbulb sx={{ fontSize: 48, color: '#d4a762', mb: 1 }} />
              <Typography variant="body2" color="#9c8c72" align="center">
                No suggestions available at this time
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
    
    {/* Recent Activity Logs Card - Coffee Themed */}
    <Grid item xs={12}>
      <Card sx={{ 
        background: 'linear-gradient(to bottom, #ffffff 0%, #fff9f0 100%)',
        border: '1px solid #e0d6c2',
        borderRadius: '16px',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 6px 24px 0 rgba(0,0,0,0.12)'
        }
      }}>
        <CardHeader
          avatar={
            <Avatar sx={{ 
              bgcolor: 'transparent',
              color: '#6f4e37',
              border: '2px solid #6f4e37'
            }}>
              <ListAlt />
            </Avatar>
          }
          title="Recent Activity Logs"
          titleTypographyProps={{ 
            variant: 'h6', 
            fontWeight: 'bold',
            color: '#6f4e37',
            fontFamily: '"Playfair Display", serif'
          }}
          action={
            <Tooltip title="Refresh activity logs">
              <IconButton 
                onClick={() => {
                  const q = query(
                    collection(db, 'activityLogs'),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                  );
                  getDocs(q).then(snapshot => {
                    setRecentActivity(snapshot.docs.map(doc => ({ 
                      id: doc.id, 
                      ...doc.data(),
                      timestamp: doc.data().timestamp?.toDate()
                    })));
                    showSnackbar('Activity logs refreshed!', 'success');
                  });
                }}
                sx={{
                  color: '#6f4e37',
                  '&:hover': {
                    backgroundColor: 'rgba(111, 78, 55, 0.1)'
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          }
          sx={{
            borderBottom: '1px solid #e0d6c2',
            background: 'linear-gradient(to right, #ffffff 0%, #f8f3e9 100%)'
          }}
        />
        <CardContent>
          {recentActivity.length > 0 ? (
            <List sx={{ 
              maxHeight: 300, 
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#d4a762',
                borderRadius: '10px',
              },
            }}>
              {recentActivity.map(activity => (
                <ListItem 
                  key={activity.id} 
                  sx={{
                    mb: 1,
                    py: 1,
                    borderLeft: '4px solid',
                    borderColor: getActivityColor(activity.type) || '#6f4e37',
                    backgroundColor: 'rgba(111, 78, 55, 0.03)',
                    borderRadius: '12px'
                  }}
                  dense
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: getActivityColor(activity.type) || '#6f4e37',
                      color: '#fff',
                      width: 32, 
                      height: 32
                    }}>
                      {getActivityIcon(activity.type) || <History />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography fontWeight="medium" variant="body2" color="#6f4e37">
                        {activity.description}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="#9c8c72"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          {activity.userName || activity.userEmail}
                        </Typography>
                        <Typography variant="caption" color="#9c8c72">
                          {activity.timestamp ? 
                            format(activity.timestamp, 'MMM dd, yyyy HH:mm') : 
                            'Unknown time'}
                        </Typography>
                      </>
                    }
                    sx={{ my: 0 }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              p: 3,
              py: 2
            }}>
              <History sx={{ fontSize: 48, color: '#d4a762', mb: 1 }} />
              <Typography variant="body2" color="#9c8c72" align="center">
                No recent activity found
              </Typography>
            </Box>
          )}
        </CardContent>
        <CardActions sx={{ 
          py: 1,
          borderTop: '1px solid #e0d6c2',
          background: 'rgba(255,255,255,0.5)'
        }}>
          <Button 
            size="small" 
            onClick={() => navigate('/activity-logs')}
            endIcon={<ChevronRight sx={{ color: '#6f4e37' }} />}
            sx={{ 
              color: '#6f4e37',
              textTransform: 'none',
              fontWeight: 'medium',
              '&:hover': {
                backgroundColor: 'rgba(111, 78, 55, 0.1)'
              }
            }}
          >
            View All Activity
          </Button>
        </CardActions>
      </Card>
    </Grid>

{/* Order Processing Dialog */}
{selectedOrder && (
  <OrderProcessing
    order={selectedOrder}
    onClose={() => setSelectedOrder(null)}
    onUpdate={() => {
      // Refresh orders data when the order is updated
      const q = query(
        collection(db, 'orders'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      getDocs(q).then(querySnapshot => {
        setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }}
  />
)}




      {/* Queue Dialog - Updated to handle multiple orders */}
<Dialog 
  open={showQueueDialog} 
  onClose={() => setShowQueueDialog(false)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>
    <Box display="flex" alignItems="center">
      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
        <ListAlt />
      </Avatar>
      Order Queue Management
    </Box>
  </DialogTitle>
  <DialogContent dividers>
    {/* Current Processing Section */}
    {currentOrder ? (
      <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: '#e8f5e9' }}>
        <Typography variant="h6" gutterBottom>
          Currently Processing:
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography>
  Order #{currentOrder.orderNumber}
</Typography>
            <Typography>
              Customer: {currentOrder.customerName || 'Walk-in'}
            </Typography>
            <Typography>
              Total: K{currentOrder.total?.toFixed(2) || '0.00'}
            </Typography>
            <Typography>
              Items: {currentOrder.items?.length || 0}
            </Typography>
            <Typography>
              Waiting Time: {Math.floor((new Date() - (currentOrder.createdAt instanceof Date ? currentOrder.createdAt : new Date(currentOrder.createdAt))) / (1000 * 60))} minutes
            </Typography>
          </Box>
          <Button 
  variant="contained" 
  color="success" 
  sx={{ height: 'fit-content' }}
  onClick={async () => {
    await completeCurrentOrder();
    // Refresh queue after completion
    const q = query(
      collection(db, 'queue'),
      where('status', 'in', ['waiting', 'in-progress']),
      orderBy('status'),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    const queueData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      selected: false
    }));
    setQueue(queueData.filter(order => order.status === 'waiting'));
  }}
>
  Complete Order
</Button>
        </Box>
      </Paper>
    ) : (
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h6">
          No order currently being processed
        </Typography>
        {queue.length > 0 && (
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => {
              const nextOrder = queue[0];
              processNextOrder(nextOrder.id);
            }}
          >
            Start Processing Next Order
          </Button>
        )}
      </Box>
    )}

    {/* Waiting Orders Section */}
    <Typography variant="h6" gutterBottom>
      Waiting Orders ({queue.length})
    </Typography>
    
    {queue.length > 0 ? (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    queue.filter(order => order.selected).length > 0 &&
                    queue.filter(order => order.selected).length < queue.length
                  }
                  checked={queue.length > 0 && queue.filter(order => order.selected).length === queue.length}
                  onChange={(e) => {
                    const updatedQueue = queue.map(order => ({
                      ...order,
                      selected: e.target.checked
                    }));
                    setQueue(updatedQueue);
                  }}
                />
              </TableCell>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Wait Time</TableCell>
              <TableCell align="right">Items</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {queue.map((order, index) => (
              <TableRow key={order.id} selected={order.selected}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={order.selected || false}
                    onChange={(e) => {
                      const updatedQueue = [...queue];
                      updatedQueue[index].selected = e.target.checked;
                      setQueue(updatedQueue);
                    }}
                  />
                </TableCell>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.customerName || 'Walk-in'}</TableCell>
                <TableCell align="right">K{order.total?.toFixed(2) || '0.00'}</TableCell>
                <TableCell align="right">
                  {Math.floor((new Date() - (order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt))) / (1000 * 60))} min
                </TableCell>
                <TableCell align="right">{order.items?.length || 0}</TableCell>
                <TableCell align="right">
                  <ButtonGroup size="small">
                    {!currentOrder && (
                      <Button 
                        variant="contained"
                        onClick={() => processNextOrder(order.id)}
                      >
                        Process
                      </Button>
                    )}
                    <Button 
                      variant="outlined"
                      onClick={async () => {
                        try {
                          // Remove from queue
                          await deleteDoc(doc(db, 'queue', order.id));
                          // Update order status back to pending
                          await updateDoc(doc(db, 'orders', order.orderId), {
                            status: 'pending'
                          });
                          showSnackbar('Order removed from queue', 'success');
                        } catch (error) {
                          console.error('Error removing order:', error);
                          showSnackbar('Failed to remove order', 'error');
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No orders currently waiting in queue
        </Typography>
      </Box>
    )}
  </DialogContent>
  <DialogActions>
    <Box display="flex" justifyContent="space-between" width="100%">
      <Box>
        {queue.filter(order => order.selected).length > 0 && (
          <Button 
            variant="contained"
            color="primary"
            onClick={() => {
              const selectedOrders = queue.filter(order => order.selected);
              if (selectedOrders.length > 0) {
                // Process all selected orders
                const batch = writeBatch(db);
                
                selectedOrders.forEach(order => {
                  // Update order status
                  const orderRef = doc(db, 'orders', order.orderId);
                  batch.update(orderRef, {
                    status: 'in-progress',
                    startedAt: serverTimestamp(),
                    assignedTo: user.uid,
                    assignedToName: user.displayName || user.email
                  });
                  
                  // Update queue status
                  const queueRef = doc(db, 'queue', order.id);
                  batch.update(queueRef, {
                    status: 'in-progress',
                    processedAt: serverTimestamp(),
                    processedBy: user.uid
                  });
                });
                
                batch.commit().then(() => {
                  // Set the first selected order as current
                  setCurrentOrder({
                    ...selectedOrders[0],
                    id: selectedOrders[0].id
                  });
                  showSnackbar(`Processing ${selectedOrders.length} orders`, 'success');
                }).catch(error => {
                  console.error('Error processing orders:', error);
                  showSnackbar('Failed to process orders', 'error');
                });
              }
            }}
            disabled={!!currentOrder}
          >
            Process Selected ({queue.filter(order => order.selected).length})
          </Button>
        )}
      </Box>
      <Box>
        <Button onClick={() => setShowQueueDialog(false)}>Close</Button>
        <Button 
          variant="contained"
          onClick={() => {
            // Refresh queue data
            const q = query(
              collection(db, 'queue'),
              where('status', 'in', ['waiting', 'in-progress']),
              orderBy('status'),
              orderBy('createdAt', 'asc')
            );
            getDocs(q).then(snapshot => {
              const queueData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                selected: false
              }));
              
              // Set current order if any order is in-progress
              const inProgressOrder = queueData.find(order => order.status === 'in-progress');
              if (inProgressOrder) {
                setCurrentOrder(inProgressOrder);
              }
              
              // Set queue to waiting orders only
              setQueue(queueData.filter(order => order.status === 'waiting'));
              updateQueueStatus(queueData);
              showSnackbar('Queue refreshed!', 'success');
            });
          }}
        >
          Refresh Queue
        </Button>
      </Box>
    </Box>
  </DialogActions>
</Dialog>

      {/* Shift Notes Dialog */}
      <Dialog 
        open={showNotesDialog} 
        onClose={() => setShowNotesDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Note color="primary" sx={{ mr: 1 }} />
            {currentShiftNote ? 'Edit Shift Notes' : 'Add Shift Notes'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Shift Notes"
            placeholder="Enter notes about your shift (e.g., customer preferences, issues, etc.)"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={shiftNotes}
            onChange={(e) => setShiftNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="text.secondary">
            These notes will be saved with today's date and can be edited until end of shift.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowNotesDialog(false)}
            startIcon={<Close />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveShiftNotes}
            variant="contained"
            startIcon={<Check />}
          >
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>

      {/* All Announcements Dialog */}
<Dialog 
  open={showAllAnnouncementsDialog} 
  onClose={() => setShowAllAnnouncementsDialog(false)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>
    <Box display="flex" alignItems="center">
      <Announcement color="primary" sx={{ mr: 1 }} />
      <Typography>All Announcements & Memos</Typography>
    </Box>
  </DialogTitle>
  <DialogContent>
    <List>
      {/* Internal Memos */}
      {internalMemos.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
            Internal Memos
          </Typography>
          {internalMemos.map(memo => (
            <ListItem key={memo.id} alignItems="flex-start">
              <ListItemIcon>
                <Note color="warning" />
              </ListItemIcon>
              <ListItemText
                primary={`Manager Memo: ${memo.title}`}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{ display: 'block', mb: 1 }}
                    >
                      {format(memo.timestamp, 'MMM dd, yyyy HH:mm')} • {memo.postedBy}
                    </Typography>
                    {memo.content}
                  </>
                }
              />
            </ListItem>
          ))}
        </>
      )}
      
      {/* Regular Announcements */}
      {announcements.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
            Announcements
          </Typography>
          {announcements.map(announcement => (
  <ListItem key={announcement.id} alignItems="flex-start">
    <ListItemIcon>
      <Announcement color="warning" />
    </ListItemIcon>
    <ListItemText
      primary={announcement.title}
      secondary={
        <>
          <Typography
            component="span"
            variant="body2"
            color="text.primary"
            sx={{ display: 'block', mb: 1 }}
          >
            {announcement.timestamp?.toDate ? 
              format(announcement.timestamp.toDate(), 'MMM dd, yyyy HH:mm') : 
              'Date not available'}
          </Typography>
          {announcement.message}
        </>
      }
    />
  </ListItem>
))}
        </>
      )}
      
      {internalMemos.length === 0 && announcements.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center">
          No announcements or memos available
        </Typography>
      )}
    </List>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowAllAnnouncementsDialog(false)}>Close</Button>
  </DialogActions>
</Dialog>

{/* Feedback QR Dialog */}
<Dialog open={showFeedbackQRDialog} onClose={() => setShowFeedbackQRDialog(false)}>
  <DialogTitle sx={{ 
    backgroundColor: '#f5f0e6',
    color: '#6f4e37',
    borderBottom: '1px solid #e0d6c2'
  }}>
    <Box display="flex" alignItems="center">
      <QrCode sx={{ mr: 1 }} />
      Customer Feedback QR Code
    </Box>
  </DialogTitle>
  <DialogContent sx={{ 
    backgroundColor: '#f5f0e6',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    p: 3
  }}>
    <QRCode 
      value={feedbackFormURL}
      size={200}
      level="H"
      includeMargin={true}
    />
    <Typography variant="body2" sx={{ mt: 2, color: '#6f4e37' }}>
      Scan to provide feedback
    </Typography>
    <Typography variant="caption" sx={{ mt: 1, color: '#9c8c72' }}>
      Loyalty members earn points after submission
    </Typography>
  </DialogContent>
  <DialogActions sx={{ 
    backgroundColor: '#f5f0e6',
    borderTop: '1px solid #e0d6c2'
  }}>
    <Button 
      onClick={() => setShowFeedbackQRDialog(false)}
      sx={{ color: '#6f4e37' }}
    >
      Close
    </Button>
    <Button 
      onClick={() => {
        navigator.clipboard.writeText(feedbackFormURL);
        showSnackbar('Link copied to clipboard!', 'success');
      }}
      sx={{ color: '#6f4e37' }}
    >
      Copy Link
    </Button>
  </DialogActions>
</Dialog>

      {/* Low Ingredient Dialog */}
      <Dialog 
        open={showLowIngredientDialog} 
        onClose={() => setShowLowIngredientDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Report color="error" sx={{ mr: 1 }} />
            <Typography>Report Low Ingredient</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Ingredient"
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="espresso">Espresso Beans</MenuItem>
            <MenuItem value="milk">Milk</MenuItem>
            <MenuItem value="sugar">Sugar</MenuItem>
            <MenuItem value="syrup">Flavor Syrup</MenuItem>
            <MenuItem value="cups">Cups/Lids</MenuItem>
            <MenuItem value="pastries">Pastries</MenuItem>
          </TextField>
          
          <TextField
            select
            fullWidth
            label="Level"
            value={ingredientLevel}
            onChange={(e) => setIngredientLevel(e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="low">Running Low</MenuItem>
            <MenuItem value="very_low">Very Low</MenuItem>
            <MenuItem value="out">Out of Stock</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowLowIngredientDialog(false)}
            startIcon={<Close />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReportLowIngredient}
            variant="contained"
            color="error"
            startIcon={<Check />}
          >
            Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Supply Request Dialog */}
      <Dialog 
        open={showSupplyRequestDialog} 
        onClose={() => setShowSupplyRequestDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <ShoppingCart color="primary" sx={{ mr: 1 }} />
            <Typography>Request Supplies</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Supply Request"
            placeholder="Describe what supplies you need (be specific)"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={supplyRequest}
            onChange={(e) => setSupplyRequest(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowSupplyRequestDialog(false)}
            startIcon={<Close />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitSupplyRequest}
            variant="contained"
            startIcon={<Check />}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
  open={showShiftSwapDialog} 
  onClose={() => setShowShiftSwapDialog(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>
    <Box display="flex" alignItems="center">
      <SwapHoriz color="primary" sx={{ mr: 1 }} />
      <Typography>Request Shift Swap</Typography>
    </Box>
  </DialogTitle>
  <DialogContent>
    {selectedShiftForSwap && (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Selected Shift:</Typography>
        <Typography>
          {format(new Date(selectedShiftForSwap.date), 'EEEE, MMMM d')} - 
          {selectedShiftForSwap.clockIn ? 
            ` ${format(selectedShiftForSwap.clockIn, 'h:mm a')}` : 
            ' Not scheduled yet'}
        </Typography>
      </Box>
    )}
    <TextField
      fullWidth
      multiline
      rows={3}
      label="Reason for Swap"
      value={swapReason}
      onChange={(e) => setSwapReason(e.target.value)}
      sx={{ mt: 2 }}
    />
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setShowShiftSwapDialog(false)}
      startIcon={<Close />}
    >
      Cancel
    </Button>
    <Button 
      onClick={handleRequestShiftSwap}
      variant="contained"
      startIcon={<Check />}
      disabled={!swapReason}
    >
      Submit Request
    </Button>
  </DialogActions>
</Dialog>

<Dialog 
  open={showFeedbackForm} 
  onClose={() => setShowFeedbackForm(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle sx={{ 
    backgroundColor: '#6f4e37',
    color: '#fff',
    display: 'flex',
    alignItems: 'center'
  }}>
    <RateReview sx={{ mr: 1 }} />
    Customer Feedback Form
  </DialogTitle>
  <DialogContent sx={{ pt: 3 }}>
    <Autocomplete
  freeSolo
  options={customerResults}
  getOptionLabel={(option) => 
    typeof option === 'string' ? option : 
    `${option.name || option.email} (Card: ${option.cardNumber || 'N/A'}, ${option.points || 0} pts)`
  }
  inputValue={customerSearch}
  onInputChange={(event, newValue) => {
    setCustomerSearch(newValue);
    if (newValue === '') {
      setCustomerResults([]);
    }
  }}
  onChange={(event, newValue) => {
    if (newValue && typeof newValue === 'object') {
      setFeedbackCustomer(newValue);
    }
  }}
  filterOptions={(options, state) => options} // Disable client-side filtering
  renderInput={(params) => (
    <TextField 
      {...params} 
      label="Search customer by name, email, or card number" 
      variant="outlined"
      fullWidth
    />
  )}
  noOptionsText={customerSearch.length > 0 ? "No customers found" : "Start typing to search"}
/>
    
    {!feedbackCustomer && (
      <TextField
        fullWidth
        label="Customer Name (optional)"
        value={manualCustomerName}
        onChange={(e) => setManualCustomerName(e.target.value)}
        sx={{ mt: 2 }}
      />
    )}
    
    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="body1" gutterBottom>
        How would you rate your experience?
      </Typography>
      <Rating
        value={feedbackRating}
        onChange={(event, newValue) => setFeedbackRating(newValue)}
        size="large"
        sx={{ fontSize: '2.5rem' }}
      />
    </Box>
    
    <TextField
      fullWidth
      label="Comments (optional)"
      multiline
      rows={4}
      value={feedbackComment}
      onChange={(e) => setFeedbackComment(e.target.value)}
      sx={{ mt: 3 }}
    />
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setShowFeedbackForm(false)}
      sx={{ color: '#6f4e37' }}
    >
      Cancel
    </Button>
    <Button 
      variant="contained"
      onClick={submitFeedback}
      sx={{ backgroundColor: '#6f4e37', color: '#fff' }}
    >
      Submit Feedback
    </Button>
  </DialogActions>
</Dialog>

<Dialog 
  open={showLoyaltyDialog} 
  onClose={() => setShowLoyaltyDialog(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>
    <Box display="flex" alignItems="center">
      <Loyalty color="primary" sx={{ mr: 1 }} />
      <Typography>Redeem Loyalty Points</Typography>
    </Box>
  </DialogTitle>
  <DialogContent>
    {selectedCustomer ? (
      <>
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h6">
            {selectedCustomer.name || selectedCustomer.email}
          </Typography>
          <Typography variant="subtitle1" color="primary">
            Available Points: {selectedCustomer.points || 0}
          </Typography>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Available Rewards:
        </Typography>
        
        {availableRewards.length > 0 ? (
          <List>
            {availableRewards.map((reward) => (
              <ListItem 
                key={reward.id}
                sx={{
                  mb: 1,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: selectedCustomer.points >= reward.pointsRequired ? 
                    '#e8f5e9' : '#ffebee'
                }}
                secondaryAction={
                  <Button
                    variant="contained"
                    size="small"
                    disabled={selectedCustomer.points < reward.pointsRequired}
                    onClick={() => handleRedeemPoints(reward.id)}
                    color={selectedCustomer.points >= reward.pointsRequired ? 
                      'success' : 'error'}
                  >
                    {selectedCustomer.points >= reward.pointsRequired ? 
                      'Redeem' : 'Not Enough Points'}
                  </Button>
                }
              >
                <ListItemText
                  primary={reward.name}
                  secondary={
                    <>
                      <Typography variant="body2">
                        {reward.description}
                      </Typography>
                      <Typography variant="body2">
                        Cost: {reward.pointsRequired} points
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No rewards available
          </Typography>
        )}
      </>
    ) : (
      <Typography variant="body2" color="error" align="center">
        No customer selected
      </Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowLoyaltyDialog(false)}>Close</Button>
  </DialogActions>
</Dialog>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );

  const renderManagerDashboard = () => {
  const handleApproveShiftSwap = async (requestId) => {
  try {
    const requestRef = doc(db, 'shiftSwapRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      showSnackbar('Request not found', 'error');
      return;
    }
    
    const requestData = requestSnap.data();
    
    // Update the request status
    await updateDoc(requestRef, {
      status: 'approved',
      approvedBy: user.uid,
      approvedAt: serverTimestamp()
    });
    
    // Create notification
    await createShiftSwapApprovalNotification(requestData.originalShiftId, requestData.requestedBy, user.uid);
    
    showSnackbar('Shift swap approved successfully!', 'success');
  } catch (error) {
    console.error('Error approving shift swap:', error);
    showSnackbar('Failed to approve shift swap', 'error');
  }
};

  const handleRejectShiftSwap = async (requestId) => {
    try {

const requestRef = doc(db, 'shiftSwapRequests', requestId);
    const requestSnap = await getDoc(requestRef);
      const requestData = requestSnap.data();
      await updateDoc(doc(db, 'shiftSwapRequests', requestId), {
        status: 'rejected',
        rejectedBy: user.uid,
        rejectedAt: serverTimestamp()
      });

      // Create notification
    await createShiftSwapRejectionNotification(requestData.originalShiftId, requestData.requestedBy, user.uid);
      showSnackbar('Shift swap rejected', 'info');
    } catch (error) {
      console.error('Error rejecting shift swap:', error);
      showSnackbar('Failed to reject shift swap', 'error');
    }
  };

  const handleUpdateStaffRole = async (staffId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', staffId), {
        role: newRole
      });
      showSnackbar('Staff role updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating staff role:', error);
      showSnackbar('Failed to update staff role', 'error');
    }
  };

  const handleRestockInventory = async (productId, quantity) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        stock: increment(quantity),
        lastRestocked: serverTimestamp()
      });
      showSnackbar('Inventory restocked successfully!', 'success');
    } catch (error) {
      console.error('Error restocking inventory:', error);
      showSnackbar('Failed to restock inventory', 'error');
    }
  };

  const exportSalesReport = () => {
  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Add title and metadata
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'MARY GRACE CAKES AND MORE - SALES REPORT';
    titleCell.font = {
      size: 16,
      bold: true,
      color: { argb: '963250' } // Mary Grace brand color
    };
    titleCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:E2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`;
    dateCell.font = { italic: true };
    dateCell.alignment = { horizontal: 'center' };

    // Add summary information
    const totalAmount = salesData.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = salesData.length;
    
    worksheet.getCell('A4').value = 'Summary:';
    worksheet.getCell('A4').font = { bold: true };
    worksheet.getCell('A5').value = `Total Orders: ${totalOrders}`;
    worksheet.getCell('A6').value = `Total Sales: K ${totalAmount.toFixed(2)}`; // Changed to K

    // Add headers with styling
    const headers = ['Order ID', 'Customer', 'Amount (K)', 'Time', 'Staff']; // Added (K) to Amount header
    worksheet.addRow(headers);
    
    // Style header row
    const headerRow = worksheet.getRow(8);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '963250' } // Mary Grace brand color
      };
      cell.alignment = { horizontal: 'center' };
    });

    // Add data rows
    salesData.forEach(order => {
      const row = worksheet.addRow([
        `#${order.orderNumber || order.id.slice(0, 4)}`, // Use orderNumber if available, else fallback to id
        order.customerName || 'Walk-in',
        order.total || 0,
        order.createdAt?.toDate ? format(order.createdAt.toDate(), 'HH:mm') : format(new Date(order.createdAt), 'HH:mm') || 'N/A',
        order.createdByName || 'System'
      ]);
      
      // Format amount column as PNG currency (K)
      row.getCell(3).numFmt = '"K"#,##0.00'; // Changed to K format
    });

    // Auto-fit columns with some padding
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 30);
    });

    // Add footer
    const footerRow = worksheet.getRow(worksheet.rowCount + 2);
    worksheet.mergeCells(`A${footerRow.number}:E${footerRow.number}`);
    const footerCell = footerRow.getCell(1);
    footerCell.value = 'Mary Grace Cakes and More - Confidential';
    footerCell.font = { italic: true, size: 9 };
    footerCell.alignment = { horizontal: 'center' };

    // Generate and download the Excel file
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Mary-Grace-Sales-Report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    showSnackbar('Excel report exported successfully!', 'success');
  } catch (error) {
    console.error('Error exporting report:', error);
    showSnackbar('Failed to export report', 'error');
  }
};

  const handleFulfillRequest = async (requestId) => {
  try {
    const requestRef = doc(db, 'supplyRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      showSnackbar('Request not found', 'error');
      return;
    }
    
    const requestData = requestSnap.data();
    
    // Update the request status
    await updateDoc(requestRef, {
      fulfilled: true,
      fulfilledAt: serverTimestamp(),
      fulfilledBy: user.uid
    });
    
    // Create notification
    await createSupplyRequestFulfilledNotification(requestData.request, user.uid, requestData.requestedBy);
    
    showSnackbar('Request marked as fulfilled', 'success');
  } catch (error) {
    console.error('Error fulfilling request:', error);
    showSnackbar('Failed to fulfill request', 'error');
  }
};

  const handleDeactivateStaff = async (staffId) => {
    try {
      await updateDoc(doc(db, 'users', staffId), {
        active: false
      });
      showSnackbar('Staff deactivated successfully', 'success');
    } catch (error) {
      console.error('Error deactivating staff:', error);
      showSnackbar('Failed to deactivate staff', 'error');
    }
  };

  return (
  <Box sx={{ 
    p: 4, 
    background: 'linear-gradient(to bottom, #f5f5f5, #f9f3e9)',
    minHeight: '100vh'
  }}>
    {/* Header */}
    <Box sx={{ 
      mb: 4, 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderBottom: '1px solid #e0d6c2',
      pb: 2
    }}>
      <Typography variant="h4" sx={{ 
        fontFamily: "'Playfair Display', serif", 
        color: '#5d4037',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Cake sx={{ 
          mr: 2, 
          color: '#8d6e63',
          fontSize: '2rem' // Slightly larger for better visibility
        }} />
        Mary Grace Cakes & More Dashboard
      </Typography>
      <Chip 
        label={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
        sx={{ 
          bgcolor: '#d7ccc8', 
          color: '#5d4037',
          fontFamily: "'Roboto', sans-serif",
          fontSize: '0.9rem'
        }}
      />
    </Box>

    {/* Summary Cards Row */}
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* Today's Revenue Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #fff, #f5ebe0)',
          border: '1px solid #e0d6c2',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 16px rgba(93, 64, 55, 0.15)'
          }
        }}>
          <CardHeader
            avatar={
              <Avatar sx={{ 
                bgcolor: 'transparent',
                color: '#5d4037',
                border: '2px solid #a1887f'
              }}>
                <AttachMoney />
              </Avatar>
            }
            title={
              <Typography variant="h6" sx={{ 
                color: '#5d4037',
                fontFamily: "'Roboto Condensed', sans-serif"
              }}>
                Today's Sweet Revenue
              </Typography>
            }
            subheader={
              <Typography variant="h4" component="div" sx={{ 
                mt: 1, 
                color: '#3e2723',
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700
              }}>
                K{salesData.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}
              </Typography>
            }
            sx={{ pb: 0 }}
          />
          <CardActions sx={{ mt: 'auto', px: 2, pb: 2 }}>
            <Button 
              size="small" 
              onClick={() => setShowSalesReportDialog(true)}
              startIcon={<BarChart sx={{ color: '#8d6e63' }} />}
              sx={{
                color: '#5d4037',
                bgcolor: 'rgba(141, 110, 99, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(141, 110, 99, 0.2)'
                }
              }}
            >
              View Details
            </Button>
          </CardActions>
        </Card>
      </Grid>

      {/* Staff Members Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #fff, #f5ebe0)',
          border: '1px solid #e0d6c2',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 16px rgba(93, 64, 55, 0.15)'
          }
        }}>
          <CardHeader
            avatar={
              <Avatar sx={{ 
                bgcolor: 'transparent',
                color: '#5d4037',
                border: '2px solid #a1887f'
              }}>
                <People />
              </Avatar>
            }
            title={
              <Typography variant="h6" sx={{ 
                color: '#5d4037',
                fontFamily: "'Roboto Condensed', sans-serif"
              }}>
                Bakery Team
              </Typography>
            }
            subheader={
              <Typography variant="h4" component="div" sx={{ 
                mt: 1, 
                color: '#3e2723',
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700
              }}>
                {staffMembers.length} active
              </Typography>
            }
            sx={{ pb: 0 }}
          />
          <CardActions sx={{ mt: 'auto', px: 2, pb: 2 }}>
            <Button 
              size="small" 
              onClick={() => setShowStaffManagement(true)}
              startIcon={<Group sx={{ color: '#8d6e63' }} />}
              sx={{
                color: '#5d4037',
                bgcolor: 'rgba(141, 110, 99, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(141, 110, 99, 0.2)'
                }
              }}
            >
              Manage Team
            </Button>
          </CardActions>
        </Card>
      </Grid>

      {/* Low Stock Items Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #fff, #f5ebe0)',
          border: '1px solid #e0d6c2',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 16px rgba(93, 64, 55, 0.15)'
          }
        }}>
          <CardHeader
            avatar={
              <Avatar sx={{ 
                bgcolor: 'transparent',
                color: '#d84315',
                border: '2px solid #d84315'
              }}>
                <Inventory />
              </Avatar>
            }
            title={
              <Typography variant="h6" sx={{ 
                color: '#5d4037',
                fontFamily: "'Roboto Condensed', sans-serif"
              }}>
                Low Stock Ingredients
              </Typography>
            }
            subheader={
              <Typography variant="h4" component="div" sx={{ 
                mt: 1, 
                color: '#3e2723',
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700
              }}>
                {inventoryItems.filter(item => item.stock < 10).length} items
              </Typography>
            }
            sx={{ pb: 0 }}
          />
          <CardActions sx={{ mt: 'auto', px: 2, pb: 2 }}>
            <Button 
              size="small" 
              onClick={() => setShowInventoryDialog(true)}
              startIcon={<Warehouse sx={{ color: '#d84315' }} />}
              sx={{
                color: '#d84315',
                bgcolor: 'rgba(216, 67, 21, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(216, 67, 21, 0.2)'
                }
              }}
            >
              View Inventory
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>

    {/* Second Row - Key Metrics */}
    <Grid container spacing={3}>
      {/* Daily Sales Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ 
          height: '100%',
          background: 'linear-gradient(145deg, #fff, #f5ebe0)',
          border: '1px solid #e0d6c2',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)'
        }}>
          <CardHeader
            title={
              <Typography variant="h6" sx={{ 
                color: '#5d4037',
                fontFamily: "'Roboto Condensed', sans-serif"
              }}>
                Daily Cake Sales
              </Typography>
            }
            avatar={
              <Avatar sx={{ 
                bgcolor: 'transparent',
                color: '#5d4037',
                border: '2px solid #a1887f'
              }}>
                <AttachMoney />
              </Avatar>
            }
            action={
              <IconButton 
                onClick={() => setShowSalesReportDialog(true)}
                sx={{ color: '#8d6e63' }}
              >
                <BarChart />
              </IconButton>
            }
          />
          <CardContent>
            <Box display="flex" alignItems="baseline" mb={1}>
              <Typography variant="h4" component="div" sx={{ 
                mr: 2,
                color: '#3e2723',
                fontFamily: "'Playfair Display', serif"
              }}>
                K{dailySales.today.toFixed(2)}
              </Typography>
              <Chip 
                label={`${dailySales.transactions} orders`} 
                size="small" 
                sx={{
                  bgcolor: 'rgba(141, 110, 99, 0.1)',
                  color: '#5d4037',
                  border: '1px solid #a1887f'
                }}
              />
            </Box>
            <Box display="flex" alignItems="center">
              {dailySales.today > dailySales.yesterday ? (
                <TrendingUp sx={{ 
                  color: '#2e7d32',
                  mr: 1 
                }} />
              ) : (
                <TrendingDown sx={{ 
                  color: '#c62828',
                  mr: 1 
                }} />
              )}
              <Typography 
                variant="body2" 
                sx={{
                  color: dailySales.today > dailySales.yesterday ? '#2e7d32' : '#c62828',
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500
                }}
              >
                {Math.abs(((dailySales.today - dailySales.yesterday) / (dailySales.yesterday || 1)) * 100).toFixed(1)}% 
                from yesterday
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(100, (dailySales.today / (dailySales.target || dailySales.today * 1.5)) * 100)} 
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#d7ccc8',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#8d6e63'
                  }
                }}
              />
              <Typography variant="caption" sx={{ 
                color: '#5d4037',
                display: 'block',
                mt: 1,
                textAlign: 'right'
              }}>
                {((dailySales.today / (dailySales.target || dailySales.today * 1.5)) * 100).toFixed(0)}% of daily target
              </Typography>
            </Box>
          </CardContent>
          <CardActions sx={{ 
            borderTop: '1px solid #e0d6c2',
            pt: 1,
            justifyContent: 'space-between'
          }}>
            <Button 
              size="small" 
              onClick={() => window.print()}
              startIcon={<Print sx={{ color: '#8d6e63' }} />}
              sx={{
                color: '#5d4037',
                '&:hover': {
                  bgcolor: 'rgba(141, 110, 99, 0.1)'
                }
              }}
            >
              Print Report
            </Button>
            <Button 
              size="small" 
              startIcon={<Email sx={{ color: '#8d6e63' }} />}
              sx={{
                color: '#5d4037',
                '&:hover': {
                  bgcolor: 'rgba(141, 110, 99, 0.1)'
                }
              }}
            >
              Email Report
            </Button>
          </CardActions>
        </Card>
      </Grid>

      {/* Attendance Tracking Card */}
<Grid item xs={12} sm={6} md={4}>
  <Card sx={{ 
    height: '100%',
    background: 'linear-gradient(145deg, #fff, #f5ebe0)',
    border: '1px solid #e0d6c2',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)'
  }}>
    <CardHeader
      title={
        <Typography variant="h6" sx={{ 
          color: '#5d4037',
          fontFamily: "'Roboto Condensed', sans-serif"
        }}>
          Staff Attendance
        </Typography>
      }
      avatar={
        <Avatar sx={{ 
          bgcolor: 'transparent',
          color: '#5d4037',
          border: '2px solid #a1887f'
        }}>
          <People />
        </Avatar>
      }
    />
    <CardContent sx={{ pt: 0 }}>
      <List dense>
        {attendanceLogs.slice(0, 3).map(log => (
          <ListItem 
            key={log.id}
            sx={{
              bgcolor: log.clockIn && !log.clockOut ? 'rgba(141, 110, 99, 0.05)' : 'transparent',
              borderRadius: '8px',
              mb: 1,
              px: 2,
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(141, 110, 99, 0.1)'
              }
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ 
                width: 36, 
                height: 36,
                bgcolor: '#d7ccc8',
                color: '#5d4037',
                fontWeight: 600
              }}>
                {log.userName?.charAt(0) || log.userEmail?.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <Box sx={{
              flex: 1,
              ml: 1,
              minWidth: 0
            }}>
              <Typography 
                sx={{ 
                  color: '#3e2723',
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {log.userName || log.userEmail}
              </Typography>
              {log.clockIn ? 
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: '#5d4037',
                  fontSize: '0.85rem',
                  mt: 0.5
                }}>
                  <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                  {`Clocked in at ${format(log.clockIn, 'HH:mm')}`}
                </Box> : 
                <Typography variant="body2" sx={{ color: '#8d6e63' }}>
                  Not clocked in
                </Typography>
              }
            </Box>
          </ListItem>
        ))}
      </List>
    </CardContent>
    <CardActions sx={{ 
      borderTop: '1px solid #e0d6c2',
      pt: 1
    }}>
      <Button 
        size="small" 
        onClick={() => setShowAttendanceDialog(true)}
        startIcon={<List sx={{ color: '#8d6e63' }} />}
        sx={{
          color: '#5d4037',
          fontWeight: 500,
          '&:hover': {
            bgcolor: 'rgba(141, 110, 99, 0.1)'
          }
        }}
      >
        View All Attendance
      </Button>
    </CardActions>
  </Card>
</Grid>


      {/* Customer Feedback Card */}
<Grid item xs={12} sm={6} md={4}>
  <Card sx={{ 
    height: '100%',
    background: 'linear-gradient(145deg, #fff, #f5ebe0)',
    border: '1px solid #e0d6c2',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)'
  }}>
    <CardHeader
      title={
        <Typography variant="h6" sx={{ 
          color: '#5d4037',
          fontFamily: "'Roboto Condensed', sans-serif"
        }}>
          Customer Feedback
        </Typography>
      }
      avatar={
        <Avatar sx={{ 
          bgcolor: 'transparent',
          color: '#5d4037',
          border: '2px solid #a1887f'
        }}>
          <Announcement />
        </Avatar>
      }
      action={
        <IconButton size="small" sx={{ color: '#8d6e63' }}>
          <Refresh />
        </IconButton>
      }
    />
    <CardContent sx={{ pt: 0 }}>
      {customerFeedback.length > 0 ? (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="subtitle2" sx={{ color: '#5d4037' }}>
              Average Rating: {(
                customerFeedback.reduce((sum, fb) => sum + fb.rating, 0) / 
                customerFeedback.length
              ).toFixed(1)}/5
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#5d4037' }}>
              Total Responses: {customerFeedback.length}
            </Typography>
          </Box>
          <List dense>
            {customerFeedback.slice(0, 3).map(feedback => (
              <ListItem 
  key={feedback.id}
  sx={{
    mb: 1,
    borderRadius: '8px',
    backgroundColor: feedback.rating < 3 ? 'rgba(198, 40, 40, 0.05)' : 'transparent',
    '&:hover': {
      backgroundColor: feedback.rating < 3 ? 'rgba(198, 40, 40, 0.1)' : 'rgba(141, 110, 99, 0.1)'
    }
  }}
  secondaryAction={
    <Box>
      {feedback.customerId && (
        <Chip 
          label={`+5 pts`}
          size="small"
          sx={{
            mr: 1,
            backgroundColor: '#d4a762',
            color: '#fff',
            fontSize: '0.65rem'
          }}
        />
      )}
      {feedback.rating < 3 && (
        <Tooltip title="Flag as complaint">
          <IconButton size="small">
            <Report color="error" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  }
>
  <ListItemAvatar>
    <Rating 
      value={feedback.rating} 
      size="small" 
      readOnly 
      sx={{
        '& .MuiRating-iconFilled': {
          color: feedback.rating < 3 ? '#d84315' : '#5d4037'
        }
      }}
    />
  </ListItemAvatar>
  <Box sx={{ pr: 7 }}>
    <ListItemText
      primary={
        <Typography noWrap sx={{ color: '#3e2723' }}>
          {feedback.comment || 'No comment'}
        </Typography>
      }
      secondary={
        <>
          <Typography variant="body2" sx={{ color: '#8d6e63' }}>
            {feedback.customerName || 'Anonymous'} • {feedback.cardNumber ? `Card: ${feedback.cardNumber}` : ''}
          </Typography>
          <Typography variant="caption" sx={{ color: '#8d6e63' }}>
            {feedback.timestamp ? 
              (feedback.timestamp.toDate ? 
                format(feedback.timestamp.toDate(), 'MMM dd, HH:mm') : 
                format(new Date(feedback.timestamp), 'MMM dd, HH:mm')) : 
              'Unknown date'} • 
            Collected by: {feedback.staffFirstName}
          </Typography>
        </>
      }
    />
  </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      ) : (
        <Typography variant="body2" sx={{ 
          color: '#8d6e63', 
          textAlign: 'center',
          p: 2
        }}>
          No feedback received yet
        </Typography>
      )}
    </CardContent>
    <CardActions sx={{ 
      borderTop: '1px solid #e0d6c2',
      pt: 1
    }}>
      <Button 
  size="small" 
  startIcon={<Forum sx={{ color: '#8d6e63' }} />}
  sx={{
    color: '#5d4037',
    '&:hover': {
      bgcolor: 'rgba(141, 110, 99, 0.1)'
    }
  }}
  onClick={() => setShowAllFeedbackDialog(true)}
>
  View All Feedback
</Button>
    </CardActions>
  </Card>
</Grid>
</Grid>

    {/* Coffee Cup Decorations */}
    <Box sx={{ 
      position: 'fixed', 
      bottom: 20, 
      right: 20,
      opacity: 0.1,
      zIndex: -1
    }}>
      <LocalCafe sx={{ fontSize: 200, color: '#8d6e63' }} />
    </Box>
  

    {/* Third Row - Data Tables */}
<Grid container spacing={3} sx={{ mt: 0 }}>
  {/* Product Performance Card */}
  <Grid item xs={12} md={6}>
    <Card sx={{ 
      background: 'linear-gradient(145deg, #fff, #f5ebe0)',
      border: '1px solid #e0d6c2',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)'
    }}>
      <CardHeader
        title={
          <Typography variant="h6" sx={{ 
            color: '#5d4037',
            fontFamily: "'Roboto Condensed', sans-serif"
          }}>
            Top Treats
          </Typography>
        }
        avatar={
          <Avatar sx={{ 
            bgcolor: 'transparent',
            color: '#5d4037',
            border: '2px solid #a1887f'
          }}>
            <LocalCafe />
          </Avatar>
        }
        action={
          <IconButton sx={{ color: '#8d6e63' }}>
            <MoreVert />
          </IconButton>
        }
      />
      <CardContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{
                '& th': {
                  backgroundColor: '#efebe9',
                  fontFamily: "'Roboto Condensed', sans-serif",
                  color: '#5d4037',
                  fontWeight: 600
                }
              }}>
                <TableCell>Beverage</TableCell>
                <TableCell align="right">Sold</TableCell>
                <TableCell align="right">Revenue</TableCell>
                <TableCell align="right">Popularity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getTopSellingItems(salesData).map((item, index) => (
                <TableRow 
                  key={index} 
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(141, 110, 99, 0.05)'
                    }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ 
                        width: 24, 
                        height: 24, 
                        mr: 1, 
                        bgcolor: '#efebe9',
                        color: '#5d4037'
                      }}>
                        <LocalCafe fontSize="small" />
                      </Avatar>
                      <Typography sx={{ color: '#3e2723' }}>
                        {item.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#3e2723' }}>
                    {item.quantity}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#3e2723' }}>
                    K{item.total.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, (item.quantity / getTopSellingItems(salesData)[0].quantity) * 100)} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: '#d7ccc8',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#8d6e63'
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  </Grid>

  {/* Internal Communications Card */}
  <Grid item xs={12} md={6}>
    <Card sx={{ 
      height: '100%',
      background: 'linear-gradient(145deg, #fff, #f5ebe0)',
      border: '1px solid #e0d6c2',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)'
    }}>
      <CardHeader
        title={
          <Typography variant="h6" sx={{ 
            color: '#5d4037',
            fontFamily: "'Roboto Condensed', sans-serif"
          }}>
            Staff Notes
          </Typography>
        }
        avatar={
          <Avatar sx={{ 
            bgcolor: 'transparent',
            color: '#5d4037',
            border: '2px solid #a1887f'
          }}>
            <Note />
          </Avatar>
        }
        action={
          <Button 
            variant="outlined"
            size="small" 
            onClick={() => setShowAddMemoDialog(true)}
            startIcon={<Add sx={{ color: '#8d6e63' }} />}
            sx={{
              color: '#5d4037',
              borderColor: '#a1887f',
              '&:hover': {
                bgcolor: 'rgba(141, 110, 99, 0.1)',
                borderColor: '#8d6e63'
              }
            }}
          >
            Add Note
          </Button>
        }
      />
      <CardContent>
        <List dense>
          {internalMemos.slice(0, 3).map(memo => (
            <ListItem 
              key={memo.id}
              sx={{
                mb: 1,
                borderRadius: '8px',
                backgroundColor: '#efebe9',
                '&:hover': {
                  backgroundColor: '#e0d6c2'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ 
                  bgcolor: '#d7ccc8',
                  color: '#5d4037'
                }}>
                  <Note />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography fontWeight="medium" sx={{ color: '#3e2723' }}>
                    {memo.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" sx={{ 
                      mt: 0.5,
                      color: '#5d4037'
                    }}>
                      {memo.content}
                    </Typography>
                    <Box display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                      <Typography variant="caption" sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: '#8d6e63'
                      }}>
                        <Person fontSize="small" sx={{ mr: 0.5 }} />
                        {memo.postedBy}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        ml: 2, 
                        display: 'flex', 
                        alignItems: 'center',
                        color: '#8d6e63'
                      }}>
                        <CalendarToday fontSize="small" sx={{ mr: 0.5 }} />
                        {format(memo.timestamp, 'MMM dd')}
                      </Typography>
                    </Box>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
      <CardActions sx={{ 
        borderTop: '1px solid #e0d6c2',
        pt: 1
      }}>
        <Button 
          size="small" 
          onClick={() => setShowAllMemosDialog(true)}
          startIcon={<List sx={{ color: '#8d6e63' }} />}
          sx={{
            color: '#5d4037',
            '&:hover': {
              bgcolor: 'rgba(141, 110, 99, 0.1)'
            }
          }}
        >
          View All Notes
        </Button>
      </CardActions>
    </Card>
  </Grid>
</Grid>

{/* Pending Approvals Section */}
<Grid item xs={12} sx={{ mt: 3 }}>
  <Card sx={{ 
    background: 'linear-gradient(145deg, #fff, #f5ebe0)',
    border: '1px solid #e0d6c2',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)',
    overflow: 'visible' // Added to prevent clipping
  }}>
    <CardHeader
      title={
        <Typography variant="h6" sx={{ 
          color: '#5d4037',
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: '1.25rem'
        }}>
          Pending Approvals 
        </Typography>
      }
      avatar={
        <Avatar sx={{ 
          bgcolor: 'transparent',
          color: '#5d4037',
          border: '2px solid #a1887f'
        }}>
          <Check />
        </Avatar>
      }
      action={
        <Tooltip title="Refresh approvals">
          <IconButton 
            onClick={() => {
              fetchShiftSwapRequests();
              fetchSupplyRequests();
              showSnackbar('Pending approvals refreshed!', 'info');
            }}
            sx={{ color: '#8d6e63' }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      }
      sx={{ pb: 1 }}
    />
    <CardContent sx={{ pt: 1 }}>
      <Grid container spacing={3}>
        {/* Shift Swap Requests - Wider Card */}
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Card variant="outlined" sx={{ 
            borderColor: '#a1887f',
            borderRadius: '8px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 300 // Ensure minimum height
          }}>
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ 
                  color: '#5d4037',
                  fontFamily: "'Roboto Condensed', sans-serif",
                  fontWeight: 600,
                  fontSize: '1rem'
                }}>
                  <SwapHoriz sx={{ 
                    verticalAlign: 'middle', 
                    mr: 1,
                    color: '#5d4037'
                  }} />
                  Shift Swap Requests
                  <Chip 
                    label={shiftSwapRequests.filter(req => req.status === 'pending').length} 
                    size="small" 
                    sx={{ 
                      ml: 1,
                      bgcolor: '#d7ccc8',
                      color: '#5d4037',
                      border: '1px solid #a1887f'
                    }}
                  />
                </Typography>
              }
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ 
              pt: 0,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto'
            }}>
              {shiftSwapRequests.filter(req => req.status === 'pending').length > 0 ? (
                <List dense sx={{ flex: 1 }}>
                  {shiftSwapRequests.filter(req => req.status === 'pending').map(request => (
                    <ListItem 
                      key={request.id} 
                      sx={{
                        mb: 1,
                        borderLeft: '4px solid',
                        borderColor: '#8d6e63',
                        backgroundColor: 'rgba(141, 110, 99, 0.05)',
                        borderRadius: '4px',
                        '&:hover': {
                          backgroundColor: 'rgba(141, 110, 99, 0.1)'
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ 
                            color: '#3e2723',
                            fontWeight: 500,
                            fontSize: '0.9rem'
                          }}>
                            {request.firstName} wants to swap shift
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ 
                              mt: 0.5,
                              color: '#5d4037',
                              fontSize: '0.8rem'
                            }}>
                              <Description fontSize="small" sx={{ 
                                verticalAlign: 'middle', 
                                mr: 0.5,
                                color: '#8d6e63'
                              }} />
                              {request.reason}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ 
                              mt: 0.5,
                              color: '#8d6e63',
                              fontSize: '0.75rem'
                            }}>
                              <CalendarToday fontSize="small" sx={{ 
                                verticalAlign: 'middle', 
                                mr: 0.5 
                              }} />
                              {format(request.createdAt?.toDate(), 'MMM dd, h:mm a')}
                            </Typography>
                          </>
                        }
                        sx={{ pr: 2 }}
                      />
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'row', sm: 'column' }, 
                        gap: 1,
                        minWidth: 120,
                        flexShrink: 0
                      }}>
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={() => handleApproveShiftSwap(request.id)}
                          startIcon={<Check sx={{ fontSize: '1rem' }} />}
                          sx={{
                            bgcolor: '#8d6e63',
                            '&:hover': { bgcolor: '#5d4037' },
                            fontSize: '0.75rem',
                            py: 0.5,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => handleRejectShiftSwap(request.id)}
                          startIcon={<Close sx={{ fontSize: '1rem' }} />}
                          sx={{
                            color: '#5d4037',
                            borderColor: '#a1887f',
                            '&:hover': {
                              bgcolor: 'rgba(141, 110, 99, 0.1)',
                              borderColor: '#8d6e63'
                            },
                            fontSize: '0.75rem',
                            py: 0.5,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Paper elevation={0} sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  backgroundColor: '#efebe9',
                  borderRadius: '8px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="body2" sx={{ color: '#8d6e63' }}>
                    No pending shift swap requests
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Supply Requests - Wider Card */}
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Card variant="outlined" sx={{ 
            borderColor: '#a1887f',
            borderRadius: '8px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 300 // Match height with shift swaps
          }}>
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ 
                  color: '#5d4037',
                  fontFamily: "'Roboto Condensed', sans-serif",
                  fontWeight: 600,
                  fontSize: '1rem'
                }}>
                  <ShoppingCart sx={{ 
                    verticalAlign: 'middle', 
                    mr: 1,
                    color: '#d84315'
                  }} />
                  Supply Requests
                  <Chip 
                    label={supplyRequests.filter(req => !req.fulfilled).length} 
                    size="small" 
                    sx={{ 
                      ml: 1,
                      bgcolor: 'rgba(216, 67, 21, 0.1)',
                      color: '#d84315',
                      border: '1px solid #d84315'
                    }}
                  />
                </Typography>
              }
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ 
              pt: 0,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto'
            }}>
              {supplyRequests.filter(req => !req.fulfilled).length > 0 ? (
                <List dense sx={{ flex: 1 }}>
                  {supplyRequests.filter(req => !req.fulfilled).map(request => (
                    <ListItem 
                      key={request.id}
                      sx={{
                        mb: 1,
                        borderLeft: '4px solid',
                        borderColor: '#d84315',
                        backgroundColor: 'rgba(216, 67, 21, 0.05)',
                        borderRadius: '4px',
                        '&:hover': {
                          backgroundColor: 'rgba(216, 67, 21, 0.1)'
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ 
                            color: '#3e2723',
                            fontWeight: 500,
                            fontSize: '0.9rem'
                          }}>
                            {request.request}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ 
                              mt: 0.5,
                              color: '#5d4037',
                              fontSize: '0.8rem'
                            }}>
                              <Person fontSize="small" sx={{ 
                                verticalAlign: 'middle', 
                                mr: 0.5,
                                color: '#8d6e63'
                              }} />
                              Requested by {request.firstName}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ 
                              mt: 0.5,
                              color: '#8d6e63',
                              fontSize: '0.75rem'
                            }}>
                              <CalendarToday fontSize="small" sx={{ 
                                verticalAlign: 'middle', 
                                mr: 0.5 
                              }} />
                              {format(request.timestamp?.toDate(), 'MMM dd, h:mm a')}
                            </Typography>
                          </>
                        }
                        sx={{ pr: 2 }}
                      />
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => handleFulfillRequest(request.id)}
                        startIcon={<Check sx={{ fontSize: '1rem' }} />}
                        sx={{ 
                          minWidth: 100,
                          bgcolor: '#d84315',
                          '&:hover': { bgcolor: '#bf360c' },
                          fontSize: '0.75rem',
                          py: 0.5,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Fulfill
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Paper elevation={0} sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  backgroundColor: '#efebe9',
                  borderRadius: '8px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="body2" sx={{ color: '#8d6e63' }}>
                    No pending supply requests
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
</Grid>

{/* Low Ingredient Reports Card */}
<Grid item xs={12} sm={6} md={4}>
  <Card sx={{ 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    background: 'linear-gradient(145deg, #fff, #f5ebe0)',
    border: '1px solid #e0d6c2',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)'
  }}>
    <CardHeader
      avatar={
        <Avatar sx={{ 
          bgcolor: 'transparent',
          color: '#d84315',
          border: '2px solid #d84315'
        }}>
          <Report />
        </Avatar>
      }
      title={
        <Typography variant="h6" sx={{ 
          color: '#5d4037',
          fontFamily: "'Roboto Condensed', sans-serif"
        }}>
          Low Ingredients
        </Typography>
      }
      subheader={
        <Typography variant="h4" component="div" sx={{ 
          mt: 1,
          color: '#3e2723',
          fontFamily: "'Playfair Display', serif"
        }}>
          {lowIngredientReports.length} active
        </Typography>
      }
    />
    <CardContent sx={{ flexGrow: 1 }}>
      {lowIngredientReports.length > 0 ? (
        <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
          {lowIngredientReports.slice(0, 3).map(report => (
            <ListItem 
              key={report.id}
              sx={{
                mb: 1,
                borderRadius: '8px',
                backgroundColor: report.level === 'very_low' ? 'rgba(216, 67, 21, 0.05)' : 'rgba(255, 167, 38, 0.05)',
                '&:hover': {
                  backgroundColor: report.level === 'very_low' ? 'rgba(216, 67, 21, 0.1)' : 'rgba(255, 167, 38, 0.1)'
                }
              }}
              secondaryAction={
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => handleResolveReport(report.id)}
                  sx={{
                    color: '#5d4037',
                    borderColor: '#a1887f',
                    '&:hover': {
                      bgcolor: 'rgba(141, 110, 99, 0.1)',
                      borderColor: '#8d6e63'
                    }
                  }}
                >
                  Resolve
                </Button>
              }
            >
              <ListItemText
                primary={
                  <Typography sx={{ color: '#3e2723' }}>
                    {report.ingredient}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="caption" display="block" sx={{ color: '#8d6e63' }}>
                      Reported by: {report.firstName}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: '#8d6e63' }}>
                      {report.timestamp ? format(report.timestamp, 'MMM dd, h:mm a') : 'Unknown time'}
                    </Typography>
                    <Chip 
                      label={report.level === 'very_low' ? 'Critical' : 'Low'} 
                      size="small" 
                      sx={{ 
                        mt: 0.5,
                        bgcolor: report.level === 'very_low' ? 'rgba(216, 67, 21, 0.1)' : 'rgba(255, 167, 38, 0.1)',
                        color: report.level === 'very_low' ? '#d84315' : '#ff8f00',
                        border: report.level === 'very_low' ? '1px solid #d84315' : '1px solid #ff8f00'
                      }}
                    />
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" sx={{ 
          color: '#8d6e63', 
          align: 'center',
          textAlign: 'center'
        }}>
          No active low ingredient reports
        </Typography>
      )}
    </CardContent>
    <CardActions sx={{ 
      mt: 'auto',
      borderTop: '1px solid #e0d6c2',
      pt: 1
    }}>
      <Button 
        size="small" 
        onClick={() => setShowLowIngredientDialog(true)}
        startIcon={<Add sx={{ color: '#8d6e63' }} />}
        sx={{
          color: '#5d4037',
          '&:hover': {
            bgcolor: 'rgba(141, 110, 99, 0.1)'
          }
        }}
      >
        Report Low Ingredient
      </Button>
      {lowIngredientReports.length > 0 && (
        <Button 
          size="small" 
          onClick={() => window.location.href = '/inventory'}
          startIcon={<Warehouse sx={{ color: '#8d6e63' }} />}
          sx={{
            color: '#5d4037',
            '&:hover': {
              bgcolor: 'rgba(141, 110, 99, 0.1)'
            }
          }}
        >
          View Inventory
        </Button>
      )}
    </CardActions>
  </Card>
</Grid>

    {/* Fourth Row - Operational Cards */}
<Grid container spacing={3} sx={{ mt: 0 }}>
  {/* Table Management Card */}
  <Grid item xs={12} sm={6} md={4}>
    <Card sx={{ 
      background: 'linear-gradient(145deg, #fff, #f5ebe0)',
      border: '1px solid #e0d6c2',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)'
    }}>
      <CardHeader
        avatar={
          <Avatar sx={{ 
            bgcolor: 'transparent',
            color: '#5d4037',
            border: '2px solid #a1887f'
          }}>
            <TableRestaurant />
          </Avatar>
        }
        title={
          <Typography variant="h6" sx={{ 
            color: '#5d4037',
            fontFamily: "'Roboto Condensed', sans-serif"
          }}>
            Bakery Nook Management
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: '#8d6e63' }}>
            {reservations.filter(r => r.date === format(new Date(), 'yyyy-MM-dd')).length} reservations today
          </Typography>
        }
      />
      <CardContent>
        <List dense>
          {reservations
            .filter(r => r.date === format(new Date(), 'yyyy-MM-dd'))
            .slice(0, 3)
            .map((res) => (
              <ListItem 
                key={res.id}
                sx={{
                  mb: 1,
                  borderRadius: '8px',
                  backgroundColor: '#efebe9',
                  '&:hover': {
                    backgroundColor: '#e0d6c2'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: '#d7ccc8',
                    color: '#5d4037'
                  }}>
                    <TableRestaurant />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography sx={{ color: '#3e2723' }}>
                      Coffee Nook {res.tableNumber}
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ color: '#8d6e63' }}>
                      {res.customerName} at {res.time}
                    </Typography>
                  }
                />
                <Chip 
                  label={res.status} 
                  size="small"
                  sx={{
                    bgcolor: res.status === 'Available' ? 'rgba(46, 125, 50, 0.1)' : 
                            res.status === 'Reserved' ? 'rgba(255, 167, 38, 0.1)' : 'rgba(198, 40, 40, 0.1)',
                    color: res.status === 'Available' ? '#2e7d32' : 
                           res.status === 'Reserved' ? '#ff8f00' : '#c62828',
                    border: res.status === 'Available' ? '1px solid #2e7d32' : 
                            res.status === 'Reserved' ? '1px solid #ff8f00' : '1px solid #c62828'
                  }}
                />
              </ListItem>
            ))}
        </List>
        <Button 
          variant="outlined"
          fullWidth
          sx={{ 
            mt: 2,
            color: '#5d4037',
            borderColor: '#a1887f',
            '&:hover': {
              bgcolor: 'rgba(141, 110, 99, 0.1)',
              borderColor: '#8d6e63'
            }
          }}
          onClick={() => setShowTableManagementDialog(true)}
          startIcon={<ViewList sx={{ color: '#8d6e63' }} />}
        >
          View All Sweet Spots
        </Button>
      </CardContent>
    </Card>
  </Grid>

  {/* Queue Monitoring Card */}
  <Grid item xs={12} sm={6} md={4}>
    <Card sx={{ 
      background: 'linear-gradient(145deg, #fff, #f5ebe0)',
      border: '1px solid #e0d6c2',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)'
    }}>
      <CardHeader
        avatar={
          <Badge 
            badgeContent={queueStatus.waiting} 
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: queueStatus.waiting > 5 ? '#d84315' : '#8d6e63',
                color: 'white'
              }
            }}
          >
            <Avatar sx={{ 
              bgcolor: queueStatus.waiting > 0 ? 'rgba(255, 167, 38, 0.1)' : 'rgba(46, 125, 50, 0.1)',
              color: queueStatus.waiting > 0 ? '#ff8f00' : '#2e7d32',
              border: queueStatus.waiting > 0 ? '2px solid #ff8f00' : '2px solid #2e7d32'
            }}>
              <Queue />
            </Avatar>
          </Badge>
        }
        title={
          <Typography variant="h6" sx={{ 
            color: '#5d4037',
            fontFamily: "'Roboto Condensed', sans-serif"
          }}>
            Order Queue
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: '#8d6e63' }}>
            Updated {format(new Date(), 'h:mm a')}
          </Typography>
        }
        action={
          <IconButton 
            onClick={() => setShowQueueDialog(true)}
            sx={{ color: '#8d6e63' }}
          >
            <Refresh />
          </IconButton>
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper elevation={0} sx={{ 
              p: 2, 
              textAlign: 'center', 
              backgroundColor: '#efebe9',
              borderRadius: '8px'
            }}>
              <Typography variant="h6" sx={{ color: '#8d6e63' }}>
                Waiting
              </Typography>
              <Typography variant="h4" sx={{ color: '#3e2723' }}>
                {queueStatus.waiting}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={0} sx={{ 
              p: 2, 
              textAlign: 'center', 
              backgroundColor: '#efebe9',
              borderRadius: '8px'
            }}>
              <Typography variant="h6" sx={{ color: '#8d6e63' }}>
                Avg. Wait
              </Typography>
              <Typography variant="h4" sx={{ color: '#3e2723' }}>
                {queueStatus.avgWaitTime}m
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <LinearProgress 
          variant="determinate" 
          value={Math.min(100, queueStatus.waiting * 10)} 
          sx={{ 
            height: 10, 
            borderRadius: 5, 
            mt: 2,
            bgcolor: queueStatus.waiting > 5 ? 'rgba(216, 67, 21, 0.1)' : 'rgba(46, 125, 50, 0.1)',
            '& .MuiLinearProgress-bar': {
              bgcolor: queueStatus.waiting > 5 ? '#d84315' : '#2e7d32'
            }
          }}
        />
        <Button 
          variant="outlined"
          fullWidth
          sx={{ 
            mt: 2,
            color: '#5d4037',
            borderColor: '#a1887f',
            '&:hover': {
              bgcolor: 'rgba(141, 110, 99, 0.1)',
              borderColor: '#8d6e63'
            }
          }}
          onClick={() => setShowQueueDialog(true)}
          disabled={queueStatus.waiting === 0}
          startIcon={<Queue sx={{ color: '#8d6e63' }} />}
        >
          View Queue Details
        </Button>
      </CardContent>
    </Card>
  </Grid>

  {/* Training Tracker Card */}
  <Grid item xs={12} sm={6} md={4}>
    <Card sx={{ 
      background: 'linear-gradient(145deg, #fff, #f5ebe0)',
      border: '1px solid #e0d6c2',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)'
    }}>
      <CardHeader
        avatar={
          <Avatar sx={{ 
            bgcolor: 'transparent',
            color: '#5d4037',
            border: '2px solid #a1887f'
          }}>
            <School />
          </Avatar>
        }
        title={
          <Typography variant="h6" sx={{ 
            color: '#5d4037',
            fontFamily: "'Roboto Condensed', sans-serif"
          }}>
            Staff Training
          </Typography>
        }
        subheader={
          <Box display="flex" alignItems="center">
            <LinearProgress 
              variant="determinate" 
              value={(trainingStatus.filter(t => t.completed).length / trainingStatus.length) * 100}
              sx={{ 
                width: '100%', 
                mr: 2, 
                height: 8,
                bgcolor: '#d7ccc8',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#8d6e63'
                }
              }}
            />
            <Typography variant="body2" sx={{ color: '#3e2723' }}>
              {trainingStatus.filter(t => t.completed).length}/{trainingStatus.length}
            </Typography>
          </Box>
        }
      />
      <CardContent>
        <List dense>
          {trainingStatus.slice(0, 3).map((training, index) => (
            <ListItem 
              key={index}
              sx={{
                mb: 1,
                borderRadius: '8px',
                backgroundColor: training.completed ? 'rgba(46, 125, 50, 0.05)' : 'rgba(198, 40, 40, 0.05)',
                '&:hover': {
                  backgroundColor: training.completed ? 'rgba(46, 125, 50, 0.1)' : 'rgba(198, 40, 40, 0.1)'
                }
              }}
            >
              <ListItemIcon>
                {training.completed ? 
                  <CheckCircle sx={{ color: '#2e7d32' }} /> : 
                  <Cancel sx={{ color: '#c62828' }} />}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ color: '#3e2723' }}>
                    {training.module}
                  </Typography>
                }
                secondary={
                  <Box component="span" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: '#8d6e63'
                  }}>
                    <Person fontSize="small" sx={{ mr: 0.5 }} />
                    {training.staffName}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
        <Button 
          variant="outlined"
          fullWidth
          sx={{ 
            mt: 1,
            color: '#5d4037',
            borderColor: '#a1887f',
            '&:hover': {
              bgcolor: 'rgba(141, 110, 99, 0.1)',
              borderColor: '#8d6e63'
            }
          }}
          onClick={() => setShowTrainingDialog(true)}
          startIcon={<List sx={{ color: '#8d6e63' }} />}
        >
          View All Training
        </Button>
      </CardContent>
    </Card>
  </Grid>
</Grid>

{/* Loyalty Rewards Card */}
<Grid item xs={12} md={6}>
  <Card sx={{ 
    background: 'linear-gradient(145deg, #fff, #f5ebe0)',
    border: '1px solid #e0d6c2',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)'
  }}>
    <CardHeader
      title={
        <Typography variant="h6" sx={{ 
          color: '#5d4037',
          fontFamily: "'Roboto Condensed', sans-serif"
        }}>
          Loyalty Rewards
        </Typography>
      }
      avatar={
        <Avatar sx={{ 
          bgcolor: 'transparent',
          color: '#5d4037',
          border: '2px solid #a1887f'
        }}>
          <CardGiftcard />
        </Avatar>
      }
      action={
        <Button 
          variant="outlined"
          size="small"
          onClick={() => setShowAddRewardDialog(true)}
          startIcon={<Add sx={{ color: '#8d6e63' }} />}
          sx={{
            color: '#5d4037',
            borderColor: '#a1887f',
            '&:hover': {
              bgcolor: 'rgba(141, 110, 99, 0.1)',
              borderColor: '#8d6e63'
            }
          }}
        >
          Add Reward
        </Button>
      }
    />
    <CardContent>
      {availableRewards.length > 0 ? (
        <List>
          {availableRewards.map(reward => (
            <ListItem 
              key={reward.id}
              sx={{
                mb: 1,
                borderRadius: '8px',
                backgroundColor: '#efebe9',
                '&:hover': {
                  backgroundColor: '#e0d6c2'
                }
              }}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  onClick={() => handleDeleteReward(reward.id)}
                  sx={{ color: '#d84315' }}
                >
                  <Delete />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ 
                  bgcolor: '#d7ccc8',
                  color: '#5d4037'
                }}>
                  <CardGiftcard />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography sx={{ color: '#3e2723' }}>
                    {reward.name}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" sx={{ color: '#5d4037' }}>
                      {reward.description}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#5d4037' }}>
                      Cost: {reward.pointsRequired} points
                    </Typography>
                    <Chip 
                      label={reward.active ? 'Active' : 'Inactive'} 
                      size="small" 
                      sx={{ 
                        mt: 0.5,
                        bgcolor: reward.active ? 'rgba(46, 125, 50, 0.1)' : 'rgba(198, 40, 40, 0.1)',
                        color: reward.active ? '#2e7d32' : '#c62828',
                        border: reward.active ? '1px solid #2e7d32' : '1px solid #c62828'
                      }}
                    />
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" sx={{ 
          color: '#8d6e63', 
          align: 'center',
          textAlign: 'center'
        }}>
          No rewards available
        </Typography>
      )}
    </CardContent>
  </Card>
</Grid>

{/* Fifth Row - Staff Management */}
<Grid container spacing={3} sx={{ mt: 0 }}>
  {/* Shift Management Card */}
  <Grid item xs={12} md={6}>
    <Card sx={{ 
      background: 'linear-gradient(145deg, #fff, #f5ebe0)',
      border: '1px solid #e0d6c2',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)'
    }}>
      <CardHeader
        avatar={
          <Avatar sx={{ 
            bgcolor: 'transparent',
            color: '#5d4037',
            border: '2px solid #a1887f'
          }}>
            <Schedule />
          </Avatar>
        }
        title={
          <Typography variant="h6" sx={{ 
            color: '#5d4037',
            fontFamily: "'Roboto Condensed', sans-serif"
          }}>
            Staff Shifts
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: '#8d6e63' }}>
            {upcomingShifts.length} upcoming shifts
          </Typography>
        }
      />
      <CardContent>
  <Button 
    variant="outlined"
    fullWidth 
    onClick={() => setShowShiftAssignmentDialog(true)}
    sx={{ 
      mb: 2,
      color: '#5d4037',
      borderColor: '#a1887f',
      '&:hover': {
        bgcolor: 'rgba(141, 110, 99, 0.1)',
        borderColor: '#8d6e63'
      }
    }}
    startIcon={<Add sx={{ color: '#8d6e63' }} />}
  >
    Assign New Shift
  </Button>
  
  <List dense>
    {upcomingShifts.slice(0, 5).map(shift => (
      <ListItem 
        key={shift.id}
        sx={{
          mb: 1,
          borderRadius: '8px',
          backgroundColor: '#efebe9',
          '&:hover': {
            backgroundColor: '#e0d6c2'
          }
        }}
      >
        <ListItemAvatar>
          <Avatar sx={{ 
            bgcolor: '#d7ccc8',
            color: '#5d4037',
            width: 32, 
            height: 32
          }}>
            {shift.userName?.charAt(0)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography sx={{ color: '#3e2723' }}>
              {shift.userName}
            </Typography>
          }
          secondary={
            <Box component="span" sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: '#8d6e63'
            }}>
              <CalendarToday fontSize="small" sx={{ mr: 0.5 }} />
              {format(new Date(shift.date), 'MMM dd')} • 
              <AccessTime fontSize="small" sx={{ mx: 0.5 }} />
              {shift.scheduledStart} - {shift.scheduledEnd}
              <Chip 
                label={shift.role} 
                size="small" 
                sx={{ 
                  ml: 1,
                  bgcolor: 'rgba(141, 110, 99, 0.1)',
                  color: '#5d4037',
                  border: '1px solid #a1887f'
                }}
              />
            </Box>
          }
        />
      </ListItem>
    ))}
  </List>
</CardContent>
      <CardActions sx={{ 
        borderTop: '1px solid #e0d6c2',
        pt: 1
      }}>
        <Button 
          size="small" 
          onClick={() => setShowAllShiftsDialog(true)}
          startIcon={<List sx={{ color: '#8d6e63' }} />}
          sx={{
            color: '#5d4037',
            '&:hover': {
              bgcolor: 'rgba(141, 110, 99, 0.1)'
            }
          }}
        >
          View All Shifts
        </Button>
      </CardActions>
    </Card>
  </Grid>

  {/* Staff Performance Card */}
  <Grid item xs={12} md={6}>
    <Card sx={{ 
      background: 'linear-gradient(145deg, #fff, #f5ebe0)',
      border: '1px solid #e0d6c2',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)'
    }}>
      <CardHeader
        title={
          <Typography variant="h6" sx={{ 
            color: '#5d4037',
            fontFamily: "'Roboto Condensed', sans-serif"
          }}>
            Staff Performance
          </Typography>
        }
        avatar={
          <Avatar sx={{ 
            bgcolor: 'transparent',
            color: '#5d4037',
            border: '2px solid #a1887f'
          }}>
            <Star />
          </Avatar>
        }
        action={
          <Tooltip title="Refresh performance data">
            <IconButton sx={{ color: '#8d6e63' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{
                '& th': {
                  backgroundColor: '#efebe9',
                  fontFamily: "'Roboto Condensed', sans-serif",
                  color: '#5d4037',
                  fontWeight: 600
                }
              }}>
                <TableCell>Barista</TableCell>
                <TableCell align="right">Orders</TableCell>
                <TableCell align="right">Sales</TableCell>
                <TableCell align="right">Efficiency</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffMembers.map(staff => {
                const staffSales = salesData.filter(o => o.createdBy === staff.id);
                const efficiency = Math.min(100, staffSales.length * 5);
                
                return (
                  <TableRow 
                    key={staff.id} 
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(141, 110, 99, 0.05)'
                      }
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1,
                            bgcolor: efficiency > 75 ? 'rgba(46, 125, 50, 0.1)' : 
                                     efficiency > 50 ? 'rgba(255, 167, 38, 0.1)' : 'rgba(198, 40, 40, 0.1)',
                            color: efficiency > 75 ? '#2e7d32' : 
                                   efficiency > 50 ? '#ff8f00' : '#c62828',
                            border: efficiency > 75 ? '1px solid #2e7d32' : 
                                   efficiency > 50 ? '1px solid #ff8f00' : '1px solid #c62828'
                          }}
                        >
                          {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0)}
                        </Avatar>
                        <Typography sx={{ color: '#3e2723' }}>
                          {staff.firstName} {staff.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#3e2723' }}>
                      {staffSales.length}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#3e2723' }}>
                      K{staffSales.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" alignItems="center">
                        <LinearProgress 
                          variant="determinate" 
                          value={efficiency} 
                          sx={{ 
                            width: '100%', 
                            mr: 1,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: efficiency > 75 ? 'rgba(46, 125, 50, 0.1)' : 
                                            efficiency > 50 ? 'rgba(255, 167, 38, 0.1)' : 'rgba(198, 40, 40, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: efficiency > 75 ? '#2e7d32' : 
                                      efficiency > 50 ? '#ff8f00' : '#c62828'
                            }
                          }}
                        />
                        <Typography sx={{ color: '#3e2723' }}>
                          {efficiency}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <ButtonGroup size="small">
                        <Button 
  onClick={() => handleUpdateStaffRole(staff.id, 'baker')}
  startIcon={<BakeryDining sx={{ color: '#8d6e63' }} />}  // Using BakeryDining icon
  sx={{
    color: '#5d4037',
    borderColor: '#a1887f',
    '&:hover': {
      bgcolor: 'rgba(141, 110, 99, 0.1)',
      borderColor: '#8d6e63'
    }
  }}
>
  Pastry Chef
</Button>
                        <Button 
                          onClick={() => handleUpdateStaffRole(staff.id, 'cashier')}
                          startIcon={<PointOfSale sx={{ color: '#8d6e63' }} />}
                          sx={{
                            color: '#5d4037',
                            borderColor: '#a1887f',
                            '&:hover': {
                              bgcolor: 'rgba(141, 110, 99, 0.1)',
                              borderColor: '#8d6e63'
                            }
                          }}
                        >
                          Cashier
                        </Button>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  </Grid>
</Grid>

    {/* All Memos Dialog */}
<Dialog 
  open={showAllMemosDialog} 
  onClose={() => setShowAllMemosDialog(false)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>
    <Box display="flex" alignItems="center">
      <Note color="primary" sx={{ mr: 1 }} />
      <Typography>All Internal Memos</Typography>
    </Box>
  </DialogTitle>
  <DialogContent>
    {internalMemos.length > 0 ? (
      <List>
        {internalMemos.slice(0, 3).map(memo => {
  // Extract first name from postedBy
  let firstName = memo.postedBy;
  if (memo.postedBy.includes(' ')) {
    firstName = memo.postedBy.split(' ')[0];
  } else if (memo.postedBy.includes('@')) {
    firstName = memo.postedBy.split('@')[0];
  }

  return (
    <ListItem 
      key={memo.id} 
      alignItems="flex-start"
      sx={{
        mb: 1,
        backgroundColor: 'rgba(255,243,224,0.5)',
        borderRadius: 1
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'warning.light', width: 32, height: 32 }}>
          <Note fontSize="small" />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography fontWeight="bold" color="warning.dark">
            Manager Memo: {memo.title}
          </Typography>
        }
        secondary={
          <>
            <Typography
              component="span"
              variant="body2"
              color="text.primary"
              sx={{ display: 'block', mb: 1 }}
            >
              {memo.timestamp instanceof Date && !isNaN(memo.timestamp) ? 
                format(memo.timestamp, 'MMM dd, yyyy HH:mm') : 
                'Date not available'} • {firstName}
            </Typography>
            {memo.content}
          </>
        }
      />
    </ListItem>
  );
})}
      </List>
    ) : (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        p: 3
      }}>
        <Note sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          No memos available
        </Typography>
      </Box>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowAllMemosDialog(false)}>Close</Button>
  </DialogActions>
</Dialog>

{/* Low Ingredient Dialog */}
<Dialog 
  open={showLowIngredientDialog} 
  onClose={() => setShowLowIngredientDialog(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>
    <Box display="flex" alignItems="center">
      <Report color="error" sx={{ mr: 1 }} />
      <Typography>Report Low Ingredient</Typography>
    </Box>
  </DialogTitle>
  <DialogContent>
    <TextField
      select
      fullWidth
      label="Ingredient"
      value={ingredient}
      onChange={(e) => setIngredient(e.target.value)}
      sx={{ mt: 2 }}
    >
      <MenuItem value="espresso">Espresso Beans</MenuItem>
      <MenuItem value="milk">Milk</MenuItem>
      <MenuItem value="oat_milk">Oat Milk</MenuItem>
      <MenuItem value="almond_milk">Almond Milk</MenuItem>
      <MenuItem value="sugar">Sugar</MenuItem>
      <MenuItem value="vanilla_syrup">Vanilla Syrup</MenuItem>
      <MenuItem value="caramel_syrup">Caramel Syrup</MenuItem>
      <MenuItem value="chocolate_syrup">Chocolate Syrup</MenuItem>
      <MenuItem value="cups">Cups</MenuItem>
      <MenuItem value="lids">Lids</MenuItem>
      <MenuItem value="straws">Straws</MenuItem>
      <MenuItem value="napkins">Napkins</MenuItem>
      <MenuItem value="pastries">Pastries</MenuItem>
      <MenuItem value="sandwiches">Sandwiches</MenuItem>
      <MenuItem value="other">Other</MenuItem>
    </TextField>
    
    {ingredient === 'other' && (
      <TextField
        margin="dense"
        label="Specify Ingredient"
        fullWidth
        value={ingredient}
        onChange={(e) => setIngredient(e.target.value)}
        sx={{ mt: 1 }}
      />
    )}
    
    <TextField
      select
      fullWidth
      label="Level"
      value={ingredientLevel}
      onChange={(e) => setIngredientLevel(e.target.value)}
      sx={{ mt: 2 }}
    >
      <MenuItem value="low">Running Low (25-50% remaining)</MenuItem>
      <MenuItem value="very_low">Very Low (10-25% remaining)</MenuItem>
      <MenuItem value="critical">Critical (Less than 10% remaining)</MenuItem>
      <MenuItem value="out">Out of Stock (0% remaining)</MenuItem>
    </TextField>
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setShowLowIngredientDialog(false)}
      startIcon={<Close />}
    >
      Cancel
    </Button>
    <Button 
      onClick={handleReportLowIngredient}
      variant="contained"
      color="error"
      startIcon={<Check />}
      disabled={!ingredient}
    >
      Report
    </Button>
  </DialogActions>
</Dialog>


  

{/* Table Management Dialog */}
<Dialog 
  open={showTableManagementDialog} 
  onClose={() => setShowTableManagementDialog(false)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>Table Management</DialogTitle>
  <DialogContent>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Table #</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Reservation</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reservations.map((res) => (
            <TableRow key={res.id}>
              <TableCell>{res.tableNumber}</TableCell>
              <TableCell>
                <Chip 
                  label={res.status} 
                  color={
                    res.status === 'Available' ? 'success' : 
                    res.status === 'Reserved' ? 'warning' : 'error'
                  } 
                />
              </TableCell>
              <TableCell>
                {res.customerName || 'Walk-in'}
                {res.partySize && ` (${res.partySize})`}
              </TableCell>
              <TableCell>{res.time}</TableCell>
              <TableCell>
                <Button 
                  size="small"
                  onClick={() => {
                    setSelectedReservation(res);
                    setShowManageReservationDialog(true);
                  }}
                >
                  Manage
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowTableManagementDialog(false)}>Close</Button>
    <Button 
      variant="contained"
      onClick={() => setShowReservationDialog(true)}
    >
      Add Reservation
    </Button>
  </DialogActions>
</Dialog>

{/* Manage Reservation Dialog */}
<Dialog
  open={showManageReservationDialog}
  onClose={() => setShowManageReservationDialog(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>
    Manage Reservation for Table {selectedReservation?.tableNumber}
  </DialogTitle>
  <DialogContent>
    {selectedReservation && (
      <>
        <TextField
          margin="dense"
          label="Customer Name"
          fullWidth
          value={selectedReservation.customerName}
          onChange={(e) => setSelectedReservation({
            ...selectedReservation,
            customerName: e.target.value
          })}
        />
        <TextField
          margin="dense"
          label="Party Size"
          type="number"
          fullWidth
          value={selectedReservation.partySize}
          onChange={(e) => setSelectedReservation({
            ...selectedReservation,
            partySize: e.target.value
          })}
        />
        <TextField
          margin="dense"
          label="Date"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={selectedReservation.date}
          onChange={(e) => setSelectedReservation({
            ...selectedReservation,
            date: e.target.value
          })}
        />
        <TextField
          margin="dense"
          label="Time"
          type="time"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={selectedReservation.time}
          onChange={(e) => setSelectedReservation({
            ...selectedReservation,
            time: e.target.value
          })}
        />
        <TextField
          select
          margin="dense"
          label="Status"
          fullWidth
          value={selectedReservation.status}
          onChange={(e) => setSelectedReservation({
            ...selectedReservation,
            status: e.target.value
          })}
        >
          <MenuItem value="Reserved">Reserved</MenuItem>
          <MenuItem value="Seated">Seated</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Cancelled">Cancelled</MenuItem>
        </TextField>
      </>
    )}
  </DialogContent>
  <DialogActions>
    <Button 
      color="error"
      onClick={async () => {
        try {
          await deleteDoc(doc(db, 'reservations', selectedReservation.id));
          showSnackbar('Reservation deleted!', 'success');
          setShowManageReservationDialog(false);
        } catch (error) {
          console.error('Error deleting reservation:', error);
          showSnackbar('Failed to delete reservation', 'error');
        }
      }}
    >
      Delete
    </Button>
    <Button onClick={() => setShowManageReservationDialog(false)}>
      Cancel
    </Button>
    <Button 
      variant="contained"
      onClick={async () => {
        try {
          await updateDoc(doc(db, 'reservations', selectedReservation.id), {
            ...selectedReservation,
            updatedAt: serverTimestamp()
          });
          showSnackbar('Reservation updated!', 'success');
          setShowManageReservationDialog(false);
        } catch (error) {
          console.error('Error updating reservation:', error);
          showSnackbar('Failed to update reservation', 'error');
        }
      }}
    >
      Save Changes
    </Button>
  </DialogActions>
</Dialog>

{/* Add Reservation Dialog */}
<Dialog 
  open={showReservationDialog} 
  onClose={() => setShowReservationDialog(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>Add New Reservation</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Customer Name"
      fullWidth
      value={newReservation.customerName}
      onChange={(e) => setNewReservation({...newReservation, customerName: e.target.value})}
    />
    <TextField
      margin="dense"
      label="Party Size"
      type="number"
      fullWidth
      value={newReservation.partySize}
      onChange={(e) => setNewReservation({...newReservation, partySize: e.target.value})}
    />
    <TextField
      margin="dense"
      label="Date"
      type="date"
      fullWidth
      InputLabelProps={{ shrink: true }}
      value={newReservation.date}
      onChange={(e) => setNewReservation({...newReservation, date: e.target.value})}
    />
    <TextField
      margin="dense"
      label="Time"
      type="time"
      fullWidth
      InputLabelProps={{ shrink: true }}
      value={newReservation.time}
      onChange={(e) => setNewReservation({...newReservation, time: e.target.value})}
    />
    <TextField
      margin="dense"
      label="Table Number"
      type="number"
      fullWidth
      value={newReservation.tableNumber}
      onChange={(e) => setNewReservation({...newReservation, tableNumber: e.target.value})}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowReservationDialog(false)}>Cancel</Button>
    <Button 
      variant="contained"
      onClick={() => {
        addDoc(collection(db, 'reservations'), {
          ...newReservation,
          status: 'Reserved',
          createdAt: serverTimestamp()
        })
        .then(() => {
          showSnackbar('Reservation added!', 'success');
          setShowReservationDialog(false);
          setNewReservation({
            customerName: '',
            partySize: 2,
            date: format(new Date(), 'yyyy-MM-dd'),
            time: '18:00',
            tableNumber: reservations.length + 1
          });
        })
        .catch(error => {
          console.error('Error adding reservation:', error);
          showSnackbar('Failed to add reservation', 'error');
        });
      }}
    >
      Add Reservation
    </Button>
  </DialogActions>
</Dialog>

{/* All Customer Feedback Dialog */}
<Dialog 
  open={showAllFeedbackDialog} 
  onClose={() => setShowAllFeedbackDialog(false)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>
    <Box display="flex" alignItems="center">
      <Forum color="primary" sx={{ mr: 1 }} />
      <Typography>All Customer Feedback</Typography>
    </Box>
  </DialogTitle>
  <DialogContent>
    {customerFeedback.length > 0 ? (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rating</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Staff</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customerFeedback.map(feedback => (
              <TableRow key={feedback.id}>
                <TableCell>
                  <Rating 
                    value={feedback.rating} 
                    readOnly 
                    size="small"
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: feedback.rating < 3 ? '#d84315' : '#5d4037'
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  {feedback.customerName || 'Anonymous'}
                  {feedback.cardNumber && (
                    <Typography variant="caption" display="block">
                      Card: {feedback.cardNumber}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {feedback.comment || 'No comment'}
                </TableCell>
                <TableCell>
                  {feedback.staffFirstName || 'Unknown'}
                </TableCell>
                <TableCell>
                  {feedback.timestamp ? 
                    (feedback.timestamp.toDate ? 
                      format(feedback.timestamp.toDate(), 'MMM dd, yyyy HH:mm') : 
                      format(new Date(feedback.timestamp), 'MMM dd, yyyy HH:mm')) : 
                    'Unknown date'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Typography variant="body2" color="text.secondary" align="center" sx={{ p: 3 }}>
        No feedback received yet
      </Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setShowAllFeedbackDialog(false)}
      sx={{ color: '#5d4037' }}
    >
      Close
    </Button>
    <Button 
      onClick={() => {
        navigator.clipboard.writeText(
          customerFeedback.map(fb => 
            `Rating: ${fb.rating}, Customer: ${fb.customerName || 'Anonymous'}, Comment: ${fb.comment || 'None'}, Date: ${fb.timestamp 
  ? format(
      fb.timestamp instanceof Date 
        ? fb.timestamp 
        : fb.timestamp.toDate(), 
      'MMM dd, yyyy HH:mm'
    )
  : 'Unknown'
? format(fb.timestamp.toDate(), 'MMM dd, yyyy HH:mm') : 'Unknown'}`
          ).join('\n')
        );
        showSnackbar('Feedback copied to clipboard!', 'success');
      }}
      sx={{ color: '#5d4037' }}
    >
      Copy Data
    </Button>
  </DialogActions>
</Dialog>


{/* Queue Dialog - Updated to handle multiple orders */}
<Dialog 
  open={showQueueDialog} 
  onClose={() => setShowQueueDialog(false)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>
    <Box display="flex" alignItems="center">
      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
        <ListAlt />
      </Avatar>
      Order Queue Management
    </Box>
  </DialogTitle>
  <DialogContent dividers>
    {/* Current Processing Section */}
    {currentOrder ? (
      <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: '#e8f5e9' }}>
        <Typography variant="h6" gutterBottom>
          Currently Processing:
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography>
  Order #{currentOrder.orderNumber}
</Typography>
            <Typography>
              Customer: {currentOrder.customerName || 'Walk-in'}
            </Typography>
            <Typography>
              Total: K{currentOrder.total?.toFixed(2) || '0.00'}
            </Typography>
            <Typography>
              Items: {currentOrder.items?.length || 0}
            </Typography>
            <Typography>
              Waiting Time: {Math.floor((new Date() - (currentOrder.createdAt instanceof Date ? currentOrder.createdAt : new Date(currentOrder.createdAt))) / (1000 * 60))} minutes
            </Typography>
          </Box>
          <Button 
  variant="contained" 
  color="success" 
  sx={{ height: 'fit-content' }}
  onClick={async () => {
    await completeCurrentOrder();
    // Refresh queue after completion
    const q = query(
      collection(db, 'queue'),
      where('status', 'in', ['waiting', 'in-progress']),
      orderBy('status'),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    const queueData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      selected: false
    }));
    setQueue(queueData.filter(order => order.status === 'waiting'));
  }}
>
  Complete Order
</Button>
        </Box>
      </Paper>
    ) : (
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h6">
          No order currently being processed
        </Typography>
        {queue.length > 0 && (
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => {
              const nextOrder = queue[0];
              processNextOrder(nextOrder.id);
            }}
          >
            Start Processing Next Order
          </Button>
        )}
      </Box>
    )}

    {/* Waiting Orders Section */}
    <Typography variant="h6" gutterBottom>
      Waiting Orders ({queue.length})
    </Typography>
    
    {queue.length > 0 ? (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    queue.filter(order => order.selected).length > 0 &&
                    queue.filter(order => order.selected).length < queue.length
                  }
                  checked={queue.length > 0 && queue.filter(order => order.selected).length === queue.length}
                  onChange={(e) => {
                    const updatedQueue = queue.map(order => ({
                      ...order,
                      selected: e.target.checked
                    }));
                    setQueue(updatedQueue);
                  }}
                />
              </TableCell>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Wait Time</TableCell>
              <TableCell align="right">Items</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {queue.map((order, index) => (
              <TableRow key={order.id} selected={order.selected}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={order.selected || false}
                    onChange={(e) => {
                      const updatedQueue = [...queue];
                      updatedQueue[index].selected = e.target.checked;
                      setQueue(updatedQueue);
                    }}
                  />
                </TableCell>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.customerName || 'Walk-in'}</TableCell>
                <TableCell align="right">K{order.total?.toFixed(2) || '0.00'}</TableCell>
                <TableCell align="right">
                  {Math.floor((new Date() - (order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt))) / (1000 * 60))} min
                </TableCell>
                <TableCell align="right">{order.items?.length || 0}</TableCell>
                <TableCell align="right">
                  <ButtonGroup size="small">
                    {!currentOrder && (
                      <Button 
                        variant="contained"
                        onClick={() => processNextOrder(order.id)}
                      >
                        Process
                      </Button>
                    )}
                    <Button 
                      variant="outlined"
                      onClick={async () => {
                        try {
                          // Remove from queue
                          await deleteDoc(doc(db, 'queue', order.id));
                          // Update order status back to pending
                          await updateDoc(doc(db, 'orders', order.orderId), {
                            status: 'pending'
                          });
                          showSnackbar('Order removed from queue', 'success');
                        } catch (error) {
                          console.error('Error removing order:', error);
                          showSnackbar('Failed to remove order', 'error');
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No orders currently waiting in queue
        </Typography>
      </Box>
    )}
  </DialogContent>
  <DialogActions>
    <Box display="flex" justifyContent="space-between" width="100%">
      <Box>
        {queue.filter(order => order.selected).length > 0 && (
          <Button 
            variant="contained"
            color="primary"
            onClick={() => {
              const selectedOrders = queue.filter(order => order.selected);
              if (selectedOrders.length > 0) {
                // Process all selected orders
                const batch = writeBatch(db);
                
                selectedOrders.forEach(order => {
                  // Update order status
                  const orderRef = doc(db, 'orders', order.orderId);
                  batch.update(orderRef, {
                    status: 'in-progress',
                    startedAt: serverTimestamp(),
                    assignedTo: user.uid,
                    assignedToName: user.displayName || user.email
                  });
                  
                  // Update queue status
                  const queueRef = doc(db, 'queue', order.id);
                  batch.update(queueRef, {
                    status: 'in-progress',
                    processedAt: serverTimestamp(),
                    processedBy: user.uid
                  });
                });
                
                batch.commit().then(() => {
                  // Set the first selected order as current
                  setCurrentOrder({
                    ...selectedOrders[0],
                    id: selectedOrders[0].id
                  });
                  showSnackbar(`Processing ${selectedOrders.length} orders`, 'success');
                }).catch(error => {
                  console.error('Error processing orders:', error);
                  showSnackbar('Failed to process orders', 'error');
                });
              }
            }}
            disabled={!!currentOrder}
          >
            Process Selected ({queue.filter(order => order.selected).length})
          </Button>
        )}
      </Box>
      <Box>
        <Button onClick={() => setShowQueueDialog(false)}>Close</Button>
        <Button 
          variant="contained"
          onClick={() => {
            // Refresh queue data
            const q = query(
              collection(db, 'queue'),
              where('status', 'in', ['waiting', 'in-progress']),
              orderBy('status'),
              orderBy('createdAt', 'asc')
            );
            getDocs(q).then(snapshot => {
              const queueData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                selected: false
              }));
              
              // Set current order if any order is in-progress
              const inProgressOrder = queueData.find(order => order.status === 'in-progress');
              if (inProgressOrder) {
                setCurrentOrder(inProgressOrder);
              }
              
              // Set queue to waiting orders only
              setQueue(queueData.filter(order => order.status === 'waiting'));
              updateQueueStatus(queueData);
              showSnackbar('Queue refreshed!', 'success');
            });
          }}
        >
          Refresh Queue
        </Button>
      </Box>
    </Box>
  </DialogActions>
</Dialog>

{/* Training Tracker Dialog - Updated with proper assignment */}
<Dialog 
  open={showTrainingDialog} 
  onClose={() => setShowTrainingDialog(false)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>Training Progress</DialogTitle>
  <DialogContent>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Staff Member</TableCell>
            <TableCell>Module</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Completed</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trainingStatus.map((training, index) => (
            <TableRow key={index}>
              <TableCell>{training.staffName}</TableCell>
              <TableCell>{training.module}</TableCell>
              <TableCell>
                <Chip 
                  label={training.completed ? 'Completed' : 'Pending'} 
                  color={training.completed ? 'success' : 'warning'} 
                />
              </TableCell>
              <TableCell>
                {training.completedAt ? 
                  format(new Date(training.completedAt), 'MMM dd, yyyy') : 
                  'Not completed'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowTrainingDialog(false)}>Close</Button>
    <Button 
      variant="contained"
      onClick={() => {
        // This is just a placeholder - you'll need to implement a proper staff selection
        showSnackbar('Please select staff from the staff management page to assign training', 'info');
      }}
    >
      Assign Training
    </Button>
  </DialogActions>
</Dialog>

      {/* Staff Management Dialog */}
      <Dialog 
        open={showStaffManagement} 
        onClose={() => setShowStaffManagement(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Manage Staff</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffMembers.map(staff => (
                  <TableRow key={staff.id}>
                    <TableCell>{staff.firstName} {staff.lastName}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>
                      <Select
                        value={staff.role}
                        onChange={(e) => handleUpdateStaffRole(staff.id, e.target.value)}
                        size="small"
                      >
                        <MenuItem value="barista">Barista</MenuItem>
                        <MenuItem value="cashier">Cashier</MenuItem>
                        <MenuItem value="shift-lead">Shift Lead</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        color="error"
                        onClick={() => handleDeactivateStaff(staff.id)}
                      >
                        Deactivate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStaffManagement(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
  open={showAllShiftsDialog} 
  onClose={() => setShowAllShiftsDialog(false)}
  fullWidth
  maxWidth="lg"
>
  <DialogTitle>All Shifts</DialogTitle>
  <DialogContent>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Staff</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Scheduled</TableCell>
            <TableCell>Clock In</TableCell>
            <TableCell>Clock Out</TableCell>
            <TableCell>Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allShifts.map(shift => (
            <TableRow key={shift.id}>
              <TableCell>{shift.userName || shift.userEmail}</TableCell>
              <TableCell>{format(new Date(shift.date), 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                {shift.scheduledStart} - {shift.scheduledEnd}
              </TableCell>
              <TableCell>
                {shift.clockIn ? format(shift.clockIn, 'hh:mm a') : 'Not clocked in'}
              </TableCell>
              <TableCell>
                {shift.clockOut ? format(shift.clockOut, 'hh:mm a') : 'Not clocked out'}
              </TableCell>
              <TableCell>{shift.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowAllShiftsDialog(false)}>Close</Button>
  </DialogActions>
</Dialog>

<Dialog 
  open={showAddRewardDialog} 
  onClose={() => setShowAddRewardDialog(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>Add New Loyalty Reward</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Reward Name"
      fullWidth
      value={newReward.name}
      onChange={(e) => setNewReward({...newReward, name: e.target.value})}
    />
    <TextField
      margin="dense"
      label="Description"
      fullWidth
      multiline
      rows={3}
      value={newReward.description}
      onChange={(e) => setNewReward({...newReward, description: e.target.value})}
    />
    <TextField
      margin="dense"
      label="Points Required"
      type="number"
      fullWidth
      value={newReward.pointsRequired}
      onChange={(e) => setNewReward({...newReward, pointsRequired: parseInt(e.target.value) || 0})}
    />
    <FormControlLabel
      control={
        <Checkbox 
          checked={newReward.active}
          onChange={(e) => setNewReward({...newReward, active: e.target.checked})}
        />
      }
      label="Active Reward"
      sx={{ mt: 1 }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowAddRewardDialog(false)}>Cancel</Button>
    <Button 
      onClick={handleAddReward}
      variant="contained"
      disabled={!newReward.name || !newReward.description}
    >
      Add Reward
    </Button>
  </DialogActions>
</Dialog>

<Dialog 
  open={showAddMemoDialog} 
  onClose={() => setShowAddMemoDialog(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>Add New Memo</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Title"
      fullWidth
      value={newMemo.title}
      onChange={(e) => setNewMemo({...newMemo, title: e.target.value})}
    />
    <TextField
      margin="dense"
      label="Content"
      fullWidth
      multiline
      rows={4}
      value={newMemo.content}
      onChange={(e) => setNewMemo({...newMemo, content: e.target.value})}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowAddMemoDialog(false)}>Cancel</Button>
    <Button 
      onClick={handleAddMemo}
      variant="contained"
      disabled={!newMemo.title || !newMemo.content}
    >
      Add Memo
    </Button>
  </DialogActions>
</Dialog>

<Dialog 
  open={showAttendanceDialog} 
  onClose={() => setShowAttendanceDialog(false)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>Today's Attendance</DialogTitle>
  <DialogContent>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Staff Member</TableCell>
            <TableCell>Clock In</TableCell>
            <TableCell>Clock Out</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attendanceLogs.map(log => (
            <TableRow key={log.id}>
              <TableCell>{log.userName || log.userEmail}</TableCell>
              <TableCell>
                {log.clockIn ? format(log.clockIn, 'HH:mm') : 'Not clocked in'}
              </TableCell>
              <TableCell>
                {log.clockOut ? format(log.clockOut, 'HH:mm') : 'Not clocked out'}
              </TableCell>
              <TableCell>
                <Chip 
                  label={log.clockIn && !log.clockOut ? 'Working' : 'Completed'} 
                  color={log.clockIn && !log.clockOut ? 'primary' : 'success'} 
                />
              </TableCell>
              <TableCell>
                {log.clockIn && !log.clockOut && (
                  <Button size="small">Approve</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowAttendanceDialog(false)}>Close</Button>
  </DialogActions>
</Dialog>

      {/* Inventory Management Dialog */}
      <Dialog 
        open={showInventoryDialog} 
        onClose={() => setShowInventoryDialog(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Inventory Management</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Current Stock</TableCell>
                  <TableCell align="right">Restock Level</TableCell>
                  <TableCell align="center">Restock</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.stock}</TableCell>
                    <TableCell align="right">{item.restockLevel || 10}</TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        size="small"
                        defaultValue="10"
                        sx={{ width: 80, mr: 1 }}
                      />
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => handleRestockInventory(item.id, 10)}
                      >
                        Add
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={item.stock < (item.restockLevel || 10) ? 'Low Stock' : 'In Stock'} 
                        color={item.stock < (item.restockLevel || 10) ? 'error' : 'success'} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInventoryDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              // Bulk restock all low inventory items
              inventoryItems
                .filter(item => item.stock < (item.restockLevel || 10))
                .forEach(item => handleRestockInventory(item.id, 20));
              setShowInventoryDialog(false);
            }}
          >
            Restock All Low Items
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shift Assignment Dialog */}
<Dialog 
  open={showShiftAssignmentDialog} 
  onClose={() => setShowShiftAssignmentDialog(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>Assign New Shift</DialogTitle>
  <DialogContent>
    <TextField
      select
      fullWidth
      label="Staff Member"
      value={newShift.staffId}
      onChange={(e) => setNewShift({...newShift, staffId: e.target.value})}
      sx={{ mt: 2 }}
    >
      {allStaff.map(staff => (
        <MenuItem key={staff.id} value={staff.id}>
          {staff.firstName} {staff.lastName} ({staff.role})
        </MenuItem>
      ))}
    </TextField>
    
    <TextField
      fullWidth
      label="Date"
      type="date"
      value={newShift.date}
      onChange={(e) => setNewShift({...newShift, date: e.target.value})}
      sx={{ mt: 2 }}
      InputLabelProps={{
        shrink: true,
      }}
    />
    
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Start Time"
          type="time"
          value={newShift.startTime}
          onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="End Time"
          type="time"
          value={newShift.endTime}
          onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
    </Grid>
    
    <TextField
      select
      fullWidth
      label="Role"
      value={newShift.role}
      onChange={(e) => setNewShift({...newShift, role: e.target.value})}
      sx={{ mt: 2 }}
    >
      <MenuItem value="barista">Barista</MenuItem>
      <MenuItem value="cashier">Cashier</MenuItem>
      <MenuItem value="shift-lead">Shift Lead</MenuItem>
    </TextField>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowShiftAssignmentDialog(false)}>Cancel</Button>
    <Button 
      onClick={handleAssignShift}
      variant="contained"
      disabled={!newShift.staffId}
    >
      Assign Shift
    </Button>
  </DialogActions>
</Dialog>

      {/* Sales Report Dialog */}
      <Dialog 
        open={showSalesReportDialog} 
        onClose={() => setShowSalesReportDialog(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Sales Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Today's Summary
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Total Sales" secondary={`K${salesData.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Number of Orders" secondary={salesData.length} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Average Order Value" secondary={`K${(salesData.reduce((sum, order) => sum + (order.total || 0), 0) / (salesData.length || 1)).toFixed(2)}`} />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Top Selling Items
              </Typography>
              <List>
                {getTopSellingItems(salesData).map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`${index + 1}. ${item.name}`} secondary={`${item.quantity} sold - K${item.total.toFixed(2)}`} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Staff</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData.slice(0, 5).map(order => (
                      <TableRow key={order.id}>
                        <TableCell>{order.orderNumber || order.id.slice(0, 4)}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell align="right">K{order.total?.toFixed(2)}</TableCell>
                        <TableCell>{order.createdAt?.toDate ? format(order.createdAt.toDate(), 'HH:mm') : 'N/A'}</TableCell>
                        <TableCell>{order.createdByName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSalesReportDialog(false)}>Close</Button>
          <Button 
  variant="contained" 
  color="primary"
  onClick={exportSalesReport}
>
  Export Report
</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
  open={snackbar.open}
  autoHideDuration={6000}
  onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
>
  <Alert 
    onClose={handleCloseSnackbar} 
    severity={snackbar.severity}
    sx={{ width: '100%' }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>
      
    </Box>
  );
};

// Helper function to get top selling items
const getTopSellingItems = (orders) => {
  const itemMap = {};
  
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = {
            name: item.name,
            quantity: 0,
            total: 0
          };
        }
        itemMap[item.name].quantity += item.quantity;
        itemMap[item.name].total += item.price * item.quantity;
      });
    }
  });
  
  return Object.values(itemMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
};

// In Dashboard.js, replace the renderOwnerDashboard function with:
const renderOwnerDashboard = () => {
  return <OwnerDashboard />;
};



  

  const renderRoleSpecificContent = () => {
    if (!userData) return null;

    switch(userData.role) {
      case 'staff':
      case 'barista':
      case 'cashier':
      case 'shift-lead':
        return renderStaffDashboard();
      case 'manager':
        return renderManagerDashboard();
      case 'owner':
        return renderOwnerDashboard();
      default:
        return (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Welcome to Coffee Shop Management</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Your role doesn't have a specific dashboard configured yet.
            </Typography>
          </Paper>
        );
    }
};

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography color="error">Error: {error.message}</Typography>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography>Please log in to view this page</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {userData?.role ? `${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} Dashboard` : 'Dashboard'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
  Welcome back, {userData?.firstName || user.email.split('@')[0]}!
</Typography>
        <Divider sx={{ my: 2 }} />
      </Box>
      
      {renderRoleSpecificContent()}
    </Container>
  );
};

export default Dashboard;