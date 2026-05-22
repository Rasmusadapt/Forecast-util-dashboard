import React, { useRef, useState } from 'react';

const s = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '2rem 3rem',
    borderBottom: '1px solid var(--border)',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 400,
    fontSize: '13px',
    letterSpacing: '0.25em',
    color: 'var(--text)',
    textTransform: 'uppercase',
  },
  logoSlash: {
    margin: '0 8px',
    color: 'var(--text3)',
  },
  logoSub: {
    fontFamily: 'var(--font-display)',
    fontSize: '13px',
    fontWeight: 300,
    color: 'var(--text2)',
    letterSpacing: '0.05em',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(3rem, 8vw, 6rem)',
    fontWeight: 300,
    lineHeight: 1.0,
    color: 'var(--text)',
    marginBottom: '1.5rem',
    letterSpacing: '-0.02em',
    textAlign: 'center',
  },
  sub: {
    color: 'var(--text2)',
    fontSize: '15px',
    fontWeight: 400,
    lineHeight: 1.7,
    maxWidth: '440px',
    textAlign: 'center',
    marginBottom: '3.5rem',
  },
  dropzone: {
    width: '100%',
    maxWidth: '480px',
    border: '1px solid var(--border2)',
    borderRadius: 'var(--radius)',
    padding: '3rem 2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'var(--bg2)',
  },
  dropzoneActive: {
    borderColor: 'var(--text)',
    background: 'var(--bg3)',
  },
  dropIcon: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    display: 'block',
    opacity: 0.4,
  },
  dropText: {
    fontSize: '15px',
    fontWeight: 500,
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
    background: 'var(--text)',
    color: 'var(--bg)',
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    fontSize: '13px',
    padding: '10px 28px',
    borderRadius: 'var(--radius)',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
  formats: {
    marginTop: '2rem',
    display: 'flex',
    gap: '1rem',
    maxWidth: '480px',
    width: '100%',
  },
  formatCard: {
    flex: 1,
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1rem 1.2rem',
    background: 'transparent',
  },
  formatTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--text3)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '0.4rem',
  },
  formatDesc: {
    fontSize: '12px',
    color: 'var(--text2)',
    lineHeight: 1.6,
  },
  error: {
    marginTop: '1rem',
    background: 'var(--red2)',
    border: '1px solid var(--red)',
    borderRadius: 'var(--radius)',
    padding: '0.75rem 1rem',
    color: 'var(--red)',
    fontSize: '13px',
    maxWidth: '480px',
    width: '100%',
    textAlign: 'left',
  },
  loading: {
    marginTop: '1.5rem',
    color: 'var(--text2)',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    letterSpacing: '0.05em',
  },
  footer: {
    padding: '1.5rem 3rem',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text3)',
    letterSpacing: '0.05em',
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
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div style={s.wrap}>
      <div style={s.topbar}>
        <span style={s.logo}>
          A D A P T <span style={s.logoSlash}>/</span>
          <span style={s.logoSub}>DM Dashboard</span>
        </span>
      </div>

      <div style={s.main}>
        <h1 style={s.title}>DM<br />Dashboard</h1>
        <p style={s.sub}>Upload en time-registreringsfil og få et øjeblikkeligt overblik over teamets udnyttelse.</p>

        <div
          style={{ ...s.dropzone, ...(dragging ? s.dropzoneActive : {}) }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <span style={s.dropIcon}>↑</span>
          <p style={s.dropText}>Træk og slip en fil her</p>
          <p style={s.dropSub}>CSV eller Excel (.xlsx)</p>
          <button style={s.btn} onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
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

        {loading && <p style={s.loading}>Analyserer data...</p>}
        {error && <div style={s.error}>⚠ {error}</div>}

        <div style={s.formats}>
          <div style={s.formatCard}>
            <p style={s.formatTitle}>Format 1 — Timesheet</p>
            <p style={s.formatDesc}>person, actual_hours, work_is_billable, project_name, task_name</p>
          </div>
          <div style={s.formatCard}>
            <p style={s.formatTitle}>Format 2 — Utilization</p>
            <p style={s.formatDesc}>person, actual_total_time, planned_total_time, time_off, available_time</p>
          </div>
        </div>
      </div>

      <div style={s.footer}>
        <span style={s.footerText}>Adapt / DM Dashboard</span>
        <span style={s.footerText}>adaptagency.com</span>
      </div>
    </div>
  );
}
