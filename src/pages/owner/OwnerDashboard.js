// src/pages/owner/OwnerDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import logo from '../../assets/logo.png';
import { 
  doc, getDoc, collection, query, where, getDocs, 
  orderBy, limit, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { format, subDays, startOfWeek, endOfWeek, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Chart } from 'react-google-charts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// MUI Icons
import {
  LocalCafe, AttachMoney, People, Inventory, BarChart,
  TrendingUp, TrendingDown, Receipt, Star, Schedule,
  PointOfSale, CardGiftcard, TableRestaurant, Queue,
  Print, PictureAsPdf, Description, Cake
} from '@mui/icons-material';

// MUI Components
import {
  Typography, Container, Box, CircularProgress, Grid,
  Card, CardContent, CardHeader, Avatar, Divider,
  LinearProgress, Chip, Paper, Button, List,
  Menu, MenuItem, IconButton
} from '@mui/material';

const OwnerDashboard = () => {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    totalOrders: 0,
    activeStaff: 0,
    inventoryValue: 0,
    tableUtilization: 0,
    occupiedTables: 0,
    totalTables: 10, // Assuming you have 10 tables
    queueEfficiency: 0,
    avgWaitTime: 0,
    queueLength: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [loyaltyData, setLoyaltyData] = useState({
    totalPoints: 0,
    redeemedPoints: 0,
    activeMembers: 0
  });
  const [loadingData, setLoadingData] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [products, setProducts] = useState([]);
  const [reportFilter, setReportFilter] = useState('thisMonth');
  const [reservations, setReservations] = useState([]);
  const [queueItems, setQueueItems] = useState([]);

  // Fetch user data and dashboard data
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    };

    const fetchDashboardData = async () => {
  try {
    setLoadingData(true);
    
    // Calculate date ranges
    const today = new Date();
    const lastMonth = subDays(today, 30);
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

     // Fetch all tables to get the actual count
    const tablesQuery = query(collection(db, 'tables'));
    const tablesSnapshot = await getDocs(tablesQuery);
    const totalTables = tablesSnapshot.size || 10; // Fallback to 10 if no tables exist

    // Fetch orders data
    const ordersQuery = query(collection(db, 'orders'), where('status', '==', 'completed'));
    const monthlyOrdersQuery = query(
      collection(db, 'orders'),
      where('status', '==', 'completed'),
      where('createdAt', '>=', lastMonth)
    );
    const weeklyOrdersQuery = query(
      collection(db, 'orders'),
      where('status', '==', 'completed'),
      where('createdAt', '>=', weekStart),
      where('createdAt', '<=', weekEnd)
    );

    // Fetch reservations data - only get today's reservations
    const currentDate = format(today, 'yyyy-MM-dd');
    const reservationsQuery = query(
      collection(db, 'reservations'),
      where('date', '==', currentDate),
      where('status', '==', 'Reserved')
    );
    // Fetch queue data - only get today's queue items
    const queueQuery = query(
      collection(db, 'queue'),
      where('createdAt', '>=', startOfDay(today))
    );

   // Execute all queries in parallel
const [
  ordersSnapshot,
  monthlySnapshot,
  weeklySnapshot,
  reservationsSnapshot, 
  queueSnapshot
] = await Promise.all([
  getDocs(ordersQuery),
  getDocs(monthlyOrdersQuery),
  getDocs(weeklyOrdersQuery),
  getDocs(reservationsQuery),
  getDocs(queueQuery)
]);

    // Process reservations data
    const reservationsData = reservationsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      // Convert Firestore timestamp to Date if it exists
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));
    setReservations(reservationsData);

    // Process queue data
    const queueData = queueSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to Date if it exists
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));
    setQueueItems(queueData);

    // Calculate current time for table utilization
    const currentTime = format(today, 'HH:mm');

    // Filter reservations for current time slot (within the next 2 hours)
    const activeReservations = reservationsData.filter(reservation => {
      const reservationTime = reservation.time || '00:00';
      const timeDiff = timeDifferenceInMinutes(currentTime, reservationTime);
      return timeDiff >= -30 && timeDiff <= 120; // 30 mins before to 2 hours after reservation time
    });


    const occupiedTables = [...new Set(activeReservations.map(res => res.tableNumber))].length;
    const tableUtilization = totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0;

    // Calculate queue efficiency metrics
    const waitingQueue = queueData.filter(item => 
      item.payment?.status === 'waiting' || 
      !item.payment?.status // Include items without payment status
    );

    const completedQueue = queueData.filter(item => 
      item.payment?.status === 'completed'
    );

    const avgWaitTime = calculateAverageWaitTime(waitingQueue);
    const queueLength = waitingQueue.length;
    const queueEfficiency = calculateQueueEfficiency(queueData);

    // Calculate revenue
    const totalRevenue = ordersSnapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
    const monthlyRevenue = monthlySnapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
    const weeklyRevenue = weeklySnapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);

    // Fetch staff data
    const staffQuery = query(collection(db, 'users'), where('role', 'in', ['staff', 'pastrychef', 'cashier']));
    const staffSnapshot = await getDocs(staffQuery);

    // Fetch products data for inventory value
    const productsQuery = query(collection(db, 'products'));
    const productsSnapshot = await getDocs(productsQuery);
    const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProducts(productsData);
    
    // Calculate inventory value from products
    const inventoryValue = productsData.reduce((sum, product) => {
      return sum + (product.price * (product.stock || 0));
    }, 0);

    // Set stats with all metrics
    setStats(prev => ({
      ...prev,
      tableUtilization,
      occupiedTables,
      totalTables,
      queueEfficiency,
      avgWaitTime,
      queueLength
    }));

        // Fetch shifts data for staff performance
        const shiftsQuery = query(collection(db, 'shifts'));
        const shiftsSnapshot = await getDocs(shiftsQuery);
        const shiftsData = shiftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate staff performance metrics
        const performanceMap = {};
        shiftsData.forEach(shift => {
          if (!performanceMap[shift.userId]) {
            performanceMap[shift.userId] = {
              name: shift.userName,
              shiftsCompleted: 0,
              punctuality: 0,
              totalDuration: 0
            };
          }
          performanceMap[shift.userId].shiftsCompleted++;
          // Calculate punctuality (simplified)
          if (shift.status === 'completed') {
            performanceMap[shift.userId].punctuality += 0.8; // Placeholder
          }
          performanceMap[shift.userId].totalDuration += shift.duration || 0;
        });

        // Convert to array and calculate averages
        const staffPerformanceData = Object.values(performanceMap).map(staff => ({
          ...staff,
          punctuality: (staff.punctuality / staff.shiftsCompleted).toFixed(1),
          avgDuration: (staff.totalDuration / staff.shiftsCompleted).toFixed(1)
        }));
        setStaffPerformance(staffPerformanceData);

        // Prepare revenue data for chart
        const dailyRevenue = {};
        ordersSnapshot.docs.forEach(doc => {
          const order = doc.data();
          const date = order.createdAt?.toDate ? format(order.createdAt.toDate(), 'yyyy-MM-dd') : 'unknown';
          if (!dailyRevenue[date]) {
            dailyRevenue[date] = 0;
          }
          dailyRevenue[date] += order.total || 0;
        });
        
        const chartData = [
          ['Date', 'Revenue'],
          ...Object.entries(dailyRevenue).map(([date, revenue]) => [date, revenue])
        ];
        setRevenueData(chartData);

        // Set stats
        setStats({
          totalRevenue,
          monthlyRevenue,
          weeklyRevenue,
          totalOrders: ordersSnapshot.size,
          activeStaff: staffSnapshot.size,
          inventoryValue
        });

        // Fetch loyalty program data
