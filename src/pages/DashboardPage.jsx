import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient, { setAuthToken } from '../api/apiClient';
import { selectAuthUser, logout as logoutAction } from '../store/authSlice';
import { setBoards, selectBoards, addBoard, updateBoard } from '../store/boardSlice';
import { useToast } from '../components/ToastProvider';
import Button from '../components/ui/Button';

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function BoardCard({ board, onToggleStar }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
      whileHover={{ y: -4 }}
      className="glass group relative flex flex-col justify-between p-5"
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          onToggleStar(board);
        }}
        aria-label={board.starred ? `Unstar ${board.title}` : `Star ${board.title}`}
        className={`absolute right-3 top-3 text-lg transition-opacity ${
          board.starred ? 'text-yellow-400' : 'text-text-secondary opacity-0 group-hover:opacity-100'
        }`}
      >
        {board.starred ? '★' : '☆'}
      </button>
      <Link to={`/boards/${board._id}`} className="block">
        <h2 className="mb-1 truncate pr-6 text-lg font-semibold">{board.title}</h2>
        <p className="truncate text-sm text-text-secondary">{board.meta?.description || 'Open the board to continue editing.'}</p>
        <p className="mt-3 text-xs text-text-secondary">
          {board.lastOpenedAt ? `Opened ${new Date(board.lastOpenedAt).toLocaleDateString()}` : 'Never opened'}
        </p>
      </Link>
    </motion.div>
  );
}

function DashboardPage() {
  const boards = useSelector(selectBoards);
  const user = useSelector(selectAuthUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/api/boards', { params: debouncedSearch ? { q: debouncedSearch } : {} });
      dispatch(setBoards(data || []));
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load boards');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBoards();
  }, [user, navigate, fetchBoards]);

  const handleCreateBoard = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    try {
      setLoading(true);
      const { data } = await apiClient.post('/api/boards', { title });
      dispatch(addBoard(data));
      setTitle('');
      showToast('Board created');
      navigate(`/boards/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create board');
    } finally {
      setLoading(false);
    }
  };

  const toggleStar = async (board) => {
    try {
      const { data } = await apiClient.put(`/api/boards/${board._id}`, { starred: !board.starred });
      dispatch(updateBoard(data));
    } catch (e) {
      showToast('Could not update board');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('auth');
    } catch (e) {}
    setAuthToken(null);
    dispatch(logoutAction());
    navigate('/login');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-8 flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-text-secondary">Your boards live here. Create a new board to start collaborating.</p>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Log out
        </Button>
      </motion.div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleCreateBoard} aria-label="Create board" className="flex flex-1 gap-3">
          <label htmlFor="new-board-title" className="sr-only">
            New board name
          </label>
          <input
            id="new-board-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New board name"
            className="flex-1 rounded border border-border bg-transparent px-3.5 py-2.5 text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
          />
          <Button type="submit" loading={loading}>
            Create
          </Button>
        </form>
        <div>
          <label htmlFor="board-search" className="sr-only">
            Search boards by title or owner
          </label>
          <input
            id="board-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or owner…"
            className="w-full rounded border border-border bg-transparent px-3.5 py-2.5 text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none sm:w-64"
          />
        </div>
      </div>

      {error && <p className="mb-4 text-red-400">{error}</p>}

      <div role="region" aria-label="Boards list">
        {boards.length === 0 && !loading ? (
          <p className="text-text-secondary">No boards yet. Create one to get started.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {boards.map((board) => (
                <BoardCard key={board._id} board={board} onToggleStar={toggleStar} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
