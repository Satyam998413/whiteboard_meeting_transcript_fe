import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEATURES = [
  { title: 'Real-time canvas', desc: 'Draw, sketch shapes, and drop sticky notes together, live.' },
  { title: 'Shared meeting notes', desc: 'A collaborative rich-text panel synced right alongside the board.' },
  { title: 'Version history', desc: 'Save checkpoints and restore any board to a previous state.' },
];

export default function HomeCard() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-4xl font-semibold tracking-tight md:text-5xl"
      >
        A whiteboard your whole team can think on together
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mx-auto mt-4 max-w-xl text-lg text-text-secondary"
      >
        Real-time canvas, sticky notes, and shared meeting notes — synced instantly across everyone in the room.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-4"
      >
        <Link
          to="/signup"
          className="inline-flex items-center justify-center rounded bg-gradient-to-br from-primary to-primary-dark px-6 py-3 font-medium text-white shadow-sm hover:shadow-md"
        >
          Get started free
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded border border-border px-6 py-3 font-medium text-text-primary hover:bg-surface-hover"
        >
          Log in
        </Link>
      </motion.div>

      <div className="mt-16 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.06 }}
            className="glass p-5"
          >
            <h2 className="mb-1.5 font-semibold">{f.title}</h2>
            <p className="text-sm text-text-secondary">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
