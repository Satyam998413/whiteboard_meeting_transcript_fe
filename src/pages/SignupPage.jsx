import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import apiClient, { setAuthToken } from '../api/apiClient';
import { signupSuccess } from '../store/authSlice';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // /signup already generates and emails the first OTP — no need to call /request-otp again.
      const { data } = await apiClient.post('/api/auth/signup', { email, password });
      dispatch(signupSuccess(data));
      try {
        localStorage.setItem('auth', JSON.stringify(data));
      } catch (e) {}
      setAuthToken(data.accessToken);
      navigate('/verify', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start collaborating on a real-time whiteboard"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          hint="At least 8 characters."
        />
        <Button type="submit" className="w-full" loading={loading}>
          Sign Up
        </Button>
      </form>
    </AuthLayout>
  );
}

export default SignupPage;
