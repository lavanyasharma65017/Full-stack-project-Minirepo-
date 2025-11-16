// apps/frontend/pages/competitions/[id].js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const API_BASE = 'http://localhost:3000/api/competitions';

export default function RegisterCompetitionPage() {
  const router = useRouter();
  const { id: competitionId } = router.query;
  
  const [competition, setCompetition] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (competitionId) {
      fetchCompetitionDetails(competitionId);
    }
  }, [competitionId]);

  const fetchCompetitionDetails = async (id) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;
    try {
      // Assuming you have a GET /api/competitions/:id endpoint
      const response = await fetch(`${API_BASE}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setCompetition(data);
        setMessage('');
      } else {
        setMessage(`Error fetching details: ${data.message}`);
      }
    } catch (err) {
      setMessage('Network error fetching competition details.');
    }
  };

  const handleRegister = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        setMessage('Error: Not logged in.');
        return;
    }
    
    // Crucial step: Generate a unique Idempotency Key
    // Using a combination of Competition ID, timestamp, and a random number ensures uniqueness.
    const idempotencyKey = `${competitionId}-${Date.now()}-${Math.random()}`; 
    
    setMessage('Attempting registration...');

    try {
      const response = await fetch(`${API_BASE}/${competitionId}/register`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Idempotency-Key': idempotencyKey, // Send the unique key
        },
        body: JSON.stringify({}), 
      });

      const data = await response.json();
      
      if (response.status === 201) {
        setMessage(`✅ Registration successful! Confirmation job enqueued. ID: ${data.id}`);
      } else if (response.status === 200) {
        setMessage(`⚠️ Idempotent success: Already registered! ID: ${data.id}`);
      } else {
        // Handle 409 Conflict (Full/Already Registered) or 400 Bad Request (Deadline)
        setMessage(`❌ Registration failed: ${data.message || 'Unknown error'}.`);
      }
      
    } catch (err) {
      setMessage('Network error during registration attempt.');
    }
  };

  if (!competition) return <p>{message || 'Loading competition...'}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>{competition.title}</h1>
      <p><strong>Description:</strong> {competition.description}</p>
      <p><strong>Seats Left:</strong> {competition.seatsLeft} / {competition.capacity}</p>
      <p><strong>Registration Deadline:</strong> {new Date(competition.regDeadline).toLocaleString()}</p>
      
      <button 
        onClick={handleRegister} 
        style={{ background: competition.seatsLeft <= 0 ? 'gray' : 'green' }}
        disabled={competition.seatsLeft <= 0}
      >
        {competition.seatsLeft <= 0 ? 'COMPETITION FULL' : 'Register Now (Participant)'}
      </button>

      {message && <p style={{ marginTop: '15px', color: message.startsWith('❌') ? 'red' : 'blue' }}>{message}</p>}
    </div>
  );
}