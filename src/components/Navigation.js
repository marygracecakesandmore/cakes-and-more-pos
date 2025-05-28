// src/components/Navigation.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  Badge,
  Chip
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  RestaurantMenu as MenuIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Receipt as OrdersIcon,
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon,
  Login as LoginIcon,
  Menu as MenuOpenIcon,
  Notifications as NotificationsIcon,
  Loyalty as LoyaltyIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
// Add these imports at the top
import { collection, query, where, onSnapshot, orderBy, updateDoc, arrayUnion, limit, or } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar as MuiAvatar, Paper } from '@mui/material';

const Navigation = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = React.useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  // Add these state variables inside your Navigation component
const [notifications, setNotifications] = useState([]);
const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  if (!user || !userData) return;

  // Query notifications where:
  // 1. The current user is in recipients array OR
  // 2. The notification is for their role
  const q = query(
    collection(db, 'notifications'),
    or(
      where('recipients', 'array-contains', user.uid),
      where('recipients', 'array-contains', userData.role)
    ),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifs = [];
    let unread = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      notifs.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      });
      
      if (!data.readBy?.includes(user.uid)) {
        unread++;
      }
    });

    setNotifications(notifs);
    setUnreadCount(unread);
  });

  return () => unsubscribe();
}, [user, userData]);

const handleMarkAllAsRead = async () => {
  try {
    // Get all unread notifications
    const unreadNotifications = notifications.filter(
      notification => !notification.readBy?.includes(user.uid)
    );

    // Update each unread notification
    const updatePromises = unreadNotifications.map(async (notification) => {
      const notificationRef = doc(db, 'notifications', notification.id);
      await updateDoc(notificationRef, {
        readBy: arrayUnion(user.uid)
      });
    });

    await Promise.all(updatePromises);
    setUnreadCount(0);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

// Add this function to handle notification click
const handleNotificationClick = async (notificationId) => {
  try {
    // Mark as read
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      readBy: arrayUnion(user.uid)
    });
    
    // Close the menu
    setNotificationAnchorEl(null);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Add this function to handle notification menu open/close
const handleNotificationMenuOpen = (event) => {
  setNotificationAnchorEl(event.currentTarget);
};

const handleNotificationMenuClose = () => {
  setNotificationAnchorEl(null);
};

  React.useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };

    fetchUserData();
  }, [user]);

  const getNotificationIcon = (type) => {
  switch(type) {
    case 'shift_swap_request':
    case 'shift_swap_approved':
    case 'shift_swap_rejected':
    case 'shift_assigned':
      return <PeopleIcon fontSize="small" />;
    case 'low_ingredient':
    case 'ingredient_resolved':
      return <InventoryIcon fontSize="small" />;
    case 'supply_request':
    case 'supply_request_fulfilled':
      return <LocalShippingIcon fontSize="small" />;
    default:
      return <NotificationsIcon fontSize="small" />;
  }
};

