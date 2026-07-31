import React from 'react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import apiClient, { setAuthToken } from '../api/apiClient';
import { signupSuccess } from '../store/authSlice';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiClient.post('/api/auth/signup', { email, password });
      dispatch(signupSuccess(data));
      try { localStorage.setItem('auth', JSON.stringify(data)); } catch (e) {}
      setAuthToken(data.accessToken);
      await apiClient.post('/api/auth/request-otp', { email });
      navigate('/verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="flex-center full-height">
      <div className="form-card">
        <form onSubmit={handleSubmit} className="signup-form" style={{ width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Create Account</h2>
        {error && <p style={{ color: '#ff6b6b', marginBottom: '1rem' }}>{error}</p>}
        <div style={{ marginBottom: '1rem' }}>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          />
        </div>
        <button type="submit" className="btn" style={{ width: '100%' }}>Sign Up</button>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account? <a href="/login" style={{ color: 'var(--color-primary)' }}>Log In</a>
        </p>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
