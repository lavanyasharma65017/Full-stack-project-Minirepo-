import { useState } from 'react';

const API_BASE = 'http://localhost:3000/api/auth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('PARTICIPANT');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'signup';
    const body = isLogin ? { email, password } : { name, email, password, role };

    try {
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('jwt_token', data.token);
        setMessage(`Success! Role: ${role}. Token stored. Redirecting...`);
        // Simple client-side redirect after successful auth
        window.location.href = role === 'ORGANIZER' ? '/create-competition' : '/competitions';
      } else {
        setMessage(`Error: ${data.message || 'Failed to authenticate.'}`);
      }
    } catch (err) {
      setMessage('Network error.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <button onClick={() => setIsLogin(!isLogin)} style={{ marginBottom: '20px' }}>
        Switch to {isLogin ? 'Sign Up' : 'Login'}
      </button>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: '10px' }}>
            <label>Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%' }} />
          </div>
        )}
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%' }} />
        </div>
        {!isLogin && (
          <div style={{ marginBottom: '10px' }}>
            <label>Role:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              <option value="PARTICIPANT">Participant</option>
              <option value="ORGANIZER">Organizer</option>
            </select>
          </div>
        )}
        <button type="submit" style={{ padding: '10px', width: '100%', background: 'green', color: 'white' }}>
          {isLogin ? 'Log In' : 'Create Account'}
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', color: message.startsWith('Error') ? 'red' : 'blue' }}>{message}</p>}
    </div>
  );
}