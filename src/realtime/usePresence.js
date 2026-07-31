import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCollaborators, clearCollaborators } from '../store/presenceSlice';

// Mirrors the shared Awareness instance's remote states (everyone but this tab) into Redux so
// PresenceLayer/BoardHeader can render avatar stacks + cursors without touching Yjs directly.
export default function usePresence(awareness) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!awareness) return undefined;

    const sync = () => {
      const list = Array.from(awareness.getStates().entries())
        .filter(([clientId]) => clientId !== awareness.doc.clientID)
        .map(([clientId, state]) => ({ clientId, user: state.user || null, cursor: state.cursor || null }))
        .filter((entry) => entry.user);
      dispatch(setCollaborators(list));
    };

    awareness.on('change', sync);
    sync();

    return () => {
      awareness.off('change', sync);
      dispatch(clearCollaborators());
    };
  }, [awareness, dispatch]);
}
