import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketType, setTicketType] = useState('general');
  const [isProcessing, setIsProcessing] = useState(false);
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

  const getSelectedPrice = () => {
    if (!selectedEvent) return 0;
    if (ticketType === 'vip') return selectedEvent.price_vip;
    if (ticketType === 'premium') return selectedEvent.price_premium;
    return selectedEvent.price_general;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const price = getSelectedPrice();
    if (price <= 0) {
      executeBooking();
      return;
    }

    setIsProcessing(true);
    const res = await loadRazorpayScript();
    if (!res) {
      setMessage('Razorpay SDK failed to load. Are you online?');
      setIsProcessing(false);
      return;
    }

    try {
      const orderRes = await axios.post('/bookings/create-razorpay-order', { amount: price });
      const order = orderRes.data;

      const options = {
        key: 'rzp_test_SngJWFIp4AMFth', // WARNING: Must be replaced with real test key!
        amount: order.amount,
        currency: order.currency,
        name: 'EventHub',
        description: `Ticket for ${selectedEvent.title}`,
        order_id: order.id,
        handler: function (response) {
          executeBooking();
        },
        prefill: {
          name: user.name || 'User',
          email: user.email || 'user@example.com',
        },
        theme: {
          color: '#8b5cf6'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to open Razorpay. Check backend keys.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeBooking = async () => {
    if (!selectedEvent) return;

    try {
      await axios.post('/bookings', { event_id: selectedEvent.id, ticket_type: ticketType });
      setMessage('Event booked successfully!');
      fetchEvents();
      setSelectedEvent(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (eventId) => {
    // if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await axios.delete(`/events/${eventId}`);
      setMessage('Event deleted.');
      fetchEvents();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Delete failed.';
      setMessage(`Delete failed: ${errorMsg}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timePart = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${datePart} • ${timePart}`;
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
                {event.creator_name && <span>👤 {event.creator_name}</span>}
              </div>
              <div className="event-actions">
                {user?.role === 'admin' ? (
                  <>
                    <Link to={`/edit-event/${event.id}`} className="btn btn-sm btn-secondary">Edit</Link>
                    <button onClick={() => handleDelete(event.id)} className="btn btn-sm btn-danger">Delete</button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="btn btn-sm btn-primary"
                  >
                    View Details & Book
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedEvent(null)}>&times;</button>
            <h2 style={{ marginBottom: '0.5rem' }}>{selectedEvent.title}</h2>
            <span className="event-date">{formatDate(selectedEvent.date)}</span>
            <p className="event-desc-full">{selectedEvent.description}</p>
            <div className="event-meta" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
              <span>📍 {selectedEvent.location}</span>
              <span>👥 {selectedEvent.booked_count}/{selectedEvent.max_attendees}</span>
              {selectedEvent.creator_name && <span>👤 {selectedEvent.creator_name}</span>}
            </div>

            {user?.role !== 'admin' && (
              <div className="booking-section">
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Select Ticket Type</h3>
                <div className="ticket-options">
                  <label>
                    <input type="radio" name="ticket" value="general" checked={ticketType === 'general'} onChange={(e) => setTicketType(e.target.value)} />
                    General - ${selectedEvent.price_general || 0}
                  </label>
                  <label>
                    <input type="radio" name="ticket" value="vip" checked={ticketType === 'vip'} onChange={(e) => setTicketType(e.target.value)} />
                    VIP - ${selectedEvent.price_vip || 0}
                  </label>
                  <label>
                    <input type="radio" name="ticket" value="premium" checked={ticketType === 'premium'} onChange={(e) => setTicketType(e.target.value)} />
                    Premium - ${selectedEvent.price_premium || 0}
                  </label>
                </div>
                <button
                  onClick={handleInitiatePayment}
                  className="btn btn-primary"
                  style={{ marginTop: '1.5rem', width: '100%' }}
                  disabled={selectedEvent.booked_count >= selectedEvent.max_attendees || isProcessing}
                >
                  {isProcessing ? 'Processing...' : (selectedEvent.booked_count >= selectedEvent.max_attendees ? 'Fully Booked' : 'Proceed to Payment')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
