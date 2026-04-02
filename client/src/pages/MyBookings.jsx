import { useState, useEffect } from 'react';
import axios from 'axios';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/bookings/my');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;

    try {
      await axios.delete(`/bookings/${bookingId}`);
      setMessage('Booking cancelled.');
      fetchBookings();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to cancel booking.');
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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>Events you've registered for</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <h3>No bookings yet</h3>
          <p>Browse events and book your spot!</p>
        </div>
      ) : (
        <div className="events-grid">
          {bookings.map(booking => (
            <div key={booking.id} className="card event-card">
              <span className="event-date">{formatDate(booking.date)}</span>
              <h3>{booking.title}</h3>
              <p className="event-desc">{booking.description}</p>
              <div className="event-meta">
                <span>📍 {booking.location}</span>
                <span>🎫 Booked {new Date(booking.booked_at).toLocaleDateString()}</span>
              </div>
              <div className="event-actions">
                <button onClick={() => handleCancel(booking.id)} className="btn btn-sm btn-danger">
                  Cancel Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
