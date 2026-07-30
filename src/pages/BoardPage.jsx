import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { selectAuthAccessToken } from '../store/authSlice';

function BoardPage() {
  const { boardId } = useParams();
  const accessToken = useSelector(selectAuthAccessToken);
  const [board, setBoard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const { data } = await axios.get(`/api/boards/${boardId}`, {
          headers: { Authorization: `Bearer ${accessToken || ''}` },
        });
        setBoard(data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Board could not be loaded');
      }
    };

    if (accessToken) {
      fetchBoard();
    }
  }, [boardId, accessToken]);

  return (
    <div className='flex-center full-height' style={{ padding: '2rem' }}>
      <div className='glass' style={{ width: '100%', maxWidth: '1100px', padding: '2rem' }}>
        {error ? (
          <p style={{ color: '#ff6b6b' }}>{error}</p>
        ) : board ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <h1>{board.title}</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Realtime board and meeting notes editor coming soon.</p>
              </div>
            </div>
            <section style={{ marginTop: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
                <div className='glass' style={{ minHeight: '440px', padding: '1.5rem' }}>
                  <h2 style={{ marginBottom: '1rem' }}>Canvas</h2>
                  <div style={{ height: '360px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>Canvas preview will render here.</p>
                  </div>
                </div>
                <div className='glass' style={{ minHeight: '440px', padding: '1.5rem' }}>
                  <h2 style={{ marginBottom: '1rem' }}>Notes</h2>
                  <textarea
                    readOnly
                    value={board.meta?.notes || 'Meeting notes will appear here.'}
                    style={{ width: '100%', height: '320px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
                  />
                </div>
              </div>
            </section>
          </>
        ) : (
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading board...</p>
        )}
      </div>
    </div>
  );
}

export default BoardPage;
