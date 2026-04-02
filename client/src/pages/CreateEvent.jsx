import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateEvent() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    max_attendees: 100
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/events', form);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>Create Event</h1>
        <p>Fill in the details to create a new event</p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <div className="card" style={{ padding: '2rem' }}>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Event Title</label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-control"
                placeholder="e.g. Tech Conference 2024"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                placeholder="What's this event about?"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="date">Date & Time</label>
              <input
                id="date"
                name="date"
                type="datetime-local"
                className="form-control"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                type="text"
                className="form-control"
                placeholder="e.g. Convention Center, New York"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="max_attendees">Max Attendees</label>
              <input
                id="max_attendees"
                name="max_attendees"
                type="number"
                className="form-control"
                min="1"
                value={form.max_attendees}
                onChange={handleChange}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/events')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;
