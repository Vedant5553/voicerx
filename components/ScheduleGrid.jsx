'use client';

import MedicineCard from './MedicineCard';

const timeSections = [
  { key: 'morning', emoji: '🌅', label: 'Morning' },
  { key: 'afternoon', emoji: '☀️', label: 'Afternoon' },
  { key: 'evening', emoji: '🌆', label: 'Evening' },
  { key: 'night', emoji: '🌙', label: 'Night' },
];

export default function ScheduleGrid({ medicines, playingId, loadingId, onPlayMedicine }) {
  // Group medicines by frequency
  const grouped = {};
  timeSections.forEach((section) => {
    grouped[section.key] = [];
  });

  medicines.forEach((med, idx) => {
    if (med.frequency && Array.isArray(med.frequency)) {
      med.frequency.forEach((time) => {
        if (grouped[time]) {
          grouped[time].push({ ...med, originalIndex: idx });
        }
      });
    }
  });

  const hasAnyMedicines = Object.values(grouped).some((arr) => arr.length > 0);

  if (!hasAnyMedicines) {
    return (
      <div className="empty-state">
        <div className="icon">💊</div>
        <h3>No medicines found</h3>
        <p>Upload a prescription on the home screen to see your medication schedule here.</p>
      </div>
    );
  }

  return (
    <div>
      {timeSections.map((section) => {
        const meds = grouped[section.key];
        if (meds.length === 0) return null;

        return (
          <div key={section.key} className="time-section">
            <div className="time-section-header">
              <span className="emoji">{section.emoji}</span>
              <h3>{section.label}</h3>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginLeft: 'auto',
                  fontWeight: 500,
                }}
              >
                {meds.length} medicine{meds.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {meds.map((med, idx) => (
                <MedicineCard
                  key={`${section.key}-${idx}`}
                  medicine={med}
                  isPlaying={playingId === `${section.key}-${idx}`}
                  isLoading={loadingId === `${section.key}-${idx}`}
                  onPlay={() => onPlayMedicine(med, `${section.key}-${idx}`)}
                  index={idx}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
