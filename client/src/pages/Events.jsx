import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (eventId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post('/bookings', { event_id: eventId });
      setMessage('Event booked successfully!');
      fetchEvents();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await axios.delete(`/events/${eventId}`);
      setMessage('Event deleted.');
      fetchEvents();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Delete failed.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>Explore Events</h1>
        <p>Find and book your next amazing experience</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="search-bar">
        <input
          type="text"
          className="form-control"
          placeholder="Search events by title or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {user?.role === 'admin' && (
          <Link to="/create-event" className="btn btn-primary">+ New Event</Link>
        )}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <h3>No events found</h3>
          <p>Try a different search or check back later.</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map(event => (
            <div key={event.id} className="card event-card">
              <span className="event-date">{formatDate(event.date)}</span>
              <h3>{event.title}</h3>
              <p className="event-desc">{event.description}</p>
              <div className="event-meta">
                <span>📍 {event.location}</span>
                <span>👥 {event.booked_count}/{event.max_attendees}</span>
                {event.creator_name && <span>By {event.creator_name}</span>}
              </div>
              <div className="event-actions">
                {user?.role === 'admin' ? (
                  <>
                    <Link to={`/edit-event/${event.id}`} className="btn btn-sm btn-secondary">Edit</Link>
                    <button onClick={() => handleDelete(event.id)} className="btn btn-sm btn-danger">Delete</button>
                  </>
                ) : (
                  <button
                    onClick={() => handleBook(event.id)}
                    className="btn btn-sm btn-primary"
                    disabled={event.booked_count >= event.max_attendees}
                  >
                    {event.booked_count >= event.max_attendees ? 'Fully Booked' : 'Book Now'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;
