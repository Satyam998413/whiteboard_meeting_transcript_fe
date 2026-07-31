import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
  refreshSubscribers.push(cb);
};

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const clearAuth = () => {
  try {
    localStorage.removeItem('auth');
  } catch (e) {}
  setAuthToken(null);
};

// Backend responses are uniformly { success, data, meta? } / { success:false, error }. Unwrap
// the envelope here once so every call site can keep doing `const { data } = await apiClient...`
// and get the actual payload, not the wrapper.
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
      if (response.data.meta) response.meta = response.data.meta;
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    // Backend error shape is { success:false, error:{ code, message, details? } }. Flatten
    // error.response.data.error down to the message string so every call site can keep doing
    // `err.response?.data?.error` and get a renderable string, not an object.
    if (error.response?.data?.error && typeof error.response.data.error === 'object') {
      error.response.data.error = error.response.data.error.message || 'Something went wrong';
    }

    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;
      try {
        const resp = await apiClient.post('/api/auth/refresh');
        const newAccess = resp.data?.accessToken;
        if (newAccess) {
          try {
            const raw = localStorage.getItem('auth');
            const parsed = raw ? JSON.parse(raw) : {};
            localStorage.setItem('auth', JSON.stringify({ ...parsed, accessToken: newAccess }));
          } catch (e) {}
          setAuthToken(newAccess);
          onRefreshed(newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        onRefreshed(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
