'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader, MessageCircle } from 'lucide-react';
import ChatBubble from '../../components/ChatBubble';

const suggestions = [
  'Can I take this on empty stomach?',
  'What are the side effects?',
  'Can I take with other medicines?',
];

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [language, setLanguage] = useState('hi-IN');
  const [toast, setToast] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const savedMedicines = localStorage.getItem('voicerx_medicines');
    const savedLang = localStorage.getItem('voicerx_lang');

    if (savedMedicines) {
      try {
        setMedicines(JSON.parse(savedMedicines));
      } catch (e) {
        console.error('Failed to parse medicines:', e);
      }
    }
    if (savedLang) {
      setLanguage(savedLang);
    }

    // Welcome message
    setMessages([
      {
        role: 'ai',
        text: 'Hello! I\'m your medication assistant. Ask me anything about your prescribed medicines. 💊',
      },
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const playTTS = async (text) => {
    try {
      let data = { success: false };
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, languageCode: language }),
        });
        data = await response.json();
      } catch (fetchError) {
        console.warn('TTS API fetch failed, falling back to Web Speech API:', fetchError.message);
        data = { success: true, fallback: true };
      }

      if (data.success && (data.fallback || !data.audio)) {
        return new Promise((resolve, reject) => {
          if (typeof window === 'undefined' || !window.speechSynthesis) {
            reject(new Error('Speech synthesis not supported in this browser'));
            return;
          }
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = language;

          const voices = window.speechSynthesis.getVoices();
          const matchingVoice = voices.find((v) => v.lang.startsWith(language.split('-')[0]));
          if (matchingVoice) {
            utterance.voice = matchingVoice;
          }

          utterance.onend = resolve;
          utterance.onerror = reject;
          window.speechSynthesis.speak(utterance);
        });
      }

      if (data.success && data.audio) {
        return new Promise((resolve, reject) => {
          const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
          audio.onended = resolve;
          audio.onerror = reject;
          audio.play();
        });
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text.trim(),
          medicines,
          language,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Chat failed');
      }

      const aiMessage = { role: 'ai', text: data.answer };
      setMessages((prev) => [...prev, aiMessage]);

      // Auto-play TTS
      try {
        await playTTS(data.answer);
      } catch (e) {
        // TTS is optional, don't show error
      }
    } catch (error) {
      console.error('Chat error:', error);
      showToast('Something went wrong. Please try again.');
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 8rem)',
        padding: '0',
      }}
    >
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <MessageCircle size={22} color="var(--primary)" />
          Ask about your prescription
        </h1>
        {medicines.length === 0 && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Upload a prescription first to get personalized answers
          </p>
        )}
      </div>

      {/* Chat Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 1.25rem',
        }}
      >
        {messages.map((msg, idx) => (
          <ChatBubble
            key={idx}
            message={msg}
            onPlayTTS={playTTS}
          />
        ))}

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
            <div
              className="chat-bubble-ai"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Loader size={16} className="animate-spin-slow" color="var(--primary)" />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length <= 2 && (
        <div
          style={{
            padding: '0.5rem 1.25rem',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="suggestion-chip"
              onClick={() => sendMessage(s)}
              disabled={isLoading}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          background: 'white',
        }}
      >
        <input
          ref={inputRef}
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          disabled={isLoading}
          style={{
            flex: 1,
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            padding: '0.75rem 1.125rem',
            fontSize: '0.9375rem',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            fontFamily: 'Inter, sans-serif',
            background: 'var(--bg-subtle)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
        <button
          id="send-button"
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '50%',
            border: 'none',
            background:
              input.trim()
                ? 'linear-gradient(135deg, var(--primary), var(--primary-light))'
                : 'var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}
          aria-label="Send message"
        >
          <Send
            size={18}
            color={input.trim() ? 'white' : 'var(--text-muted)'}
            style={{ marginLeft: '1px', marginTop: '-1px' }}
          />
        </button>
      </form>
    </div>
  );
}
