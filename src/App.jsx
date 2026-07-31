
import React from 'react'; // 👈 Add this at the top of App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import SharePage from './pages/SharePage';
import Header from './components/Header';
import ToastProvider from './components/ToastProvider';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, loginSuccess } from './store/authSlice';
import { useState,useEffect } from 'react';
import { setAuthToken } from './api/apiClient';
// Axe accessibility testing in development
if (process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line global-require
    const axe = require('@axe-core/react');
    // eslint-disable-next-line global-require
    const React = require('react');
    if (typeof axe === 'function') axe(React, {});
  } catch (e) {
    // axe not installed in all environments; ignore
  }
}

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.accessToken) {
          setAuthToken(parsed.accessToken);
          dispatch(loginSuccess(parsed));
        }
      }
    } catch (e) {
      // ignore
    }
  }, [dispatch]);
  return (
    <Router>
      <ToastProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <a href="#main" className="sr-only">Skip to main content</a>
          {isAuthenticated && <Header />}
          <main id="main" role="main" style={{ flex: 1 }}>
            <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/boards/:boardId"
          element={isAuthenticated ? <BoardPage /> : <Navigate to="/login" replace />}
        />
        <Route path="/share/:token" element={<SharePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
