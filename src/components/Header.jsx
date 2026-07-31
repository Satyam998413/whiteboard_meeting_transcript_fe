import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { selectAuthUser, logout as logoutAction } from '../store/authSlice';
import { setAuthToken } from '../api/apiClient';
import Button from './ui/Button';

export default function Header() {
  const user = useSelector(selectAuthUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.removeItem('auth');
    } catch (e) {}
    setAuthToken(null);
    dispatch(logoutAction());
    navigate('/login');
  };

  return (
    <header aria-label="Main header" className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
      <Link to="/dashboard" className="font-bold tracking-tight">
        Whiteboard
      </Link>
      <div className="flex items-center gap-3">
        {user && <span className="hidden text-sm text-text-secondary sm:inline">{user.email}</span>}
        <Button variant="secondary" size="sm" onClick={handleLogout} aria-label="Log out">
          Log out
        </Button>
      </div>
    </header>
  );
}
