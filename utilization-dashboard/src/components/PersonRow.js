import React from 'react';

function pctColor(pct) {
  if (pct === null || pct === undefined) return 'var(--text3)';
  if (pct >= 80) return 'var(--green)';
  if (pct >= 60) return 'var(--amber)';
  return 'var(--red)';
}

function badge(pct, mode) {
  if (pct === null) return { label: '—', bg: 'var(--bg3)', color: 'var(--text3)' };
  if (mode === 'timesheet') {
    if (pct >= 90) return { label: 'Høj', bg: 'var(--green2)', color: 'var(--green)' };
    if (pct >= 75) return { label: 'OK', bg: 'var(--amber2)', color: 'var(--amber)' };
    return { label: 'Lav', bg: 'var(--red2)', color: 'var(--red)' };
  } else {
    if (pct >= 80) return { label: 'Over plan', bg: 'var(--green2)', color: 'var(--green)' };
    if (pct >= 50) return { label: 'Følg', bg: 'var(--amber2)', color: 'var(--amber)' };
    return { label: 'Under plan', bg: 'var(--red2)', color: 'var(--red)' };
  }
}

function Bar({ pct, color, max = 100 }) {
  const width = Math.min((pct / max) * 100, 100);
  return (
    <div style={{ background: 'var(--bg3)', borderRadius: '2px', height: '4px', width: '100%', overflow: 'hidden' }}>
      <div style={{ width: `${Math.max(width, 0)}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.5s ease' }} />
    </div>
  );
}

export default function PersonRow({ person, mode }) {
  const { name, actual, planned, non_billable, time_off, utilPct, vsplan, planPct } = person;
  const mainPct = mode === 'timesheet' ? utilPct : vsplan;
  const b = badge(mainPct, mode);

  const td = {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text)',
    fontSize: '14px',
    verticalAlign: 'middle',
  };

  return (
    <tr>
      <td style={{ ...td, fontWeight: 400 }}>{name}</td>
      <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: '13px', textAlign: 'right' }}>{actual.toFixed(1)} h</td>

      {mode === 'utilization' && (
        <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: '13px', textAlign: 'right', color: 'var(--text2)' }}>
          {planned != null ? `${planned.toFixed(1)} h` : '—'}
        </td>
      )}
      {mode === 'timesheet' && (
        <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: '13px', textAlign: 'right', color: 'var(--text2)' }}>
          {non_billable != null ? `${non_billable.toFixed(1)} h` : '—'}
        </td>
      )}

      <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: '13px', textAlign: 'right', color: 'var(--text3)' }}>
        {time_off > 0 ? `${time_off.toFixed(1)} h` : '—'}
      </td>

      <td style={{ ...td, minWidth: '180px' }}>
        {mode === 'utilization' && planned != null ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text3)', width: '22px', letterSpacing: '0.06em' }}>AKT</span>
              <div style={{ flex: 1 }}><Bar pct={utilPct ?? 0} color={pctColor(vsplan)} /></div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text2)', width: '36px', textAlign: 'right' }}>{utilPct != null ? `${utilPct.toFixed(0)}%` : '—'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text3)', width: '22px', letterSpacing: '0.06em' }}>PLAN</span>
              <div style={{ flex: 1 }}><Bar pct={planPct ?? 0} color='var(--teal)' /></div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text2)', width: '36px', textAlign: 'right' }}>{planPct != null ? `${planPct.toFixed(0)}%` : '—'}</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1 }}><Bar pct={mainPct ?? 0} color={pctColor(mainPct)} /></div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: pctColor(mainPct), width: '40px', textAlign: 'right', fontWeight: 500 }}>
              {mainPct != null ? `${mainPct.toFixed(0)}%` : '—'}
            </span>
          </div>
        )}
      </td>

      {mode === 'utilization' && (
        <td style={{ ...td, fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500, color: pctColor(vsplan), textAlign: 'right' }}>
          {vsplan != null ? `${vsplan.toFixed(0)}%` : '—'}
        </td>
      )}

      <td style={{ ...td }}>
        <span style={{
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: 400,
          padding: '3px 10px',
          borderRadius: '2px',
          background: b.bg,
          color: b.color,
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.04em',
        }}>{b.label}</span>
      </td>
    </tr>
  );
}