const loyaltyQuery = query(collection(db, 'loyaltyCustomers'));
const loyaltySnapshot = await getDocs(loyaltyQuery);

// Calculate loyalty metrics
let totalPoints = 0;
loyaltySnapshot.forEach(doc => {
  const customer = doc.data();
  totalPoints += customer.points || 0;
});

// Set loyalty data
setLoyaltyData({
  totalPoints,
  redeemedPoints: 0, // You can implement this if you track redemptions
  activeMembers: loyaltySnapshot.size
});
        // Fetch recent orders
        const recentOrdersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentSnapshot = await getDocs(recentOrdersQuery);
        setRecentOrders(recentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Calculate top products (simplified)
        const productMap = {};
        ordersSnapshot.docs.forEach(doc => {
          const order = doc.data();
          if (order.items) {
            order.items.forEach(item => {
              if (!productMap[item.name]) {
                productMap[item.name] = { name: item.name, count: 0, revenue: 0 };
              }
              productMap[item.name].count += item.quantity;
              productMap[item.name].revenue += item.price * item.quantity;
            });
          }
        });
        setTopProducts(Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));

        // Set up real-time listeners
        const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
          setStats(prev => ({
            ...prev,
            totalOrders: snapshot.size,
            totalRevenue: snapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0)
          }));
        });

        const unsubscribeStaff = onSnapshot(staffQuery, (snapshot) => {
          setStats(prev => ({ ...prev, activeStaff: snapshot.size }));
        });

        setLoadingData(false);

        return () => {
          unsubscribeOrders();
          unsubscribeStaff();
        };
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoadingData(false);
      }
    };

    fetchUserData();
    fetchDashboardData();
  }, [user]);

  // Helper function to calculate time difference in minutes
