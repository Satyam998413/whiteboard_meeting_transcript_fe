import { io } from 'socket.io-client';
import store from '../store/store';
import { selectAuthAccessToken } from '../store/authSlice';

let socket = null;

// One shared connection for the whole app (board rooms, presence, everything rides this).
// `auth` is a function so it's re-evaluated on every (re)connect attempt, picking up a
// post-refresh access token automatically instead of baking in a stale one at creation time.
export function getSocket() {
  if (socket) return socket;

  const url = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  socket = io(url, {
    autoConnect: false,
    withCredentials: true,
    auth: (cb) => cb({ token: selectAuthAccessToken(store.getState()) }),
  });
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}

export default getSocket;
