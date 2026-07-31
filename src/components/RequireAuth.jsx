import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthGuard from '../hooks/useAuthGuard';

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuthGuard();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
