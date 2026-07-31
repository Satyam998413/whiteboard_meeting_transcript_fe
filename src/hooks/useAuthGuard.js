import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectAuthUser } from '../store/authSlice';

export default function useAuthGuard() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectAuthUser);
  return { isAuthenticated, user };
}
