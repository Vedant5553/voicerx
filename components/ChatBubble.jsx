'use client';

import { useState } from 'react';
import { Volume2, Loader } from 'lucide-react';

export default function ChatBubble({ message, onPlayTTS }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);

  const handleSpeak = async () => {
    if (isSpeaking || isLoadingTTS) return;
    setIsLoadingTTS(true);
    try {
      setIsSpeaking(true);
      await onPlayTTS(message.text);
    } catch (err) {
      console.error('TTS play error:', err);
    } finally {
      setIsSpeaking(false);
      setIsLoadingTTS(false);
    }
  };

  if (message.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
        <div className="chat-bubble-user">
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.5 }}>{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
      <div className="chat-bubble-ai">
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
          {message.text}
        </p>
        <button
          onClick={handleSpeak}
          disabled={isLoadingTTS}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'none',
            border: 'none',
            color: isSpeaking ? 'var(--primary)' : 'var(--text-muted)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            padding: '0.25rem 0',
            fontWeight: 500,
            transition: 'color 0.2s ease',
          }}
          aria-label="Play audio"
        >
          {isLoadingTTS ? (
            <Loader size={14} className="animate-spin-slow" />
          ) : (
            <Volume2 size={14} />
          )}
          {isSpeaking ? 'Speaking...' : 'Listen'}
        </button>
      </div>
    </div>
  );
}
