import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SeatMapPage from './pages/SeatMapPage';
import Employees from './pages/Employees';
import ProjectsPage from './pages/ProjectsPage';
import FloorsZonesPage from './pages/FloorsZonesPage';
import NewJoinersPage from './pages/NewJoinersPage';
import ReportsPage from './pages/ReportsPage';
import AIChatPage from './pages/AIChatPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="seat-map" element={<SeatMapPage />} />
        <Route path="employees" element={<Employees />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="floors-zones" element={<FloorsZonesPage />} />
        <Route path="new-joiners" element={<NewJoinersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="ai-chat" element={<AIChatPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
