import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import SharePage from './pages/SharePage';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, loginSuccess } from './store/authSlice';
import { useEffect } from 'react';
import { setAuthToken } from './api/apiClient';

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
    </Router>
  );
}

export default App;
