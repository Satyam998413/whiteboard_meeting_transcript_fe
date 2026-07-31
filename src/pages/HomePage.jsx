import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import HomeCard from '../components/HomeCard';
import { selectIsAuthenticated } from '../store/authSlice';

const HomePage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <main>
      <HomeCard />
    </main>
  );
};

export default HomePage;