const getNotificationColor = (type) => {
  switch(type) {
    case 'shift_swap_approved':
    case 'supply_request_fulfilled':
    case 'ingredient_resolved':
      return 'success.main';
    case 'shift_swap_rejected':
      return 'error.main';
    case 'shift_swap_request':
    case 'supply_request':
    case 'low_ingredient':
      return 'warning.main';
    case 'shift_assigned':
      return 'info.main';
    default:
      return 'primary.main';
  }
};

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  // Don't render navigation on login page
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const renderDesktopNavItems = () => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      gap: 0.5,
      ml: 2
    }}>
      <Button 
        component={Link} 
        to="/dashboard"
        startIcon={<DashboardIcon />}
        sx={{
          color: 'text.primary',
          borderRadius: 2,
          px: 2,
          py: 1,
          '&.active': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            fontWeight: 600
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)'
          }
        }}
      >
        Dashboard
      </Button>
      {user && (
        <>
          {(userData?.role === 'staff' || userData?.role === 'barista' || userData?.role === 'cashier' || userData?.role === 'shift-lead' || userData?.role === 'manager' || userData?.role === 'admin' || userData?.role === 'owner') && (
            <>
              <Button 
                component={Link} 
                to="/orders"
                startIcon={<OrdersIcon />}
                sx={{
                  color: 'text.primary',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  '&.active': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    fontWeight: 600
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                Orders
                {userData?.pendingOrders > 0 && (
                  <Chip 
                    label={userData.pendingOrders}
                    size="small"
                    color="error"
                    sx={{ 
                      ml: 1,
                      height: 20,
                      fontSize: '0.75rem',
                      '& .MuiChip-label': {
                        px: 0.5
                      }
                    }}
                  />
                )}
              </Button>
              <Button 
                component={Link} 
                to="/menu"
                startIcon={<MenuIcon />}
                sx={{
                  color: 'text.primary',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  '&.active': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    fontWeight: 600
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                Menu
              </Button>
            </>
          )}
          {(userData?.role === 'manager' || userData?.role === 'admin' || userData?.role === 'owner') && (
            <Button 
              component={Link} 
              to="/inventory"
              startIcon={<InventoryIcon />}
              sx={{
                color: 'text.primary',
                borderRadius: 2,
                px: 2,
                py: 1,
                '&.active': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  fontWeight: 600
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              Inventory
            </Button>
          )}
          {(userData?.role === 'admin' || userData?.role === 'owner') && (
            <Button 
              component={Link} 
              to="/employees"
              startIcon={<PeopleIcon />}
              sx={{
                color: 'text.primary',
                borderRadius: 2,
                px: 2,
                py: 1,
                '&.active': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  fontWeight: 600
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              Employees
            </Button>
          )}
        </>
      )}
    </Box>
  );

  const renderMobileNavItems = () => (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      open={Boolean(mobileMenuAnchorEl)}
      onClose={handleMobileMenuClose}
      PaperProps={{
        sx: {
          width: 280,
          borderRadius: 2,
          boxShadow: theme.shadows[8],
          overflow: 'visible',
          mt: 1.5,
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0
          }
        }
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem 
        component={Link} 
        to="/dashboard" 
        onClick={handleMobileMenuClose}
        sx={{ py: 1.5 }}
      >
        <DashboardIcon sx={{ mr: 2, color: 'text.secondary' }} />
        <Typography variant="body1">Dashboard</Typography>
      </MenuItem>
      
      {user && (
        <>
          {(userData?.role === 'staff' || userData?.role === 'barista' || userData?.role === 'cashier' || userData?.role === 'shift-lead' || userData?.role === 'manager' || userData?.role === 'admin' || userData?.role === 'owner') && (
            <>
              <MenuItem 
                component={Link} 
                to="/orders" 
                onClick={handleMobileMenuClose}
                sx={{ py: 1.5 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <OrdersIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography variant="body1">Orders</Typography>
                  {userData?.pendingOrders > 0 && (
                    <Chip 
                      label={userData.pendingOrders}
                      size="small"
                      color="error"
                      sx={{ 
                        ml: 'auto',
                        height: 20,
                        fontSize: '0.75rem',
                        '& .MuiChip-label': {
                          px: 0.5
                        }
                      }}
                    />
                  )}
                </Box>
              </MenuItem>
              <MenuItem 
                component={Link} 
                to="/menu" 
                onClick={handleMobileMenuClose}
                sx={{ py: 1.5 }}
              >
                <MenuIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Typography variant="body1">Menu</Typography>
              </MenuItem>
            </>
          )}
          {(userData?.role === 'manager' || userData?.role === 'admin' || userData?.role === 'owner') && (
            <MenuItem 
              component={Link} 
              to="/inventory" 
              onClick={handleMobileMenuClose}
              sx={{ py: 1.5 }}
            >
              <InventoryIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Typography variant="body1">Inventory</Typography>
            </MenuItem>
          )}
          {(userData?.role === 'admin' || userData?.role === 'owner') && (
            <MenuItem 
              component={Link} 
              to="/employees" 
              onClick={handleMobileMenuClose}
              sx={{ py: 1.5 }}
            >
              <PeopleIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Typography variant="body1">Employees</Typography>
            </MenuItem>
          )}
        </>
      )}
      
      <Divider sx={{ my: 1 }} />
      
      {user ? (
        <MenuItem onClick={() => auth.signOut()} sx={{ py: 1.5 }}>
          <LogoutIcon sx={{ mr: 2, color: 'text.secondary' }} />
          <Typography variant="body1">Logout</Typography>
        </MenuItem>
      ) : (
        <MenuItem 
          component={Link} 
          to="/login" 
          onClick={handleMobileMenuClose}
          sx={{ py: 1.5 }}
        >
          <LoginIcon sx={{ mr: 2, color: 'text.secondary' }} />
          <Typography variant="body1">Login</Typography>
        </MenuItem>
      )}
    </Menu>
  );

  return (
    <AppBar 
      position="sticky"
      elevation={0}
      sx={{ 
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        color: 'text.primary',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ 
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        py: 1
      }}>
        <Box sx={{ 
  display: 'flex', 
  alignItems: 'center',
  gap: 2
}}>
  <Typography 
    variant="h6" 
    component={Link} 
    to="/"
    sx={{ 
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      height: '64px', // Increased container height
      padding: '12px 0' // Added padding for better spacing
    }}
  >
    <img 
      src={logo} 
      alt="Café Logo" 
      style={{ 
        height: '48px', // Increased from 40px to 48px
        width: 'auto',
        maxWidth: '100%',
        objectFit: 'contain'
      }} 
    />
  </Typography>

  {!isMobile && renderDesktopNavItems()}
</Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user && (
            <>
              {!isMobile && (
                <>
                  <IconButton 
  color="inherit" 
  sx={{ mr: 1 }}
  onClick={handleNotificationMenuOpen}
>
  <Badge badgeContent={unreadCount} color="error">
    <NotificationsIcon />
  </Badge>
</IconButton>
                  <IconButton color="inherit">
                    <Badge badgeContent={userData?.points || 0} color="primary">
                      <LoyaltyIcon />
                    </Badge>
                  </IconButton>
                </>
              )}
              
              <IconButton
                onClick={isMobile ? handleMobileMenuOpen : handleMenuOpen}
                sx={{ p: 0, ml: 1 }}
              >
                <Avatar 
                  alt={user.displayName || 'User'} 
                  src={user.photoURL}
                  sx={{ 
                    width: 36, 
                    height: 36,
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText'
                  }}
                >
                  {user.displayName?.charAt(0) || <AccountIcon />}
                </Avatar>
              </IconButton>

              <Menu
  anchorEl={notificationAnchorEl}
  open={Boolean(notificationAnchorEl)}
  onClose={handleNotificationMenuClose}
  PaperProps={{
    sx: {
      width: 360,
      maxHeight: 480,
      borderRadius: 2,
      boxShadow: theme.shadows[8],
      overflow: 'visible',
      mt: 1.5,
      '&:before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        top: 0,
        right: 14,
        width: 10,
        height: 10,
        bgcolor: 'background.paper',
        transform: 'translateY(-50%) rotate(45deg)',
        zIndex: 0
      }
    }
  }}
  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
>
  <Paper sx={{ p: 2, width: '100%' }}>
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mb: 1 
    }}>
      <Typography variant="h6">Notifications</Typography>
      {unreadCount > 0 && (
        <Button 
          size="small" 
          onClick={handleMarkAllAsRead}
          sx={{ 
            textTransform: 'none',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          Mark all as read
        </Button>
      )}
    </Box>
    {notifications.length === 0 ? (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No new notifications
      </Typography>
    ) : (
      <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
        {notifications.map((notification) => (
          <ListItem 
            key={notification.id}
            button
            onClick={() => handleNotificationClick(notification.id)}
            sx={{
              backgroundColor: notification.readBy?.includes(user.uid) ? 
                'transparent' : 'action.selected',
              borderRadius: 1,
              mb: 0.5
            }}
          >
            <ListItemAvatar>
              <MuiAvatar sx={{ 
                bgcolor: getNotificationColor(notification.type),
                color: 'common.white',
                width: 32,
                height: 32
              }}>
                {getNotificationIcon(notification.type)}
              </MuiAvatar>
            </ListItemAvatar>
            <ListItemText
              primary={notification.title}
              secondary={notification.message}
              primaryTypographyProps={{
                fontWeight: notification.readBy?.includes(user.uid) ? 
                  'normal' : 'bold'
              }}
              secondaryTypographyProps={{
                color: notification.readBy?.includes(user.uid) ? 
                  'text.secondary' : 'text.primary'
              }}
            />
          </ListItem>
        ))}
      </List>
    )}
  </Paper>
</Menu>
              
              {!isMobile && (
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      width: 240,
                      borderRadius: 2,
                      boxShadow: theme.shadows[8],
                      overflow: 'visible',
                      mt: 1.5,
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0
                      }
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem sx={{ py: 1.5, pointerEvents: 'none' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {user.displayName || 'User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem onClick={() => auth.signOut()} sx={{ py: 1.5 }}>
                    <LogoutIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Typography variant="body1">Logout</Typography>
                  </MenuItem>
                </Menu>
              )}
            </>
          )}
          
          {!user && !isMobile && (
            <Button 
              component={Link} 
              to="/login"
              variant="contained"
              startIcon={<LoginIcon />}
              sx={{
                ml: 1,
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none'
                }
              }}
            >
              Login
            </Button>
          )}
          
          {!user && isMobile && (
            <IconButton
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MenuOpenIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      {isMobile && renderMobileNavItems()}
    </AppBar>
  );
};

export default Navigation;