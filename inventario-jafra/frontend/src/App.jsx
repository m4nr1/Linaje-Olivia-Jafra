import { Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { isAuthenticated } from './services/authService';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ResetPassword from './pages/ResetPassword';

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/inventory" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated() ? '/inventory' : '/login'} replace />}
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </>
  );
}

export default App;