import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { verifySuccess } from '../store/authSlice';

function VerifyPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiClient.post('/api/auth/verify-otp', { email, otp });
      dispatch(verifySuccess(data));
      apiClient.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    }
  };

  return (
    <div className="flex-center full-height glass" style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
      <form onSubmit={handleSubmit} className="verify-form" style={{ width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Enter OTP</h2>
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
            id="otp"
            type="text"
            placeholder="One‑time password"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="input-field"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          />
        </div>
        <button type="submit" className="btn" style={{ width: '100%' }}>Verify</button>
      </form>
    </div>
  );
}

export default VerifyPage;
