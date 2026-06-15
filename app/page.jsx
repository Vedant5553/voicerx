'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Scan, Loader, Sparkles } from 'lucide-react';
import UploadBox from '../components/UploadBox';
import LanguageSelector from '../components/LanguageSelector';

export default function HomePage() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');
  const [toast, setToast] = useState(null);
  const [scanProgress, setScanProgress] = useState('');

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageSelect = useCallback((file) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleClearImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
  }, []);

  const handleScan = async () => {
    if (!selectedImage) {
      showToast('Please select a prescription image first');
      return;
    }

    setIsScanning(true);
    setScanProgress('Scanning prescription...');

    try {
      // Step 1: OCR Scan
      const formData = new FormData();
      formData.append('image', selectedImage);

      const scanRes = await fetch('/api/scan', {
        method: 'POST',
        body: formData,
      });

      const scanData = await scanRes.json();

      if (!scanData.success) {
        throw new Error(scanData.error || 'Scan failed');
      }

      setScanProgress('Parsing medicines...');

      // Step 2: Parse medicines
      const parseRes = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scanData.text,
          language: selectedLanguage,
        }),
      });

      const parseData = await parseRes.json();

      if (!parseData.success || !parseData.medicines?.length) {
        throw new Error('No medicines found in the prescription');
      }

      // Save to localStorage
      localStorage.setItem('voicerx_medicines', JSON.stringify(parseData.medicines));
      localStorage.setItem('voicerx_lang', selectedLanguage);
      localStorage.setItem('voicerx_raw_text', scanData.text);

      showToast(`Found ${parseData.medicines.length} medicine(s)!`, 'success');

      // Navigate to schedule
      setTimeout(() => router.push('/schedule'), 800);
    } catch (error) {
      console.error('Scan error:', error);
      showToast(
        error.message || 'Could not read prescription. Please take a clearer photo.'
      );
    } finally {
      setIsScanning(false);
      setScanProgress('');
    }
  };

  return (
    <div style={{ padding: '1.5rem 1.25rem' }}>
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            marginBottom: '0.5rem',
          }}
        >
          Your prescription,
          <br />
          <span className="gradient-text">in your language</span>
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            maxWidth: '300px',
            margin: '0 auto',
          }}
        >
          Scan, understand, and hear your medicine instructions
        </p>
      </div>

      {/* Language Selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
        className="animate-fade-in"
      >
        <LanguageSelector onChange={setSelectedLanguage} />
      </div>

      {/* Upload Box */}
      <div className="animate-fade-in" style={{ animationDelay: '0.1s', marginBottom: '1.5rem' }}>
        <UploadBox
          imagePreview={imagePreview}
          onImageSelect={handleImageSelect}
          onClear={handleClearImage}
        />
      </div>

      {/* Scan Button */}
      <div className="animate-fade-in" style={{ animationDelay: '0.2s', marginBottom: '1.5rem' }}>
        <button
          id="scan-button"
          onClick={handleScan}
          disabled={isScanning || !selectedImage}
          className="btn-primary"
          style={{
            padding: '1rem 2rem',
            fontSize: '1.0625rem',
          }}
        >
          {isScanning ? (
            <>
              <Loader size={20} className="animate-spin-slow" />
              {scanProgress || 'Processing...'}
            </>
          ) : (
            <>
              <Scan size={20} />
              Scan Prescription
            </>
          )}
        </button>
      </div>

      {/* Powered by */}
      <div
        className="animate-fade-in"
        style={{
          animationDelay: '0.3s',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.375rem',
        }}
      >
        <Sparkles size={14} color="var(--text-muted)" />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Powered by Google Gemini AI
        </p>
      </div>
    </div>
  );
}
