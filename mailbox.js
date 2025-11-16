import { useState, useEffect } from 'react';

const API_MAILBOX = 'http://localhost:3000/api/users/me/mailbox'; 
// Assuming you implement GET /api/users/me/mailbox in NestJS

export default function MailboxPage() {
  const [emails, setEmails] = useState([]);
  const [message, setMessage] = useState('Loading mailbox...');

  useEffect(() => {
    fetchMailbox();
  }, []);

  const fetchMailbox = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setMessage('Please log in to view your mailbox.');
      return;
    }
    try {
      const response = await fetch(API_MAILBOX, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (response.ok) {
        setEmails(data);
        setMessage(data.length === 0 ? 'Your mailbox is empty.' : '');
      } else {
        setMessage(`Error fetching mailbox: ${data.message}`);
      }
    } catch (err) {
      setMessage('Network error fetching mailbox.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>📧 My Mailbox (Simulated)</h1>
      <p style={{ fontStyle: 'italic', color: '#666' }}>
        This logs confirmation and reminder jobs processed by the NestJS worker.
      </p>
      
      {message && <p>{message}</p>}

      {emails.map((mail, index) => (
        <div key={index} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '8px', borderRadius: '4px' }}>
          <strong>{mail.subject}</strong>
          <small style={{ float: 'right' }}>{new Date(mail.sentAt).toLocaleString()}</small>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'sans-serif', marginTop: '5px' }}>{mail.body}</pre>
        </div>
      ))}
    </div>
  );
}