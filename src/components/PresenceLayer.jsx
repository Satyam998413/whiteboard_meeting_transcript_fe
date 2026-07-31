import React from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectCollaborators } from '../store/presenceSlice';

// Absolute overlay rendered on top of Canvas — shares the same coordinate space since the
// cursor positions were captured via the Konva Stage's own getPointerPosition().
export default function PresenceLayer() {
  const collaborators = useSelector(selectCollaborators);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <AnimatePresence>
        {collaborators
          .filter((c) => c.cursor)
          .map((c) => (
            <motion.div
              key={c.clientId}
              className="absolute flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, x: c.cursor.x, y: c.cursor.y }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 40, mass: 0.4 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill={c.user?.color || '#0d9488'}>
                <path d="M1 1l6 13 2-5 5-2z" />
              </svg>
              <span
                className="whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium text-white shadow"
                style={{ backgroundColor: c.user?.color || '#0d9488' }}
              >
                {c.user?.name}
              </span>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
