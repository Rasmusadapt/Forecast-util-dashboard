import React from 'react';

function pctColor(pct) {
  if (pct === null || pct === undefined) return 'var(--text2)';
  if (pct >= 80) return 'var(--accent)';
  if (pct >= 60) return 'var(--amber)';
  return 'var(--red)';
}

function badge(pct, mode) {
  if (pct === null) return { label: '—', bg: 'var(--bg3)', color: 'var(--text2)' };
  if (mode === 'timesheet') {
    if (pct >= 90) return { label: 'Høj', bg: 'rgba(200,240,74,0.1)', color: 'var(--accent)' };
    if (pct >= 75) return { label: 'OK', bg: 'rgba(240,169,74,0.1)', color: 'var(--amber)' };
    return { label: 'Lav', bg: 'rgba(240,74,74,0.1)', color: 'var(--red)' };
  } else {
    if (pct >= 80) return { label: 'Over plan', bg: 'rgba(200,240,74,0.1)', color: 'var(--accent)' };
    if (pct >= 50) return { label: 'Følg', bg: 'rgba(240,169,74,0.1)', color: 'var(--amber)' };
    return { label: 'Under plan', bg: 'rgba(240,74,74,0.1)', color: 'var(--red)' };
  }
}

function Bar({ pct, color, max = 100 }) {
  const width = Math.min((pct / max) * 100, 100);
  return (
    <div style={{ background: 'var(--bg3)', borderRadius: '3px', height: '6px', width: '100%', overflow: 'hidden' }}>
      <div style={{ width: `${width}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
    </div>
  );
}

export default function PersonRow({ person, mode }) {
  const { name, actual, planned, non_billable, time_off, utilPct, vsplan, planPct } = person;

  const mainPct = mode === 'timesheet' ? utilPct : vsplan;
  const b = badge(mainPct, mode);

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Name */}
      <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>
        {name}
      </td>

      {/* Actual */}
      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)', textAlign: 'right' }}>
        {actual.toFixed(1)} h
      </td>

      {/* Planned (utilization mode only) */}
      {mode === 'utilization' && (
        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text2)', textAlign: 'right' }}>
          {planned != null ? `${planned.toFixed(1)} h` : '—'}
        </td>
      )}

      {/* Non-billable (timesheet mode only) */}
      {mode === 'timesheet' && (
        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text2)', textAlign: 'right' }}>
          {non_billable != null ? `${non_billable.toFixed(1)} h` : '—'}
        </td>
      )}

      {/* Time off */}
      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text3)', textAlign: 'right' }}>
        {time_off > 0 ? `${time_off.toFixed(1)} h` : '—'}
      </td>

      {/* Bar + pct */}
      <td style={{ padding: '12px 16px', minWidth: '160px' }}>
        {mode === 'utilization' && planned != null ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text3)', width: '22px' }}>Akt</span>
              <div style={{ flex: 1 }}><Bar pct={utilPct ?? 0} color={pctColor(vsplan)} max={100} /></div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text2)', width: '36px', textAlign: 'right' }}>{utilPct != null ? `${utilPct.toFixed(0)}%` : '—'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text3)', width: '22px' }}>Plan</span>
              <div style={{ flex: 1 }}><Bar pct={planPct ?? 0} color='var(--teal)' max={100} /></div>
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

      {/* Vs plan (utilization mode) */}
      {mode === 'utilization' && (
        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: pctColor(vsplan), textAlign: 'right' }}>
          {vsplan != null ? `${vsplan.toFixed(0)}%` : '—'}
        </td>
      )}

      {/* Badge */}
      <td style={{ padding: '12px 16px' }}>
        <span style={{
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: 600,
          padding: '3px 10px',
          borderRadius: '4px',
          background: b.bg,
          color: b.color,
          whiteSpace: 'nowrap',
        }}>{b.label}</span>
      </td>
    </tr>
  );
}
