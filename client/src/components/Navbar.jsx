import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">⚡ EventHub</Link>
      <ul className="navbar-links">
        <li><Link to="/events" className={isActive('/events')}>Events</Link></li>
        {user ? (
          <>
            <li><Link to="/my-bookings" className={isActive('/my-bookings')}>My Bookings</Link></li>
            {user.role === 'admin' && (
              <>
                <li><Link to="/create-event" className={isActive('/create-event')}>Create Event</Link></li>
                <li><Link to="/admin" className={isActive('/admin')}>Dashboard</Link></li>
              </>
            )}
            <li>
              <button onClick={handleLogout} className="btn btn-sm btn-secondary">Logout</button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login" className={isActive('/login')}>Login</Link></li>
            <li><Link to="/register"><span className="btn btn-sm btn-primary">Sign Up</span></Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
