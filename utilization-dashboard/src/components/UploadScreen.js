import React, { useRef, useState } from 'react';

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'var(--bg)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  eyebrow: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    letterSpacing: '0.15em',
    color: 'var(--accent)',
    textTransform: 'uppercase',
    marginBottom: '1rem',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 800,
    lineHeight: 1.05,
    color: 'var(--text)',
    marginBottom: '0.75rem',
    letterSpacing: '-0.02em',
  },
  sub: {
    color: 'var(--text2)',
    fontSize: '15px',
    fontWeight: 400,
    lineHeight: 1.6,
    maxWidth: '480px',
    margin: '0 auto',
  },
  dropzone: {
    width: '100%',
    maxWidth: '520px',
    border: '1.5px dashed var(--border2)',
    borderRadius: 'var(--radius-lg)',
    padding: '3rem 2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'var(--bg2)',
    position: 'relative',
  },
  dropzoneActive: {
    borderColor: 'var(--accent)',
    background: 'rgba(200,240,74,0.04)',
  },
  icon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    display: 'block',
  },
  dropText: {
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: '0.4rem',
  },
  dropSub: {
    fontSize: '13px',
    color: 'var(--text2)',
    marginBottom: '1.5rem',
  },
  btn: {
    display: 'inline-block',
    background: 'var(--accent)',
    color: '#0c0c0f',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '13px',
    padding: '10px 24px',
    borderRadius: 'var(--radius)',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.02em',
  },
  formats: {
    marginTop: '2rem',
    display: 'flex',
    gap: '1rem',
    maxWidth: '520px',
    width: '100%',
  },
  formatCard: {
    flex: 1,
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1rem',
  },
  formatTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--accent)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  formatDesc: {
    fontSize: '12px',
    color: 'var(--text2)',
    lineHeight: 1.5,
  },
  error: {
    marginTop: '1rem',
    background: 'var(--red2)',
    border: '1px solid var(--red)',
    borderRadius: 'var(--radius)',
    padding: '0.75rem 1rem',
    color: 'var(--red)',
    fontSize: '13px',
    maxWidth: '520px',
    width: '100%',
    textAlign: 'left',
  },
  loading: {
    marginTop: '1.5rem',
    color: 'var(--text2)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
};

export default function UploadScreen({ onData }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const { parseFile } = await import('../parser.js');
      const result = await parseFile(file);
      onData(result, file.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>DM Dashboard</h1>
        <p style={styles.sub}>Upload en time-registreringsfil og få et øjeblikkeligt overblik over teamets udnyttelse.</p>
      </div>

      <div
        style={{ ...styles.dropzone, ...(dragging ? styles.dropzoneActive : {}) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <span style={styles.icon}>📂</span>
        <p style={styles.dropText}>Træk og slip en fil her</p>
        <p style={styles.dropSub}>CSV eller Excel (.xlsx)</p>
        <button style={styles.btn} onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
          Vælg fil
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {loading && (
        <div style={styles.loading}>
          <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
          Analyserer data...
        </div>
      )}

      {error && <div style={styles.error}>⚠ {error}</div>}

      <div style={styles.formats}>
        <div style={styles.formatCard}>
          <p style={styles.formatTitle}>Format 1 — Timesheet</p>
          <p style={styles.formatDesc}>Kolonner: person, actual_hours, work_is_billable, project_name, task_name, date</p>
        </div>
        <div style={styles.formatCard}>
          <p style={styles.formatTitle}>Format 2 — Utilization</p>
          <p style={styles.formatDesc}>Kolonner: person, actual_total_time, planned_total_time, time_off, available_time</p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
