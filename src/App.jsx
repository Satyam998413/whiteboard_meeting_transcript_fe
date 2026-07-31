import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import BoardSettingsPage from './pages/BoardSettingsPage';
import WorkspacePage from './pages/WorkspacePage';
import SharePage from './pages/SharePage';
import HomePage from './pages/HomePage';
import Header from './components/Header';
import ToastProvider from './components/ToastProvider';
import RequireAuth from './components/RequireAuth';
import { selectIsAuthenticated, loginSuccess } from './store/authSlice';
import { setAuthToken } from './api/apiClient';

// Axe accessibility testing in development only — dynamic import so it's never bundled/loaded
// in production and never throws in environments where the optional dependency isn't installed.
if (import.meta.env.DEV) {
  import('@axe-core/react')
    .then((axe) => {
      if (typeof axe.default === 'function') axe.default(React, 1000, {});
    })
    .catch(() => {});
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
        <div className="flex min-h-screen flex-col">
          <a href="#main" className="sr-only">
            Skip to main content
          </a>
          {isAuthenticated && <Header />}
          <main id="main" role="main" className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <DashboardPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/workspaces/:workspaceId"
                element={
                  <RequireAuth>
                    <WorkspacePage />
                  </RequireAuth>
                }
              />
              <Route
                path="/boards/:boardId"
                element={
                  <RequireAuth>
                    <BoardPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/boards/:boardId/settings"
                element={
                  <RequireAuth>
                    <BoardSettingsPage />
                  </RequireAuth>
                }
              />
              <Route path="/share/:token" element={<SharePage />} />
              <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
