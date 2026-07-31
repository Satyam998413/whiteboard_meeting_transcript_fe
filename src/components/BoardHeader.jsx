import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectCollaborators } from '../store/presenceSlice';
import Button from './ui/Button';

export default function BoardHeader({ board, connected, onRename, onOpenShare, onOpenVersions, onOpenSettings, exportMenu }) {
  const collaborators = useSelector(selectCollaborators);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(board.title);

  const commit = () => {
    setEditing(false);
    if (title.trim() && title !== board.title) onRename(title.trim());
  };

  return (
    <div className="glass flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0 flex-1">
        <nav className="mb-1 flex items-center gap-1 text-xs text-text-secondary">
          <Link to="/dashboard" className="hover:text-text-primary">
            Dashboard
          </Link>
          {board.workspaceId && (
            <>
              <span>/</span>
              <Link to={`/workspaces/${board.workspaceId}`} className="hover:text-text-primary">
                Workspace
              </Link>
            </>
          )}
          <span>/</span>
          <span className={`inline-flex items-center gap-1 ${connected ? 'text-primary' : 'text-text-secondary'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-primary' : 'bg-text-secondary'}`} />
            {connected ? 'Live' : 'Connecting…'}
          </span>
        </nav>
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            className="w-full max-w-md rounded border border-primary bg-transparent px-2 py-1 text-xl font-semibold text-text-primary outline-none"
          />
        ) : (
          <h1
            className="cursor-text truncate text-xl font-semibold hover:text-primary"
            onClick={() => setEditing(true)}
            title="Click to rename"
          >
            {board.title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex -space-x-2" aria-label="Collaborators online">
          {collaborators.slice(0, 5).map((c) => (
            <motion.div
              key={c.clientId}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg text-xs font-semibold text-white"
              style={{ backgroundColor: c.user?.color || '#0d9488' }}
              title={c.user?.name}
            >
              {(c.user?.name || '?').slice(0, 1).toUpperCase()}
            </motion.div>
          ))}
        </div>

        <Button variant="secondary" size="sm" onClick={onOpenVersions}>
          History
        </Button>
        <Button variant="secondary" size="sm" onClick={onOpenShare}>
          Share
        </Button>
        {onOpenSettings && (
          <Button variant="ghost" size="sm" onClick={onOpenSettings}>
            Settings
          </Button>
        )}
        {exportMenu}
      </div>
    </div>
  );
}
