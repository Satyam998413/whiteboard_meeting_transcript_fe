import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  return useContext(ToastContext);
};

let idSeed = 1;

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, opts = {}) => {
    const id = idSeed++;
    const toast = { id, message, ...opts };
    setToasts((t) => [...t, toast]);
    const ttl = opts.duration ?? 3000;
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, ttl);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {toasts.map((t) => (
          <div key={t.id} className="toast" role="status" aria-live="polite">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
