'use client';

import './globals.css';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, MessageCircle, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { path: '/', icon: Home, label: 'Upload' },
    { path: '/schedule', icon: Calendar, label: 'Schedule' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
  ];

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="VoiceRx - Scan your prescription, hear medicine instructions in your language. Powered by AI." />
        <meta name="theme-color" content="#10B981" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <title>VoiceRx — Your Prescription, In Your Language</title>
      </head>
      <body>
        <div className="app-container">
          {/* Offline Banner */}
          {!isOnline && (
            <div className="offline-banner">
              ⚡ You are offline — some features may not work
            </div>
          )}

          {/* Header */}
          <header style={{
            padding: '1rem 1.25rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: 'rgba(9, 13, 22, 0.8)',
            backdropFilter: 'blur(20px)',
            zIndex: 40,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(29, 158, 117, 0.3)',
              }}>
                <Activity size={16} color="white" strokeWidth={2.5} />
              </div>
              <span style={{
                fontSize: '1.375rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}>
                <span className="gradient-text">Voice</span>
                <span style={{ color: 'var(--text-primary)' }}>Rx</span>
              </span>
            </div>
          </header>

          {/* Page Content */}
          <main className="page-content">
            {children}
          </main>

          {/* Bottom Navigation */}
          <nav className="bottom-nav">
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              padding: '0.25rem 1rem',
            }}>
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    id={`nav-${item.label.toLowerCase()}`}
                    onClick={() => router.push(item.path)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.5rem 1.25rem',
                      border: 'none',
                      background: isActive ? 'var(--primary-glow)' : 'transparent',
                      borderRadius: 'var(--radius-xl)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <Icon
                      size={22}
                      color={isActive ? 'var(--primary)' : 'var(--text-muted)'}
                      strokeWidth={isActive ? 2.5 : 2}
                      style={{ transition: 'all 0.25s ease' }}
                    />
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      transition: 'all 0.25s ease',
                    }}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        marginTop: '-0.125rem',
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </body>
    </html>
  );
}
