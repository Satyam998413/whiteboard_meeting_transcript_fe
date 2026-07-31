import React, { useCallback, useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/apiClient';
import { useToast } from '../components/ToastProvider';
import { selectAuthUser } from '../store/authSlice';
import useYjsBoard from '../realtime/useYjsBoard';
import usePresence from '../realtime/usePresence';
import BoardHeader from '../components/BoardHeader';
import Canvas from '../components/Canvas';
import NotesPanel from '../components/NotesPanel';
import PresenceLayer from '../components/PresenceLayer';
import Toolbar from '../components/ui/Toolbar';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

function ExportMenu({ board, showToast }) {
  const [open, setOpen] = useState(false);
  const safeName = (board.title || 'board').replace(/[^a-z0-9-_]/gi, '_');

  const runExport = async (action) => {
    setOpen(false);
    try {
      await action();
      showToast('Export ready');
    } catch (e) {
      showToast('Export failed');
    }
  };

  const exportText = () =>
    runExport(async () => {
      const resp = await apiClient.get(`/api/boards/${board._id}/export`, { responseType: 'blob' });
      downloadBlob(new Blob([resp.data], { type: 'text/plain' }), `${safeName}.txt`);
    });

  const exportMarkdown = () =>
    runExport(async () => {
      const resp = await apiClient.get(`/api/boards/${board._id}/export/markdown`, { responseType: 'blob' });
      downloadBlob(new Blob([resp.data], { type: 'text/markdown' }), `${safeName}.md`);
    });

  const exportPdf = () =>
    runExport(async () => {
      let canvasDataUrl = null;
      const el = document.querySelector('[data-canvas-root]');
      if (el) {
        const c = await html2canvas(el, { backgroundColor: null });
        canvasDataUrl = c.toDataURL('image/png');
      }
      const resp = await apiClient.post(`/api/boards/${board._id}/export/pdf`, { canvasDataUrl }, { responseType: 'blob' });
      downloadBlob(new Blob([resp.data], { type: 'application/pdf' }), `${safeName}.pdf`);
    });

  return (
    <div className="relative">
      <Button variant="secondary" size="sm" onClick={() => setOpen((o) => !o)}>
        Export ▾
      </Button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.14 }}
              className="glass absolute right-0 z-20 mt-2 w-44 overflow-hidden p-1"
            >
              <button onClick={exportPdf} className="w-full rounded px-3 py-2 text-left text-sm hover:bg-surface-hover">
                Export as PDF
              </button>
              <button onClick={exportMarkdown} className="w-full rounded px-3 py-2 text-left text-sm hover:bg-surface-hover">
                Export as Markdown
              </button>
              <button onClick={exportText} className="w-full rounded px-3 py-2 text-left text-sm hover:bg-surface-hover">
                Export notes (.txt)
              </button>
              <a
                href={`${apiClient.defaults.baseURL}/api/boards/${board._id}/export/docx`}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-surface-hover"
              >
                Export as DOCX
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShareModal({ open, onClose, board, showToast }) {
  const [shares, setShares] = useState([]);
  const [expiresInDays, setExpiresInDays] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/api/boards/${board._id}/share`);
      setShares(data || []);
    } catch (e) {
      // non-fatal, list stays empty
    }
  }, [board._id]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const createShare = async () => {
    setLoading(true);
    try {
      await apiClient.post(`/api/boards/${board._id}/share`, {
        expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
      });
      showToast('Share link created');
      setExpiresInDays('');
      load();
    } catch (e) {
      showToast(e.response?.data?.error || 'Could not create share link');
    } finally {
      setLoading(false);
    }
  };

  const revoke = async (shareId) => {
    try {
      await apiClient.delete(`/api/boards/${board._id}/share/${shareId}`);
      showToast('Share link revoked');
      load();
    } catch (e) {
      showToast('Could not revoke link');
    }
  };

  const copyLink = async (token) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
      showToast('Link copied to clipboard');
    } catch (e) {
      showToast('Could not copy link');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Share board" width="max-w-lg">
      <div className="space-y-4">
        <div className="flex items-end gap-3">
          <Input
            label="Expires in (days, optional)"
            type="number"
            min="1"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
            placeholder="Never"
          />
          <Button onClick={createShare} loading={loading}>
            Create link
          </Button>
        </div>

        <div className="space-y-2">
          {shares.length === 0 && <p className="text-sm text-text-secondary">No share links yet.</p>}
          {shares.map((s) => (
            <div key={s._id} className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className={`truncate ${s.revoked ? 'text-text-secondary line-through' : ''}`}>{s.token}</p>
                <p className="text-xs text-text-secondary">
                  {s.revoked ? 'Revoked' : s.expiresAt ? `Expires ${new Date(s.expiresAt).toLocaleDateString()}` : 'Never expires'}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {!s.revoked && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => copyLink(s.token)}>
                      Copy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => revoke(s._id)}>
                      Revoke
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function VersionsModal({ open, onClose, board, showToast }) {
  const [versions, setVersions] = useState([]);
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/api/boards/${board._id}/versions`);
      setVersions(data || []);
    } catch (e) {
      // non-fatal
    }
  }, [board._id]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const saveVersion = async () => {
    setSaving(true);
    try {
      await apiClient.post(`/api/boards/${board._id}/versions`, { label });
      showToast('Version saved');
      setLabel('');
      load();
    } catch (e) {
      showToast(e.response?.data?.error || 'Could not save version');
    } finally {
      setSaving(false);
    }
  };

  const restore = async (versionId) => {
    try {
      await apiClient.post(`/api/boards/${board._id}/versions/${versionId}/restore`);
      showToast('Board restored — syncing latest content…');
      onClose();
    } catch (e) {
      showToast('Could not restore this version');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Version history" width="max-w-lg">
      <div className="space-y-4">
        <div className="flex items-end gap-3">
          <Input label="Label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Before redesign" />
          <Button onClick={saveVersion} loading={saving}>
            Save version
          </Button>
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto">
          {versions.length === 0 && <p className="text-sm text-text-secondary">No saved versions yet.</p>}
          {versions.map((v) => (
            <div key={v._id} className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm">
              <div>
                <p>{v.label || 'Untitled version'}</p>
                <p className="text-xs text-text-secondary">{new Date(v.createdAt).toLocaleString()}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => restore(v._id)}>
                Restore
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectAuthUser);
  const { showToast } = useToast();

  const [board, setBoard] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#0d9488');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [undoState, setUndoState] = useState({ canUndo: false, canRedo: false });
  const [shareOpen, setShareOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);

  const canvasRef = useRef(null);
  const handleUndoStateChange = useCallback((s) => setUndoState(s), []);

  const { doc, awareness, connected, synced, role, error: realtimeError } = useYjsBoard(boardId, user);
  usePresence(awareness);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.get(`/api/boards/${boardId}`);
        if (!cancelled) setBoard(data);
        apiClient.patch(`/api/boards/${boardId}/open`).catch(() => {});
      } catch (err) {
        if (!cancelled) setLoadError(err.response?.data?.error || 'Board could not be loaded');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  const handleRename = async (title) => {
    try {
      const { data } = await apiClient.put(`/api/boards/${boardId}`, { title });
      setBoard(data);
    } catch (e) {
      showToast('Could not rename board');
    }
  };

  const readOnly = role !== 'editor' && role !== 'owner';

  if (loadError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <p className="text-red-400">{loadError}</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <p className="text-text-secondary">Loading board...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="mx-auto flex h-[calc(100vh-1rem)] max-w-[1600px] flex-col gap-3 p-3 md:p-4"
    >
      <BoardHeader
        board={board}
        connected={connected}
        onRename={handleRename}
        onOpenShare={() => setShareOpen(true)}
        onOpenVersions={() => setVersionsOpen(true)}
        onOpenSettings={() => navigate(`/boards/${boardId}/settings`)}
        exportMenu={<ExportMenu board={board} showToast={showToast} />}
      />

      {!readOnly && (
        <Toolbar
          tool={tool}
          onToolChange={setTool}
          color={color}
          onColorChange={setColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          onUndo={() => canvasRef.current?.undo()}
          onRedo={() => canvasRef.current?.redo()}
          canUndo={undoState.canUndo}
          canRedo={undoState.canRedo}
        />
      )}

      {realtimeError && <p className="text-sm text-red-400">{realtimeError}</p>}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[1fr_340px]">
        <div className="relative min-h-[360px]" data-canvas-root>
          {synced ? (
            <Canvas
              ref={canvasRef}
              doc={doc}
              awareness={awareness}
              tool={tool}
              color={color}
              strokeWidth={strokeWidth}
              readOnly={readOnly}
              onUndoStateChange={handleUndoStateChange}
            />
          ) : (
            <div className="flex h-full min-h-[360px] items-center justify-center rounded-lg border border-border bg-[#0c0c0c] text-text-secondary">
              Connecting to board…
            </div>
          )}
          <PresenceLayer />
        </div>

        <div className="min-h-[240px] lg:min-h-0">
          {synced ? (
            <NotesPanel doc={doc} awareness={awareness} readOnly={readOnly} user={user} />
          ) : (
            <div className="glass flex h-full min-h-[240px] items-center justify-center text-text-secondary">Connecting…</div>
          )}
        </div>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} board={board} showToast={showToast} />
      <VersionsModal open={versionsOpen} onClose={() => setVersionsOpen(false)} board={board} showToast={showToast} />
    </motion.div>
  );
}
