import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import ReadOnlyCanvasPreview from '../components/ReadOnlyCanvasPreview';

function SharePage() {
  const { token } = useParams();
  const [board, setBoard] = useState(null);
  const [error, setError] = useState('');

  // 1. Get user and authentication state from Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.get(`/api/share/${token}`);
        if (!cancelled) {
          // Handle wrapped responses like { board: { ... } } or flat response
          setBoard(data.board || data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Could not load shared board');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <p className="text-text-secondary">Loading shared board...</p>
      </div>
    );
  }

  // 2. Identify the board ID and check if the current user is the owner
  const boardId = board._id || board.id || board.boardId;
  const ownerId = board.owner?._id || board.owner || board.ownerId;
  const currentUserId = user?._id || user?.id;

  const isOwner = Boolean(currentUserId && ownerId && String(currentUserId) === String(ownerId));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">View only</p>
        <h1 className="text-2xl font-semibold">{board.title}</h1>
        <p className="text-text-secondary">{board.meta?.description || 'This board is shared publicly via link.'}</p>
      </header>

      <section className="space-y-4">
        <div className="glass p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">Canvas</h2>
          <ReadOnlyCanvasPreview snapshotBase64={board.snapshot} />
        </div>
        <div className="glass p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">Notes</h2>
          <p className="whitespace-pre-wrap text-sm text-text-primary">{board.meta?.notes || 'No notes yet.'}</p>
        </div>

        {/* Dynamic CTA Footer based on User Role & Auth State */}
        <div className="glass flex flex-wrap items-center justify-between gap-3 p-4">
          {isAuthenticated ? (
            isOwner ? (
              // CASE 1: User is the Owner -> Can open & edit
              <>
                <div>
                  <p className="text-sm font-medium text-text-primary">Welcome back, {user?.name || 'Owner'}!</p>
                  <p className="text-xs text-text-secondary">You own this board and have full edit access.</p>
                </div>
                <Link
                  to={`/boards/${boardId}`}
                  className="inline-flex items-center justify-center rounded bg-gradient-to-br from-primary to-primary-dark px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md"
                >
                  Open & Collaborate
                </Link>
              </>
            ) : (
              // CASE 2: User is Logged In, but NOT the Owner -> Access Denied
              <>
                <div>
                  <p className="text-sm font-medium text-red-400">Collaborate Access Denied</p>
                  <p className="text-xs text-text-secondary">Only the owner of this board can edit and collaborate live.</p>
                </div>
                <button
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center rounded bg-gray-600 px-4 py-2 text-sm font-medium text-gray-300 opacity-60"
                >
                  View Only Mode
                </button>
              </>
            )
          ) : (
            // CASE 3: Guest / Not Logged In -> Prompt to Sign In
            <>
              <p className="text-sm text-text-secondary">Sign in to view user privileges or manage your boards.</p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded bg-gradient-to-br from-primary to-primary-dark px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>
    </motion.div>
  );
}

export default SharePage;