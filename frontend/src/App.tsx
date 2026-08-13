import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AIChatWidget } from './components/AIChatWidget';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { SeatMapPage } from './pages/SeatMapPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { NewJoinersPage } from './pages/NewJoinersPage';
import { RequestsPage } from './pages/RequestsPage';
import { BulkImportPage } from './pages/BulkImportPage';

const ProtectedLayout: React.FC = () => {
  const { user, token, loading } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50/60">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleAIChat={() => setIsAIChatOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/seat-map" element={<SeatMapPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/new-joiners" element={<NewJoinersPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/bulk-import" element={<BulkImportPage />} />
            <Route
              path="*"
              element={<Navigate to={user.role === 'employee' ? '/directory' : '/dashboard'} replace />}
            />
          </Routes>
        </main>
      </div>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AIChatWidget isOpen={isAIChatOpen} onToggle={() => setIsAIChatOpen((prev) => !prev)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
