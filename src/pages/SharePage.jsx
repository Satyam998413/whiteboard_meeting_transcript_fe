import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import ReadOnlyCanvasPreview from '../components/ReadOnlyCanvasPreview';

function SharePage() {
  const { token } = useParams();
  const [board, setBoard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.get(`/api/share/${token}`);
        if (!cancelled) setBoard(data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || 'Could not load shared board');
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
        <div className="glass flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-text-secondary">Sign in to edit and collaborate live.</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded bg-gradient-to-br from-primary to-primary-dark px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md"
          >
            Sign in
          </Link>
        </div>
      </section>
    </motion.div>
  );
}

export default SharePage;
