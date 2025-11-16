import { useState } from 'react';

const API_BASE = 'http://localhost:3000/api/competitions';

export default function CreateCompetitionPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    capacity: 10,
    regDeadline: '',
    startTime: '',
    tags: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setMessage('Error: Not logged in or token expired.');
      return;
    }
    
    const body = {
        ...formData,
        capacity: parseInt(formData.capacity, 10),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        // Dates must be sent as ISO strings
        regDeadline: new Date(formData.regDeadline).toISOString(),
        startTime: new Date(formData.startTime).toISOString(),
    };

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success! Competition ID: ${data.id}.`);
        setFormData({ title: '', description: '', capacity: 10, regDeadline: '', startTime: '', tags: '' });
      } else {
        setMessage(`Error: ${data.message || 'Failed to create competition.'}`);
      }
    } catch (err) {
      setMessage('Network error.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Organize New Competition 🏅</h1>
      <form onSubmit={handleSubmit}>
        {/* ... (Input fields for title, description, capacity, deadlines) ... */}
        <button type="submit">Create Competition</button>
      </form>
      {message && <p style={{ marginTop: '15px' }}>{message}</p>}
    </div>
  );
}