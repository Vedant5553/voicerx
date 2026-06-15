'use client';

import { useState, useEffect } from 'react';

const languages = [
  { code: 'hi-IN', label: '🇮🇳 Hindi' },
  { code: 'mr-IN', label: '🇮🇳 Marathi' },
  { code: 'bn-IN', label: '🇮🇳 Bengali' },
  { code: 'ta-IN', label: '🇮🇳 Tamil' },
  { code: 'te-IN', label: '🇮🇳 Telugu' },
];

export default function LanguageSelector({ onChange }) {
  const [selected, setSelected] = useState('hi-IN');

  useEffect(() => {
    const saved = localStorage.getItem('voicerx_lang');
    if (saved) {
      setSelected(saved);
      onChange?.(saved);
    }
  }, []);

  const handleChange = (e) => {
    const code = e.target.value;
    setSelected(code);
    localStorage.setItem('voicerx_lang', code);
    onChange?.(code);
  };

  return (
    <div className="lang-selector">
      <select
        id="language-selector"
        value={selected}
        onChange={handleChange}
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
