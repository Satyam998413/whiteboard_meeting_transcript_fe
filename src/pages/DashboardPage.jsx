import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import apiClient from '../api/apiClient';
import { selectAuthUser, logout as logoutAction } from '../store/authSlice';
import { setAuthToken } from '../api/apiClient';
import { useToast } from '../components/ToastProvider';

function DashboardPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const user = useSelector(selectAuthUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBoards = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/api/boards');
        setBoards(data.data || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Could not load boards');
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [user, navigate]);

  const handleCreateBoard = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    try {
      setLoading(true);
      const { data } = await apiClient.post('/api/boards', { title });
      setBoards((current) => [data.data, ...current]);
      setTitle('');
      try { showToast('Board created'); } catch (e) {}
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create board');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex-center full-height' style={{ padding: '2rem' }}>
      <div className='glass' style={{ width: '100%', maxWidth: '900px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>Your boards live here. Create a new board to start collaborating.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                // clear stored auth and unset API token
                try { localStorage.removeItem('auth'); } catch (e) {}
                setAuthToken(null);
                dispatch(logoutAction());
                navigate('/login');
              }}
              className='btn'
            >
              Log out
            </button>
          </div>
        </div>

          <form onSubmit={handleCreateBoard} aria-label="Create board" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='New board name'
            className='input-field'
            style={{ flex: 1, padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
          />
          <button type='submit' className='btn'>Create</button>
        </form>

        {error && <p style={{ color: '#ff6b6b', marginTop: '1rem' }}>{error}</p>}
        {loading && <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>Loading boards...</p>}

          <div style={{ marginTop: '2rem' }} role="region" aria-label="Boards list">
          {boards.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>No boards yet. Create one to get started.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {boards.map((board) => (
                <Link
                  key={board._id || board.id}
                  to={`/boards/${board._id || board.id}`}
                  className='board-card'
                >
                  <h2 style={{ marginBottom: '0.5rem' }}>{board.title}</h2>
                  <p className='board-meta'>
                    {board.meta?.description || 'Open the board to continue editing.'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
