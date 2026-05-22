import React from 'react';

export default function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text3)',
      }}>{label}</span>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2rem',
        fontWeight: 300,
        color: accent || 'var(--text)',
        lineHeight: 1.0,
        letterSpacing: '-0.02em',
      }}>{value}</span>
      {sub && <span style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{sub}</span>}
    </div>
  );
}
