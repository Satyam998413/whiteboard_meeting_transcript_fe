import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import { useToast } from '../components/ToastProvider';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

function WorkspacePage() {
  const { workspaceId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [inviting, setInviting] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/api/workspaces/${workspaceId}`);
      setData(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load workspace');
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const addMember = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      await apiClient.post(`/api/workspaces/${workspaceId}/members`, { email, role });
      showToast('Member added');
      setEmail('');
      load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not add member');
    } finally {
      setInviting(false);
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <p className="text-text-secondary">Loading workspace...</p>
      </div>
    );
  }

  const { workspace, members, boards } = data;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold">{workspace.name}</h1>
      <p className="mb-8 text-text-secondary">
        {members.length} member{members.length === 1 ? '' : 's'} · {boards.length} board{boards.length === 1 ? '' : 's'}
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">Boards</h2>
          {boards.length === 0 ? (
            <p className="text-text-secondary">No boards in this workspace yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {boards.map((b) => (
                <Link key={b._id} to={`/boards/${b._id}`} className="glass block p-4 transition-transform hover:-translate-y-0.5">
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="mt-1 text-xs text-text-secondary">Updated {new Date(b.updatedAt).toLocaleDateString()}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">Members</h2>
          <div className="glass mb-4 divide-y divide-border">
            {members.map((m) => (
              <div key={m.userId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="truncate">{m.email || m.userId}</span>
                <span className="text-xs uppercase text-text-secondary">{m.role}</span>
              </div>
            ))}
          </div>

          <form onSubmit={addMember} className="glass space-y-3 p-4">
            <Input label="Invite by email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary" htmlFor="member-role">
                Role
              </label>
              <select
                id="member-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text-primary"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <Button type="submit" className="w-full" loading={inviting}>
              Add member
            </Button>
          </form>
        </section>
      </div>
    </motion.div>
  );
}

export default WorkspacePage;
