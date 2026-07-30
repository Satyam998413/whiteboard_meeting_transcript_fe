import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import { useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useToast } from '../components/ToastProvider';

function BoardPage() {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const { data } = await apiClient.get(`/api/boards/${boardId}`);
        setBoard(data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Board could not be loaded');
      }
    };

    fetchBoard();
  }, [boardId]);

  return (
    <div className='flex-center full-height' style={{ padding: '2rem' }}>
      <div className='glass' style={{ width: '100%', maxWidth: '1100px', padding: '2rem' }}>
        {error ? (
          <p style={{ color: '#ff6b6b' }}>{error}</p>
        ) : board ? (
          <>
            <div className='board-toolbar'>
              <div>
                <h1 style={{ marginBottom: '0.25rem' }}>{board.title}</h1>
                <p className='small-note'>{board.meta?.description || 'Realtime board and meeting notes editor coming soon.'}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className='btn share-btn'
                  aria-label={`Copy share link for ${board.title}`}
                  onClick={async () => {
                    try {
                      const url = `${window.location.origin}/share/${board.slug}`;
                      await navigator.clipboard.writeText(url);
                      showToast('Share link copied to clipboard');
                    } catch (e) {
                      showToast('Could not copy link');
                    }
                  }}
                >
                  Copy share link
                </button>
                <a href={`/share/${board.slug}`} className='btn' target='_blank' rel='noreferrer' aria-label={`Open shared view of ${board.title}`}>Open share</a>
                <button
                  aria-label={`Export notes for ${board.title}`}
                  className='btn'
                  onClick={async () => {
                    try {
                      const resp = await apiClient.get(`/api/boards/${board._id}/export`, { responseType: 'blob' });
                      const blob = new Blob([resp.data], { type: 'text/plain' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${(board.title || 'board').replace(/[^a-z0-9-_]/gi, '_')}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                      showToast('Export started');
                    } catch (e) {
                      showToast('Export failed');
                    }
                  }}
                >
                  Export notes
                </button>
                <button
                  className='btn'
                  onClick={async () => {
                    try {
                      // capture canvas area if present
                      let canvasDataUrl = null;
                      const el = document.querySelector('.canvas-area');
                      if (el) {
                        const c = await html2canvas(el, { backgroundColor: null });
                        canvasDataUrl = c.toDataURL('image/png');
                      }
                      const resp = await apiClient.post(`/api/boards/${board._id}/export/pdf`, { canvasDataUrl }, { responseType: 'blob' });
                      const blob = new Blob([resp.data], { type: 'application/pdf' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${(board.title || 'board').replace(/[^a-z0-9-_]/gi, '_')}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                      showToast('PDF export started');
                    } catch (e) {
                      showToast('PDF export failed');
                    }
                  }}
                >
                  Export PDF
                </button>
                <button
                  className='btn'
                  onClick={async () => {
                    try {
                      const resp = await apiClient.get(`/api/boards/${board._id}/export/markdown`, { responseType: 'blob' });
                      const blob = new Blob([resp.data], { type: 'text/markdown' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${(board.title || 'board').replace(/[^a-z0-9-_]/gi, '_')}.md`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                      showToast('Markdown export started');
                    } catch (e) {
                      showToast('Markdown export failed');
                    }
                  }}
                >
                  Export Markdown
                </button>
                <a href={`/api/boards/${board._id}/export/docx`} className='btn' target='_blank' rel='noreferrer'>Export DOCX</a>
              </div>
            </div>
            <section style={{ marginTop: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
                <div className='canvas-area'>
                  <h2 style={{ marginBottom: '0.75rem' }}>Canvas</h2>
                  <div style={{ height: '360px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>Canvas preview will render here.</p>
                  </div>
                </div>
                <div className='glass' style={{ padding: '1.5rem' }}>
                  <h2 style={{ marginBottom: '1rem' }}>Notes</h2>
                  <div className='notes-area' aria-readonly>
                    {board.meta?.notes || 'Meeting notes will appear here.'}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading board...</p>
        )}
        {/* toasts handled by ToastProvider */}
      </div>
    </div>
  );
}

export default BoardPage;
