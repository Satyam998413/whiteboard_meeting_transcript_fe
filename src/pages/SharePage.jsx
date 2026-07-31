import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function SharePage() {
  const { token } = useParams();
  const [board, setBoard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedBoard = async () => {
      try {
        const { data } = await axios.get(`/api/share/${token}`);
        setBoard(data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Could not load shared board');
      }
    };

    fetchSharedBoard();
  }, [token]);

  return (
    <div className='flex-center full-height' style={{ padding: '2rem' }}>
      <div className='glass' style={{ width: '100%', maxWidth: '820px', padding: '2rem' }}>
        {error ? (
          <p style={{ color: '#ff6b6b' }}>{error}</p>
        ) : board ? (
          <>
            <header style={{ marginBottom: '1.5rem' }}>
              <h1>{board.title}</h1>
              <p style={{ color: 'var(--color-text-secondary)' }}>Public view only: sign in to edit and collaborate.</p>
            </header>
            <section style={{ display: 'grid', gap: '1rem' }}>
              <div className='glass' style={{ padding: '1.5rem' }}>
                <h2>Board overview</h2>
                <p style={{ color: 'var(--color-text-secondary)' }}>{board.meta?.description || 'This board is shared publicly via link.'}</p>
              </div>
              <div className='glass' style={{ padding: '1.5rem' }}>
                <h2>Visit app</h2>
                <p style={{ color: 'var(--color-text-secondary)' }}>Log in to see the full collaborative canvas, notes, and history.</p>
                <Link to='/login' className='btn'>Sign in</Link>
              </div>
            </section>
          </>
        ) : (
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading shared board...</p>
        )}
      </div>
    </div>
  );
}

export default SharePage;
