import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient, { setAuthToken } from '../api/apiClient';
import { verifySuccess } from '../store/authSlice';
import { useToast } from '../components/ToastProvider';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

function VerifyPage() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.post('/api/auth/verify-otp', { email, otp });
      dispatch(verifySuccess(data));
      try {
        localStorage.setItem('auth', JSON.stringify(data));
      } catch (e) {}
      setAuthToken(data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Enter your email first');
      return;
    }
    setResending(true);
    try {
      await apiClient.post('/api/auth/request-otp', { email });
      showToast('A new code was sent to your email');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle="Enter the 6-digit code we sent you">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Input
          label="One-time code"
          type="text"
          inputMode="numeric"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          autoComplete="one-time-code"
        />
        <Button type="submit" className="w-full" loading={loading}>
          Verify
        </Button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full text-center text-sm text-text-secondary hover:text-primary disabled:opacity-50"
        >
          {resending ? 'Sending…' : "Didn't get a code? Resend"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default VerifyPage;
