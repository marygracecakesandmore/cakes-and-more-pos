// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Orders from './pages/orders/Orders';
import Inventory from './pages/inventory/Inventory';
import Employees from './pages/employees/Employees';
import Shifts from './pages/shifts/Shifts'; // Add this import
import Menu from './pages/Menu'; // Add this import
import ActivityLogs from './pages/ActivityLogs'; // Add this import
import PrivateRoute from './components/PrivateRoute';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navigation from './components/Navigation';
import Profile from './pages/Profile';
import ResetPassword from './pages/reset-password/ResetPassword';


const theme = createTheme({
  palette: {
    primary: {
      main: '#6F4E37', // Coffee brown
    },
    secondary: {
      main: '#C4A484', // Light coffee
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navigation />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/orders" element={
            <PrivateRoute requiredRoles={['staff', 'manager', 'admin', 'owner', 'barista', 'cashier', 'shift-lead']}>
              <Orders />
            </PrivateRoute>
          } />
          <Route path="/inventory" element={
            <PrivateRoute requiredRoles={['manager', 'admin', 'owner']}>
              <Inventory />
            </PrivateRoute>
          } />
          <Route path="/employees" element={
            <PrivateRoute requiredRoles={['admin', 'owner']}>
              <Employees />
            </PrivateRoute>
          } />
          {/* Add the new shifts route */}
          <Route path="/shifts" element={
            <PrivateRoute requiredRoles={['staff', 'barista', 'cashier', 'shift-lead', 'manager', 'admin', 'owner']}>
              <Shifts />
            </PrivateRoute>
          } />
          <Route path="/menu" element={
  <PrivateRoute requiredRoles={['staff', 'barista', 'cashier', 'shift-lead', 'manager', 'admin', 'owner']}>
    <Menu />
  </PrivateRoute>
} />
<Route path="/activity-logs" element={
  <PrivateRoute requiredRoles={['staff', 'barista', 'cashier', 'shift-lead', 'manager', 'admin', 'owner']}>
    <ActivityLogs />
  </PrivateRoute>
} />


<Route path="/profile" element={
  <PrivateRoute>
    <Profile />
  </PrivateRoute>
} />
<Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;