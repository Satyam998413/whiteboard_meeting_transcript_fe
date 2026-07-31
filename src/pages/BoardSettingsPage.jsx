import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import { useToast } from '../components/ToastProvider';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

function BoardSettingsPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [board, setBoard] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.get(`/api/boards/${boardId}`);
        if (!cancelled) {
          setBoard(data);
          setTitle(data.title);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || 'Board could not be loaded');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await apiClient.put(`/api/boards/${boardId}`, { title });
      setBoard(data);
      showToast('Board updated');
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not update board');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.delete(`/api/boards/${boardId}`);
      showToast('Board deleted');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not delete board — only the owner can delete a board');
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="p-8">
        <p className="text-text-secondary">Loading board...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="mx-auto max-w-xl px-4 py-10">
      <Link to={`/boards/${boardId}`} className="mb-6 inline-block text-sm text-text-secondary hover:text-text-primary">
        ← Back to board
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">Board settings</h1>

      <form onSubmit={handleSave} className="glass mb-8 space-y-4 p-6">
        <Input label="Board title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </form>

      <div className="glass space-y-3 border border-red-500/30 p-6">
        <h2 className="font-semibold text-red-400">Danger zone</h2>
        <p className="text-sm text-text-secondary">Deleting a board permanently removes its canvas, notes, and history. Only the owner can do this.</p>
        {confirmDelete ? (
          <div className="flex gap-3">
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Confirm delete
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            Delete board
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default BoardSettingsPage;
