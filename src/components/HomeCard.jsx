import { Link } from 'react-router-dom';
import './HomeCard.css';

function HomeCard() {
  return (
    <div className="home-card glass">
      <h1>Welcome to Collaborative Whiteboard</h1>
      <p>Real‑time canvas, notes, and meeting minutes. Sign in or create an account to get started.</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
        <Link to="/login" className="btn">Log In</Link>
        <Link to="/signup" className="btn">Sign Up</Link>
      </div>
    </div>
  );
}

export default HomeCard;

