import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
      dispatch({ type: 'auth/loginSuccess', payload: data });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex-center full-height glass" style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
      <form onSubmit={handleSubmit} className="login-form" style={{ width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Sign In</h2>
        {error && <p style={{ color: '#ff6b6b', marginBottom: '1rem' }}>{error}</p>}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" className="sr-only">Email</label>
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
          <label htmlFor="password" className="sr-only">Password</label>
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
        <button type="submit" className="btn" style={{ width: '100%' }}>Log In</button>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          No account? <a href="/signup" style={{ color: 'var(--color-primary)' }}>Sign up</a>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
