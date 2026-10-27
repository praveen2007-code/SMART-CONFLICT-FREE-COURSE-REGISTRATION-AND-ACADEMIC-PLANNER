import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CourseCatalog } from './pages/CourseCatalog';
import { CoursePlanner } from './pages/CoursePlanner';
import { Timetable } from './pages/Timetable';
import { MyCourses } from './pages/MyCourses';
import { Recommendations } from './pages/Recommendations';
import { RegistrationHistory } from './pages/RegistrationHistory';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { DepartmentAnalytics } from './pages/DepartmentAnalytics';
import { RegistrationFeed } from './pages/RegistrationFeed';

// Protected Route Guard
const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Admin Route Guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Role-based Home Router
const HomeRoute: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  return <Dashboard />;
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Student / Faculty Portal */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/catalog" element={<CourseCatalog />} />
              <Route path="/planner" element={<CoursePlanner />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/history" element={<RegistrationHistory />} />
              <Route path="/profile" element={<Profile />} />

              {/* Admin Exclusive */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <AdminRoute>
                    <DepartmentAnalytics />
                  </AdminRoute>
                }
              />
              <Route
                path="/registration-feed"
                element={
                  <AdminRoute>
                    <RegistrationFeed />
                  </AdminRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
