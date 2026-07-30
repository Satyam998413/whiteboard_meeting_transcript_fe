import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAuthUser, logout as logoutAction } from '../store/authSlice';
import { setAuthToken } from '../api/apiClient';

export default function Header() {
  const user = useSelector(selectAuthUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    try { localStorage.removeItem('auth'); } catch (e) {}
    setAuthToken(null);
    dispatch(logoutAction());
    navigate('/login');
  };

  return (
    <header aria-label="Main header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontWeight: 700 }}>Whiteboard</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {user && <div style={{ color: 'var(--color-text-secondary)' }}>{user.email}</div>}
        <button onClick={handleLogout} className="btn" aria-label="Log out">Log out</button>
      </div>
    </header>
  );
}
