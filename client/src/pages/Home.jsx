import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();

  return (
    <div className="fade-in">
      <section className="hero">
        <h1>Discover & Manage<br />Amazing Events</h1>
        <p>
          Your all-in-one platform to create, explore, and book incredible events. 
          From conferences to workshops — it all starts here.
        </p>
        <div className="hero-actions">
          <Link to="/events" className="btn btn-primary">Browse Events</Link>
          {!user && <Link to="/register" className="btn btn-secondary">Get Started</Link>}
          {user?.role === 'admin' && <Link to="/create-event" className="btn btn-secondary">Create Event</Link>}
        </div>
      </section>

      <div className="page-container">
        <div className="stats-grid" style={{ marginTop: '2rem' }}>
          <div className="card stat-card">
            <div className="stat-number">🎯</div>
            <div className="stat-label">Easy Event Creation</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Create and manage events in seconds with our intuitive interface.
            </p>
          </div>
          <div className="card stat-card">
            <div className="stat-number">🎟️</div>
            <div className="stat-label">Instant Booking</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Browse and book events with just one click. No hassle.
            </p>
          </div>
          <div className="card stat-card">
            <div className="stat-number">📊</div>
            <div className="stat-label">Powerful Dashboard</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Admins get a full overview with stats, user management, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
