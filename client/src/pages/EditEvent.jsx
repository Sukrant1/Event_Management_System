import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EditEvent() {
  const { id } = useParams();
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    max_attendees: 100
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/events/${id}`);
        const event = res.data;
        setForm({
          title: event.title,
          description: event.description || '',
          date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
          location: event.location,
          max_attendees: event.max_attendees
        });
      } catch (err) {
        setError('Failed to load event.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await axios.put(`/events/${id}`, form);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading event...</p>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>Edit Event</h1>
        <p>Update the event details</p>
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
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
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

export default EditEvent;
