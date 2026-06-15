'use client';

import { useRef } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';

export default function UploadBox({ imagePreview, onImageSelect, onClear }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div
      id="upload-box"
      className={`upload-area ${imagePreview ? 'has-image' : ''}`}
      onClick={!imagePreview ? handleClick : undefined}
      role="button"
      tabIndex={0}
      aria-label="Upload prescription photo"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-input"
      />

      {imagePreview ? (
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 5,
              backdropFilter: 'blur(4px)',
            }}
            aria-label="Remove image"
          >
            <X size={14} color="white" />
          </button>
          <img
            src={imagePreview}
            alt="Prescription preview"
            style={{
              width: '100%',
              maxHeight: '300px',
              objectFit: 'contain',
              borderRadius: 'var(--radius-xl)',
            }}
          />
        </div>
      ) : (
        <div className="animate-fade-in">
          <div
            style={{
              width: '4.5rem',
              height: '4.5rem',
              borderRadius: '50%',
              background: 'var(--primary-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Camera size={28} color="var(--primary)" strokeWidth={1.5} />
          </div>
          <p
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}
          >
            Tap to photograph your prescription
          </p>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            Take a clear photo of your prescription<br />or upload from gallery
          </p>
          <div
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              color: 'var(--primary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
          >
            <ImagePlus size={16} />
            <span>Select Image</span>
          </div>
        </div>
      )}
    </div>
  );
}