const timeDifferenceInMinutes = (time1, time2) => {
  const [hours1, minutes1] = time1.split(':').map(Number);
  const [hours2, minutes2] = time2.split(':').map(Number);
  
  return (hours2 - hours1) * 60 + (minutes2 - minutes1);
};

// Updated helper functions with better time calculations
const calculateAverageWaitTime = (queueItems) => {
  if (!queueItems || queueItems.length === 0) return 0;
  
  const now = new Date();
  const totalWaitTime = queueItems.reduce((sum, item) => {
    const createdAt = item.createdAt || now;
    const waitTime = (now - createdAt) / (1000 * 60); // in minutes
    return sum + Math.max(0, waitTime); // Don't count negative wait times
  }, 0);
  
  return parseFloat((totalWaitTime / queueItems.length).toFixed(1)) || 0;
};

const calculateQueueEfficiency = (queueItems) => {
  if (!queueItems || queueItems.length === 0) return 100;
  
  const completedOrders = queueItems.filter(item => 
    item.payment?.status === 'completed'
  ).length;
  
  const totalOrders = queueItems.length;
  
  // Calculate efficiency based on completed vs total, with minimum 50%
  const efficiency = Math.max(50, (completedOrders / Math.max(totalOrders, 1)) * 100);
  return parseFloat(efficiency.toFixed(1));
};

  const handlePrintMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePrintMenuClose = () => {
    setAnchorEl(null);
  };

  const generateSalesReport = () => {
  const doc = new jsPDF();
  let currentY = 20;
  
  // Color scheme
  const primaryColor = [100, 150, 200]; // Light blue
  const secondaryColor = [220, 240, 255]; // Very light blue
  const textColor = [50, 70, 90]; // Dark blue-gray
  const lightBorderColor = [200, 220, 240]; // Light border color
  
  // Add logo and header with light blue theme
  try {
    const logoWidth = 50; // Increased from 40
    const logoHeight = 25; // Increased from 20
    const pageWidth = 210; // A4 width in mm
    const logoX = (pageWidth - logoWidth) / 2; // Calculate center position
    doc.addImage(logo, 'PNG', logoX, 10, logoWidth, logoHeight);
    currentY += 30; // Increased spacing to account for larger logo
  } catch (e) {
    console.warn('Could not load logo:', e);
    currentY += 5; // Less spacing if no logo
  }
  
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.setFont(undefined, 'bold');
  doc.text('MARY GRACE CAKES AND MORE', 105, currentY + 10, { align: 'center' });
  currentY += 20;
  
  doc.setFontSize(16);
  doc.text('Sales Performance Report', 105, currentY, { align: 'center' });
  currentY += 15;
  
  // Report metadata with light styling
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.setDrawColor(...lightBorderColor);
  doc.setLineWidth(0.3);
  doc.line(14, currentY, 196, currentY);
  currentY += 5;
  
  doc.text(`Report generated on: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, 14, currentY);
  doc.text(`Prepared for: ${userData?.name || 'Owner'}`, 105, currentY, { align: 'center' });
  doc.text(`Page 1`, 190, currentY, { align: 'right' });
  currentY += 10;
  
  // Summary section with light blue theme
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.setFont(undefined, 'bold');
  doc.text('Business Summary', 14, currentY);
  currentY += 7;
  
  doc.setFont(undefined, 'normal');
  const summaryData = [
    { label: 'Total Revenue', value: `K ${(stats.totalRevenue || 0).toFixed(2)}` },
    { label: 'Monthly Revenue', value: `K ${(stats.monthlyRevenue || 0).toFixed(2)}` },
    { label: 'Weekly Revenue', value: `K ${(stats.weeklyRevenue || 0).toFixed(2)}` },
    { label: 'Total Orders', value: stats.totalOrders.toString() }
  ];
  
  autoTable(doc, {
    startY: currentY,
    head: [['Metric', 'Value']],
    body: summaryData.map(item => [item.label, item.value]),
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fillColor: secondaryColor,
      textColor: textColor
    },
    alternateRowStyles: {
      fillColor: [245, 249, 255]
    },
    styles: { 
      cellPadding: 5,
      fontSize: 11,
      lineColor: lightBorderColor,
      lineWidth: 0.3
    },
    margin: { left: 14 }
  });
  currentY = doc.lastAutoTable.finalY + 15;
  
  // Top Products section
  doc.setFont(undefined, 'bold');
  doc.text('Top Selling Products', 14, currentY);
  currentY += 7;
  
  const topProductsData = topProducts.map((product, index) => [
    (index + 1).toString(),
    product.name,
    product.count.toString(),
    `K ${product.revenue.toFixed(2)}`
  ]);
  
  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Product', 'Quantity Sold', 'Revenue']],
    body: topProductsData,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fillColor: secondaryColor,
      textColor: textColor
    },
    alternateRowStyles: {
      fillColor: [245, 249, 255]
    },
    styles: { 
      cellPadding: 5,
      fontSize: 10,
      lineColor: lightBorderColor,
      lineWidth: 0.3
    },
    margin: { left: 14 },
    pageBreak: 'auto'
  });
  currentY = doc.lastAutoTable.finalY + 15;
  
  // Recent Orders section
  doc.setFont(undefined, 'bold');
  doc.text('Recent Orders', 14, currentY);
  currentY += 7;
  
  const ordersData = recentOrders.map(order => [
  `#${order.orderNumber}`,
  order.customerName || 'Walk-in',
  order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM d, h:mm a') : 'N/A',
  `K ${order.total?.toFixed(2) || '0.00'}`
]);

  
  autoTable(doc, {
    startY: currentY,
    head: [['Order ID', 'Customer', 'Date', 'Total']],
    body: ordersData,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fillColor: secondaryColor,
      textColor: textColor
    },
    alternateRowStyles: {
      fillColor: [245, 249, 255]
    },
    styles: { 
      cellPadding: 5,
      fontSize: 10,
      lineColor: lightBorderColor,
      lineWidth: 0.3
    },
    margin: { left: 14 },
    pageBreak: 'auto'
  });
  
  // Add page numbers with light footer
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setDrawColor(...lightBorderColor);
    doc.setLineWidth(0.3);
    doc.line(14, 280, 196, 280);
    doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
    doc.text('Mary Grace Cakes and More - Confidential', 14, 285);
  }
  
  doc.save('Mary Grace Cakes and More - Sales Report.pdf');
  handlePrintMenuClose();
};

