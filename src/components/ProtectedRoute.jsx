import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireGm = false }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div>Loading shadows...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireGm && !profile?.is_gm) return <Navigate to="/player" />;

  return children;
};

export default ProtectedRoute;
