'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PlayCircle, StopCircle, Loader } from 'lucide-react';
import ScheduleGrid from '../../components/ScheduleGrid';
import ReminderSetup from '../../components/ReminderSetup';

export default function SchedulePage() {
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [language, setLanguage] = useState('hi-IN');
  const [playingId, setPlayingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const audioRef = useRef(null);
  const stopAllRef = useRef(false);

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

    // Simulated loading for skeleton
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const playTTS = async (text, id) => {
    try {
      setLoadingId(id);
      
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

      if (!data.success) {
        throw new Error(data.error || 'TTS failed');
      }

      if (data.fallback || !data.audio) {
        setLoadingId(null);
        setPlayingId(id);

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

          utterance.onend = () => {
            setPlayingId(null);
            audioRef.current = null;
            resolve();
          };

          utterance.onerror = (e) => {
            setPlayingId(null);
            audioRef.current = null;
            reject(e);
          };

          audioRef.current = {
            pause: () => {
              window.speechSynthesis.cancel();
            },
          };

          window.speechSynthesis.speak(utterance);
        });
      }

      setLoadingId(null);
      setPlayingId(id);

      return new Promise((resolve, reject) => {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audioRef.current = audio;
        audio.onended = () => {
          setPlayingId(null);
          audioRef.current = null;
          resolve();
        };
        audio.onerror = (err) => {
          setPlayingId(null);
          audioRef.current = null;
          reject(err);
        };
        audio.play();
      });
    } catch (error) {
      setLoadingId(null);
      setPlayingId(null);
      showToast('Failed to play audio. Please try again.');
      throw error;
    }
  };

  const handlePlayMedicine = async (medicine, id) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingId(null);
      if (playingId === id) return; // Toggle off
    }

    const text = `${medicine.name}. Take ${medicine.dose}${medicine.instructions ? ', ' + medicine.instructions : ''}`;
    try {
      await playTTS(text, id);
    } catch (e) {
      // Error already handled in playTTS
    }
  };

  const handlePlayAll = async () => {
    if (isPlayingAll) {
      stopAllRef.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlayingAll(false);
      setPlayingId(null);
      return;
    }

    stopAllRef.current = false;
    setIsPlayingAll(true);

    const timeOrder = ['morning', 'afternoon', 'evening', 'night'];

    for (const time of timeOrder) {
      const timeMeds = medicines.filter(
        (m) => m.frequency && m.frequency.includes(time)
      );

      for (let i = 0; i < timeMeds.length; i++) {
        if (stopAllRef.current) break;

        const med = timeMeds[i];
        const text = `${med.name}. Take ${med.dose}${med.instructions ? ', ' + med.instructions : ''}`;
        const id = `${time}-${i}`;

        try {
          await playTTS(text, id);
        } catch (e) {
          // Continue to next
        }

        if (stopAllRef.current) break;
      }

      if (stopAllRef.current) break;
    }

    setIsPlayingAll(false);
    setPlayingId(null);
  };

  return (
    <div style={{ padding: '1.25rem' }}>
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        <button
          id="back-button"
          onClick={() => router.push('/')}
          style={{
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={18} color="var(--text-primary)" />
        </button>
        <div>
          <h1
            style={{
              fontSize: '1.375rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Your Medication Schedule
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
            {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Play All Button */}
      {medicines.length > 0 && (
        <button
          id="play-all-button"
          onClick={handlePlayAll}
          className="btn-primary"
          style={{
            marginBottom: '1.5rem',
            padding: '0.875rem 1.5rem',
          }}
        >
          {isPlayingAll ? (
            <>
              <StopCircle size={20} />
              Stop Playback
            </>
          ) : (
            <>
              <PlayCircle size={20} />
              Play Full Schedule
            </>
          )}
        </button>
      )}

      {/* Schedule Grid with Skeleton */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '5rem', width: '100%' }} />
          ))}
        </div>
      ) : (
        <ScheduleGrid
          medicines={medicines}
          playingId={playingId}
          loadingId={loadingId}
          onPlayMedicine={handlePlayMedicine}
        />
      )}

      {/* Reminder Setup */}
      {medicines.length > 0 && <ReminderSetup medicines={medicines} />}
    </div>
  );
}