const generateAttendanceReport = () => {
  const doc = new jsPDF();
  let currentY = 20;
  
  // Color scheme
  const primaryColor = [100, 150, 200]; // Light blue
  const secondaryColor = [220, 240, 255]; // Very light blue
  const textColor = [50, 70, 90]; // Dark blue-gray
  const lightBorderColor = [200, 220, 240]; // Light border color
  
  // Header with light blue theme
  try {
    const logoWidth = 50; // Increased from 40
    const logoHeight = 25; // Increased from 20
    const pageWidth = 210; // A4 width in mm
    const logoX = (pageWidth - logoWidth) / 2; // Calculate center position
    doc.addImage(logo, 'PNG', logoX, 10, logoWidth, logoHeight);
    currentY += 30; // Increased spacing to account for larger logo
  } catch (e) {
    console.warn('Could not load logo:', e);
    currentY += 5; // Less spacing if no logo
  }
  
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.setFont(undefined, 'bold');
  doc.text('MARY GRACE CAKES AND MORE', 105, currentY + 10, { align: 'center' });
  currentY += 20;
  
  doc.setFontSize(16);
  doc.text('Staff Attendance Report', 105, currentY, { align: 'center' });
  currentY += 15;
  
  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.setDrawColor(...lightBorderColor);
  doc.setLineWidth(0.3);
  doc.line(14, currentY, 196, currentY);
  currentY += 5;
  
  doc.text(`Report generated on: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, 14, currentY);
  doc.text(`Prepared for: ${userData?.name || 'Owner'}`, 105, currentY, { align: 'center' });
  doc.text(`Page 1`, 190, currentY, { align: 'right' });
  currentY += 10;
  
  // Staff Performance
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.setFont(undefined, 'bold');
  doc.text('Staff Performance Metrics', 14, currentY);
  currentY += 7;
  
  const staffData = staffPerformance.map(staff => [
    staff.name,
    staff.shiftsCompleted.toString(),
    staff.punctuality,
    `${staff.avgDuration} hrs`
  ]);
  
  autoTable(doc, {
    startY: currentY,
    head: [['Staff Name', 'Shifts Completed', 'Punctuality (1-5)', 'Avg. Duration']],
    body: staffData,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fillColor: secondaryColor,
      textColor: textColor
    },
    alternateRowStyles: {
      fillColor: [245, 249, 255]
    },
    styles: { 
      cellPadding: 5,
      fontSize: 10,
      lineColor: lightBorderColor,
      lineWidth: 0.3
    },
    margin: { left: 14 },
    pageBreak: 'auto'
  });
  
  // Add page numbers with light footer
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setDrawColor(...lightBorderColor);
    doc.setLineWidth(0.3);
    doc.line(14, 280, 196, 280);
    doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
    doc.text('Mary Grace Cakes and More - Confidential', 14, 285);
  }
  
  doc.save('Mary Grace Cakes and More - Attendance Report.pdf');
  handlePrintMenuClose();
};

const generateInventoryReport = () => {
  const doc = new jsPDF();
  let currentY = 20;
  
  // Color scheme
  const primaryColor = [100, 150, 200]; // Light blue
  const secondaryColor = [220, 240, 255]; // Very light blue
  const textColor = [50, 70, 90]; // Dark blue-gray
  const lightBorderColor = [200, 220, 240]; // Light border color
  
  // Header with light blue theme
  try {
    const logoWidth = 50; // Increased from 40
    const logoHeight = 25; // Increased from 20
    const pageWidth = 210; // A4 width in mm
    const logoX = (pageWidth - logoWidth) / 2; // Calculate center position
    doc.addImage(logo, 'PNG', logoX, 10, logoWidth, logoHeight);
    currentY += 30; // Increased spacing to account for larger logo
  } catch (e) {
    console.warn('Could not load logo:', e);
    currentY += 5; // Less spacing if no logo
  }
  
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.setFont(undefined, 'bold');
  doc.text('MARY GRACE CAKES AND MORE', 105, currentY + 10, { align: 'center' });
  currentY += 20;
  
  doc.setFontSize(16);
  doc.text('Inventory Management Report', 105, currentY, { align: 'center' });
  currentY += 15;
  
  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.setDrawColor(...lightBorderColor);
  doc.setLineWidth(0.3);
  doc.line(14, currentY, 196, currentY);
  currentY += 5;
  
  doc.text(`Report generated on: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, 14, currentY);
  doc.text(`Prepared for: ${userData?.name || 'Owner'}`, 105, currentY, { align: 'center' });
  doc.text(`Page 1`, 190, currentY, { align: 'right' });
  currentY += 10;
  
  // Inventory Summary
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.setFont(undefined, 'bold');
  doc.text('Inventory Summary', 14, currentY);
  currentY += 7;
  
  doc.setFont(undefined, 'normal');
  doc.text(`Total Inventory Value: K ${(stats.inventoryValue || 0).toFixed(2)}`, 14, currentY);
  currentY += 10;
  
  // Products List with pagination
  doc.setFont(undefined, 'bold');
  doc.text('Product Inventory Details', 14, currentY);
  currentY += 7;
  
  const inventoryData = products.map(product => [
    product.name,
    (product.stock || 0).toString(),
    `K ${product.price.toFixed(2)}`,
    `K ${(product.price * (product.stock || 0)).toFixed(2)}`,
    product.available ? 'Yes' : 'No'
  ]);
  
  autoTable(doc, {
    startY: currentY,
    head: [['Product', 'Stock', 'Unit Price', 'Total Value', 'Available']],
    body: inventoryData,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fillColor: secondaryColor,
      textColor: textColor
    },
    alternateRowStyles: {
      fillColor: [245, 249, 255]
    },
    styles: { 
      cellPadding: 5,
      fontSize: 10,
      lineColor: lightBorderColor,
      lineWidth: 0.3
    },
    margin: { left: 14 },
    pageBreak: 'auto'
  });
  
  // Add page numbers with light footer
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setDrawColor(...lightBorderColor);
    doc.setLineWidth(0.3);
    doc.line(14, 280, 196, 280);
    doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
    doc.text('Mary Grace Cakes and More - Confidential', 14, 285);
  }
  
  doc.save('Mary Grace Cakes and More - Inventory Report.pdf');
  handlePrintMenuClose();
};


  if (loading || loadingData) {
    return (
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#f9f5f0' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ 
            fontFamily: '"Playfair Display", serif',
            color: '#5d4037',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Cake sx={{ mr: 2, fontSize: 'inherit' }} />
            Mary Grace Cakes & More Insights
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#8d6e63', mt: 1 }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrintMenuOpen}
            sx={{ color: '#5d4037', borderColor: '#8d6e63', '&:hover': { borderColor: '#5d4037' } }}
          >
            Generate Reports
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handlePrintMenuClose}
          >
            <MenuItem onClick={generateSalesReport}>
              <Description sx={{ mr: 1, color: '#8d6e63' }} />
              Sales Report
            </MenuItem>
            <MenuItem onClick={generateAttendanceReport}>
              <Schedule sx={{ mr: 1, color: '#8d6e63' }} />
              Attendance Report
            </MenuItem>
            <MenuItem onClick={generateInventoryReport}>
              <Inventory sx={{ mr: 1, color: '#8d6e63' }} />
              Inventory Report
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      <Divider sx={{ my: 3, borderColor: '#d7ccc8' }} />

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Revenue */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f5f0e6, #fff)',
            border: '1px solid #e0d6c2',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(93, 64, 55, 0.08)'
          }}>
            <CardHeader
              avatar={
                <Avatar sx={{ 
                  bgcolor: 'rgba(111, 78, 55, 0.1)',
                  color: '#5d4037'
                }}>
                  <AttachMoney />
                </Avatar>
              }
              title="Total Revenue"
              titleTypographyProps={{ 
                variant: 'h6',
                color: '#5d4037'
              }}
            />
            <CardContent>
              <Typography variant="h4" sx={{ color: '#3e2723', fontWeight: 700 }}>
                K{(stats.totalRevenue || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#8d6e63', mt: 1 }}>
                All-time sales
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Revenue */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f5f0e6, #fff)',
            border: '1px solid #e0d6c2',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(93, 64, 55, 0.08)'
          }}>
            <CardHeader
              avatar={
                <Avatar sx={{ 
                  bgcolor: 'rgba(46, 125, 50, 0.1)',
                  color: '#2e7d32'
                }}>
                  <TrendingUp />
                </Avatar>
              }
              title="Monthly Revenue"
              titleTypographyProps={{ 
                variant: 'h6',
                color: '#5d4037'
              }}
            />
            <CardContent>
              <Typography variant="h4" sx={{ color: '#3e2723', fontWeight: 700 }}>
                K{(stats.monthlyRevenue || 0).toFixed(2)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" sx={{ 
                  color: stats.monthlyRevenue > stats.weeklyRevenue * 4 ? '#2e7d32' : '#d84315',
                  mr: 1
                }}>
                  {((stats.monthlyRevenue / (stats.weeklyRevenue * 4 || 1)) * 100).toFixed(0)}% of projected
                </Typography>
                {stats.monthlyRevenue > stats.weeklyRevenue * 4 ? (
                  <TrendingUp sx={{ color: '#2e7d32' }} />
                ) : (
                  <TrendingDown sx={{ color: '#d84315' }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Staff */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f5f0e6, #fff)',
            border: '1px solid #e0d6c2',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(93, 64, 55, 0.08)'
          }}>
            <CardHeader
              avatar={
                <Avatar sx={{ 
                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                  color: '#1976d2'
                }}>
                  <People />
                </Avatar>
              }
              title="Active Staff"
              titleTypographyProps={{ 
                variant: 'h6',
                color: '#5d4037'
              }}
            />
            <CardContent>
              <Typography variant="h4" sx={{ color: '#3e2723', fontWeight: 700 }}>
                {stats.activeStaff}
              </Typography>
              <Typography variant="body2" sx={{ color: '#8d6e63', mt: 1 }}>
                Currently employed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Value */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f5f0e6, #fff)',
            border: '1px solid #e0d6c2',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(93, 64, 55, 0.08)'
          }}>
            <CardHeader
              avatar={
                <Avatar sx={{ 
                  bgcolor: 'rgba(255, 167, 38, 0.1)',
                  color: '#ff8f00'
                }}>
                  <Inventory />
                </Avatar>
              }
              title="Inventory Value"
              titleTypographyProps={{ 
                variant: 'h6',
                color: '#5d4037'
              }}
            />
            <CardContent>
              <Typography variant="h4" sx={{ color: '#3e2723', fontWeight: 700 }}>
                K{(stats.inventoryValue || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#8d6e63', mt: 1 }}>
                Current stock worth
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue and Performance Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f5f0e6, #fff)',
            border: '1px solid #e0d6c2',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(93, 64, 55, 0.08)'
          }}>
            <CardHeader
              title="Revenue Overview"
              titleTypographyProps={{ 
                variant: 'h5',
                color: '#5d4037'
              }}
              avatar={
                <Avatar sx={{ 
                  bgcolor: 'rgba(111, 78, 55, 0.1)',
                  color: '#5d4037'
                }}>
                  <BarChart />
                </Avatar>
              }
            />
            <CardContent sx={{ height: 300 }}>
              {revenueData.length > 1 ? (
                <Chart
                  chartType="LineChart"
                  data={revenueData}
                  options={{
                    title: 'Daily Revenue',
                    curveType: 'function',
                    legend: { position: 'bottom' },
                    hAxis: { title: 'Date' },
                    vAxis: { title: 'Revenue (K)' },
                    colors: ['#8d6e63'],
                    backgroundColor: 'transparent'
                  }}
                  width="100%"
                  height="100%"
                />
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  backgroundColor: 'rgba(111, 78, 55, 0.05)',
                  borderRadius: '8px'
                }}>
                  <Typography variant="body1" sx={{ color: '#8d6e63' }}>
                    Loading revenue data...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f5f0e6, #fff)',
            border: '1px solid #e0d6c2',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(93, 64, 55, 0.08)'
          }}>
            <CardHeader
              title="Top Treats"
              titleTypographyProps={{ 
                variant: 'h5',
                color: '#5d4037'
              }}
              avatar={
                <Avatar sx={{ 
                  bgcolor: 'rgba(111, 78, 55, 0.1)',
                  color: '#5d4037'
                }}>
                  <LocalCafe />
                </Avatar>
              }
            />
            <CardContent>
              <List>
                {topProducts.map((product, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ color: '#5d4037' }}>
                        {index + 1}. {product.name}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: '#5d4037' }}>
                        K{product.revenue.toFixed(2)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(product.revenue / (topProducts[0]?.revenue || 1)) * 100} 
                      sx={{ 
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(111, 78, 55, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#8d6e63'
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#8d6e63', display: 'block', mt: 0.5 }}>
                      {product.count} sold
                    </Typography>
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Business Insights Section */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f5f0e6, #fff)',
            border: '1px solid #e0d6c2',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(93, 64, 55, 0.08)'
          }}>
            <CardHeader
              title="Recent Orders"
              titleTypographyProps={{ 
                variant: 'h5',
                color: '#5d4037'
              }}
              avatar={
                <Avatar sx={{ 
                  bgcolor: 'rgba(111, 78, 55, 0.1)',
                  color: '#5d4037'
                }}>
                  <Receipt />
                </Avatar>
              }
              action={
                <Button 
                  size="small" 
                  sx={{ color: '#8d6e63' }}
                  onClick={() => window.location.href = '/orders'}
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              <List>
                {recentOrders.map(order => (
                  <Paper key={order.id} sx={{ 
                    p: 2, 
                    mb: 2, 
                    backgroundColor: 'rgba(111, 78, 55, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" sx={{ color: '#5d4037' }}>
  Order #{order.orderNumber}
</Typography>

                      <Typography variant="subtitle1" sx={{ color: '#5d4037' }}>
                        K{(order.total || 0).toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#8d6e63' }}>
                      {order.customerName || 'Walk-in'} • {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'MMM d, h:mm a') : 'N/A'}
                    </Typography>
                    {order.items && (
                      <Box sx={{ mt: 1 }}>
                        {order.items.slice(0, 2).map((item, idx) => (
                          <Chip 
                            key={idx}
                            label={`${item.quantity}x ${item.name}`}
                            size="small"
                            sx={{ 
                              mr: 1, 
                              mb: 1,
                              backgroundColor: 'rgba(141, 110, 99, 0.1)',
                              color: '#5d4037'
                            }}
                          />
                        ))}
                        {order.items.length > 2 && (
                          <Chip 
                            label={`+${order.items.length - 2} more`}
                            size="small"
                            sx={{ 
                              backgroundColor: 'rgba(141, 110, 99, 0.1)',
                              color: '#5d4037'
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </Paper>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Metrics */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f5f0e6, #fff)',
            border: '1px solid #e0d6c2',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(93, 64, 55, 0.08)'
          }}>
            <CardHeader
              title="Business Metrics"
              titleTypographyProps={{ 
                variant: 'h5',
                color: '#5d4037'
              }}
              avatar={
                <Avatar sx={{ 
                  bgcolor: 'rgba(111, 78, 55, 0.1)',
                  color: '#5d4037'
                }}>
                  <PointOfSale />
                </Avatar>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                {/* Loyalty Program */}
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ 
                    p: 2, 
                    height: '100%',
                    backgroundColor: 'rgba(212, 167, 98, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CardGiftcard sx={{ color: '#8d6e63', mr: 1 }} />
                      <Typography variant="h6" sx={{ color: '#5d4037' }}>
                        Loyalty Program
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#5d4037' }}>
                      {loyaltyData.activeMembers} active members
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8d6e63' }}>
                      {loyaltyData.totalPoints} points available
                    </Typography>
                  </Paper>
                </Grid>

                {/* Table Utilization */}
<Grid item xs={12} sm={6}>
  <Paper sx={{ 
    p: 2, 
    height: '100%',
    backgroundColor: 'rgba(141, 110, 99, 0.1)',
    borderRadius: '8px'
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <TableRestaurant sx={{ color: '#8d6e63', mr: 1 }} />
      <Typography variant="h6" sx={{ color: '#5d4037' }}>
        Table Utilization
      </Typography>
    </Box>
    <Typography variant="body1" sx={{ color: '#5d4037' }}>
      {(stats.tableUtilization || 0).toFixed(0)}% occupancy rate
    </Typography>
    <Typography variant="body2" sx={{ color: '#8d6e63' }}>
      {stats.occupiedTables}/{stats.totalTables} tables occupied
    </Typography>
  </Paper>
</Grid>

                {/* Staff Performance */}
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ 
                    p: 2, 
                    height: '100%',
                    backgroundColor: 'rgba(111, 78, 55, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <People sx={{ color: '#8d6e63', mr: 1 }} />
                      <Typography variant="h6" sx={{ color: '#5d4037' }}>
                        Staff Performance
                      </Typography>
                    </Box>
                    {staffPerformance.length > 0 ? (
                      <>
                        <Typography variant="body1" sx={{ color: '#5d4037' }}>
                          Avg. rating: {(
                            staffPerformance.reduce((sum, staff) => sum + parseFloat(staff.punctuality), 0) / 
                            staffPerformance.length
                          ).toFixed(1)}/5
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8d6e63' }}>
                          Based on {staffPerformance.reduce((sum, staff) => sum + staff.shiftsCompleted, 0)} shifts
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#8d6e63' }}>
                        No performance data available
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Queue Efficiency */}
<Grid item xs={12} sm={6}>
  <Paper sx={{ 
    p: 2, 
    height: '100%',
    backgroundColor: 'rgba(141, 110, 99, 0.1)',
    borderRadius: '8px'
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Queue sx={{ color: '#8d6e63', mr: 1 }} />
      <Typography variant="h6" sx={{ color: '#5d4037' }}>
        Queue Efficiency
      </Typography>
    </Box>
    <Typography variant="body1" sx={{ color: '#5d4037' }}>
      Avg. wait time: {stats.avgWaitTime || 0} min
    </Typography>
    <Typography variant="body2" sx={{ color: '#8d6e63' }}>
      {stats.queueLength} orders in queue
    </Typography>
  </Paper>
</Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OwnerDashboard;