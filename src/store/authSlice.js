// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
const authData = localStorage.getItem('auth')?JSON.parse(localStorage.getItem('auth')):null;

const initialState = {
  user: authData?.user || null,
  accessToken: authData?.accessToken || null,
  isAuthenticated: authData?.accessToken ? true : false,
  loading: false,
  error: null,
};

// Refresh token is cookie-only (HttpOnly, set by the backend) — never held in JS-accessible
// state, so it can't be read by an XSS payload or leaked into localStorage.
const applySession = (state, action) => {
  const { user, accessToken } = action.payload;
  localStorage.setItem('auth', JSON.stringify({ user, accessToken }));
  state.user = user;
  state.accessToken = accessToken;
  state.isAuthenticated = true;
  state.loading = false;
  state.error = null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: applySession,
    signupSuccess: applySession,
    verifySuccess: applySession,
    logout(state) {
      localStorage.removeItem('auth');
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { loginSuccess, signupSuccess, verifySuccess, logout, setLoading, setError } = authSlice.actions;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthAccessToken = (state) => state.auth.accessToken;
export default authSlice.reducer;
