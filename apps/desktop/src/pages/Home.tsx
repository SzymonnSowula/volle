import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleStartSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: crypto.randomUUID(),
          metadata: {},
        }),
      });

      if (response.ok) {
        const { id } = await response.json();
        navigate(`/session/${id}`);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  return (
    <div className="home">
      <h1>Solli</h1>
      <p>
        Your voice-native session operator. Converse naturally and let AI agents
        handle your tasks across research, inbox, and planning.
      </p>
      <button className="start-button" onClick={handleStartSession}>
        Start Session
      </button>
    </div>
  );
}

export default Home;
