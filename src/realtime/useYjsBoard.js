import { useEffect, useMemo, useState } from 'react';
import * as Y from 'yjs';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness.js';
import { connectSocket } from './socket';

const randomColor = () => {
  const palette = ['#0d9488', '#f97316', '#a855f7', '#ef4444', '#3b82f6', '#eab308', '#ec4899'];
  return palette[Math.floor(Math.random() * palette.length)];
};

// Shared by Canvas + NotesPanel for a single board: one Y.Doc, one Awareness instance, one
// socket subscription. Custom Yjs "provider" riding the app's existing Socket.IO connection
// instead of a separate y-websocket server — see board:join/yjs-update/yjs-awareness on the
// backend (src/realtime/boardSocketHandlers.js) for the matching wire protocol.
export default function useYjsBoard(boardId, user) {
  const [connected, setConnected] = useState(false);
  const [synced, setSynced] = useState(false);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  // Bumped on a server-pushed "board:restored" event. Applying a restored (older) snapshot as a
  // merge-update into the client's existing doc wouldn't roll anything back — CRDT merges are a
  // union, never a subtraction — so the only correct way to reflect a restore is to throw away
  // the local doc entirely and rehydrate a fresh one. Bumping epoch forces the memos below to do
  // exactly that.
  const [epoch, setEpoch] = useState(0);

  // Listen for restores independent of the doc's own lifecycle — this listener must survive
  // doc/awareness being recreated, since detecting the restore is what triggers that recreation.
  useEffect(() => {
    if (!boardId) return undefined;
    const socket = connectSocket();
    const onRestored = (payload) => {
      if (payload?.boardId !== boardId) return;
      setEpoch((e) => e + 1);
    };
    socket.on('board:restored', onRestored);
    return () => socket.off('board:restored', onRestored);
  }, [boardId]);

  const doc = useMemo(() => new Y.Doc(), [boardId, epoch]);
  const awareness = useMemo(() => new Awareness(doc), [doc]);

  useEffect(() => {
    return () => {
      awareness.destroy();
      doc.destroy();
    };
  }, [doc, awareness]);

  useEffect(() => {
    if (!boardId || !user) return undefined;

    const socket = connectSocket();
    let cancelled = false;
    setSynced(false);

    awareness.setLocalStateField('user', { id: user.id, name: user.email, color: randomColor() });

    const onUpdate = (update, origin) => {
      if (origin === 'remote') return; // don't echo server-originated updates back
      socket.emit('yjs-update', { boardId, update });
    };
    const onAwarenessUpdate = ({ added, updated, removed }, origin) => {
      if (origin === 'remote') return;
      const changed = added.concat(updated, removed);
      if (changed.length === 0) return;
      socket.emit('yjs-awareness', { boardId, update: encodeAwarenessUpdate(awareness, changed) });
    };
    const onRemoteUpdate = (payload) => {
      if (payload?.boardId !== boardId) return;
      Y.applyUpdate(doc, new Uint8Array(payload.update), 'remote');
    };
    const onRemoteAwareness = (payload) => {
      if (payload?.boardId !== boardId) return;
      applyAwarenessUpdate(awareness, new Uint8Array(payload.update), 'remote');
    };
    const onConnect = () => setConnected(true);
    const onDisconnect = () => {
      setConnected(false);
      setSynced(false);
    };

    const join = () => {
      socket.emit('board:join', { boardId }, (ack) => {
        if (cancelled) return;
        if (!ack?.ok) {
          setError(ack?.error || 'Failed to join board');
          return;
        }
        setError(null);
        setRole(ack.role);
        Y.applyUpdate(doc, new Uint8Array(ack.state), 'remote');
        if (ack.awareness) applyAwarenessUpdate(awareness, new Uint8Array(ack.awareness), 'remote');
        setSynced(true);
      });
    };

    doc.on('update', onUpdate);
    awareness.on('update', onAwarenessUpdate);
    socket.on('yjs-update', onRemoteUpdate);
    socket.on('yjs-awareness', onRemoteAwareness);
    socket.on('connect', onConnect);
    socket.on('connect', join);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) {
      setConnected(true);
      join();
    } else {
      socket.connect();
    }

    return () => {
      cancelled = true;
      doc.off('update', onUpdate);
      awareness.off('update', onAwarenessUpdate);
      socket.off('yjs-update', onRemoteUpdate);
      socket.off('yjs-awareness', onRemoteAwareness);
      socket.off('connect', onConnect);
      socket.off('connect', join);
      socket.off('disconnect', onDisconnect);
      socket.emit('board:leave', { boardId });
    };
  }, [boardId, user?.id, doc, awareness]);

  return { doc, awareness, connected, synced, role, error };
}
