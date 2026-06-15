'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Loader, Pill } from 'lucide-react';

export default function MedicineCard({ medicine, isPlaying, isLoading, onPlay, index = 0 }) {
  return (
    <div
      className={`medicine-card ${isPlaying ? 'playing' : ''}`}
      id={`medicine-card-${index}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h4
            style={{
              fontSize: '1.0625rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
              letterSpacing: '-0.01em',
            }}
          >
            {medicine.name}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="dose-badge">
              <Pill size={12} />
              {medicine.dose}
            </span>
            {medicine.duration && (
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                {medicine.duration} days
              </span>
            )}
          </div>
          {medicine.instructions && (
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                lineHeight: 1.4,
              }}
            >
              {medicine.instructions}
            </p>
          )}
        </div>
        <button
          id={`play-btn-${index}`}
          onClick={onPlay}
          disabled={isLoading}
          className={isPlaying ? 'pulse-ring' : ''}
          style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '50%',
            border: 'none',
            background: isPlaying
              ? 'linear-gradient(135deg, var(--primary), var(--primary-light))'
              : 'var(--primary-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            flexShrink: 0,
            marginLeft: '0.75rem',
          }}
          aria-label={isPlaying ? 'Pause' : 'Play instructions'}
        >
          {isLoading ? (
            <Loader size={18} color="var(--primary)" className="animate-spin-slow" />
          ) : isPlaying ? (
            <Pause size={18} color="white" />
          ) : (
            <Play size={18} color="var(--primary)" style={{ marginLeft: '2px' }} />
          )}
        </button>
      </div>
    </div>
  );
}
