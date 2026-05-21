import React, { useState } from 'react';
import StatCard from './StatCard';
import PersonRow from './PersonRow';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function pctColor(pct) {
  if (pct === null || pct === undefined) return '#55555e';
  if (pct >= 80) return '#c8f04a';
  if (pct >= 60) return '#f0a94a';
  return '#f04a4a';
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1c1c22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#f0f0ee' }}>
      <div style={{ marginBottom: '4px', fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value?.toFixed(1)} h</div>
      ))}
    </div>
  );
};

export default function Dashboard({ result, fileName, onReset }) {
  const { data, format } = result;
  const [sortKey, setSortKey] = useState('default');
  const mode = format === 'timesheet' ? 'timesheet' : 'utilization';

  // Stats
  const totalActual = data.reduce((s, p) => s + p.actual, 0);
  const totalPlanned = mode === 'utilization' ? data.reduce((s, p) => s + (p.planned ?? 0), 0) : null;
  const totalTimeOff = data.reduce((s, p) => s + (p.time_off ?? 0), 0);
  const teamVsPlan = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : null;

  const avgUtil = mode === 'timesheet'
    ? data.filter(p => p.utilPct !== null).reduce((s, p, _, a) => s + p.utilPct / a.length, 0)
    : null;

  // Sorted data
  const sorted = [...data].sort((a, b) => {
    if (sortKey === 'name') return a.name.localeCompare(b.name);
    if (sortKey === 'actual') return b.actual - a.actual;
    if (sortKey === 'pct') {
      const pa = mode === 'timesheet' ? (a.utilPct ?? -1) : (a.vsplan ?? -1);
      const pb = mode === 'timesheet' ? (b.utilPct ?? -1) : (b.vsplan ?? -1);
      return pb - pa;
    }
    return 0; // default: keep parser order
  });

  // Chart data
  const chartData = [...data]
    .sort((a, b) => b.actual - a.actual)
    .slice(0, 15)
    .map(p => ({
      name: p.name.split(' ')[0],
      fullName: p.name,
      actual: parseFloat(p.actual.toFixed(1)),
      planned: p.planned != null ? parseFloat(p.planned.toFixed(1)) : null,
      pct: mode === 'timesheet' ? p.utilPct : p.vsplan,
    }));

  const thStyle = {
    padding: '10px 16px',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text3)',
    textAlign: 'left',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.01em' }}>Utilization<span style={{ color: 'var(--accent)' }}>.</span></span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text3)', background: 'var(--bg3)', padding: '3px 8px', borderRadius: '4px' }}>{fileName}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)', background: 'rgba(200,240,74,0.08)', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {mode === 'timesheet' ? 'Timesheet' : 'Utilization'}
          </span>
        </div>
        <button onClick={onReset} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text2)', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '6px 14px', cursor: 'pointer', transition: 'all 0.15s' }}>
          ← Ny fil
        </button>
      </div>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '2rem' }}>
          <StatCard label="Faktisk timer" value={`${totalActual.toFixed(0)} h`} />
          {totalPlanned != null && <StatCard label="Planlagte timer" value={`${totalPlanned.toFixed(0)} h`} />}
          {teamVsPlan != null && (
            <StatCard
              label="Faktisk vs. planlagt"
              value={`${teamVsPlan.toFixed(0)}%`}
              accent={teamVsPlan >= 80 ? 'var(--accent)' : teamVsPlan >= 50 ? 'var(--amber)' : 'var(--red)'}
              sub={`${(totalActual - totalPlanned).toFixed(0)} h gap`}
            />
          )}
          {avgUtil != null && (
            <StatCard
              label="Gns. billable util."
              value={`${avgUtil.toFixed(0)}%`}
              accent={avgUtil >= 80 ? 'var(--accent)' : avgUtil >= 65 ? 'var(--amber)' : 'var(--red)'}
            />
          )}
          <StatCard label="Ferie / fravær" value={`${totalTimeOff.toFixed(0)} h`} sub={`${data.length} personer`} />
        </div>

        {/* Chart */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Timer per person</p>
              <p style={{ fontSize: '14px', color: 'var(--text2)' }}>{mode === 'utilization' ? 'Faktisk (grøn) vs. planlagt (teal)' : 'Faktisk billable timer'}</p>
            </div>
            {mode === 'utilization' && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text2)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent)', display: 'inline-block' }} />Faktisk
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text2)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--teal)', display: 'inline-block' }} />Planlagt
                </span>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={2} barCategoryGap="25%">
              <XAxis dataKey="name" tick={{ fill: '#55555e', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#55555e', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              {mode === 'utilization' && chartData[0]?.planned != null ? (
                <>
                  <Bar dataKey="planned" name="Planlagt" fill="var(--teal)" radius={[3, 3, 0, 0]} opacity={0.5} />
                  <Bar dataKey="actual" name="Faktisk" radius={[3, 3, 0, 0]}>
                    {chartData.map((entry, i) => <Cell key={i} fill={pctColor(entry.pct)} />)}
                  </Bar>
                </>
              ) : (
                <Bar dataKey="actual" name="Faktisk" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={pctColor(entry.pct)} />)}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2px' }}>Detaljeret overblik</p>
              <p style={{ fontSize: '14px', color: 'var(--text2)' }}>{data.length} personer</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['default', 'pct', 'actual', 'name'].map(k => (
                <button key={k} onClick={() => setSortKey(k)} style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '5px 12px', borderRadius: 'var(--radius)',
                  border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                  borderColor: sortKey === k ? 'var(--accent)' : 'var(--border)',
                  background: sortKey === k ? 'rgba(200,240,74,0.1)' : 'transparent',
                  color: sortKey === k ? 'var(--accent)' : 'var(--text2)',
                }}>
                  {{ default: 'Standard', pct: '%', actual: 'Timer', name: 'Navn' }[k]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle} onClick={() => setSortKey('name')}>Person</th>
                  <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => setSortKey('actual')}>Faktisk h</th>
                  {mode === 'utilization' && <th style={{ ...thStyle, textAlign: 'right' }}>Planlagt h</th>}
                  {mode === 'timesheet' && <th style={{ ...thStyle, textAlign: 'right' }}>Ikke-bill h</th>}
                  <th style={{ ...thStyle, textAlign: 'right' }}>Fri/syg h</th>
                  <th style={thStyle}>{mode === 'utilization' ? 'Akt. vs. kapacitet / Plan vs. kapacitet' : 'Billable udnyttelse'}</th>
                  {mode === 'utilization' && <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => setSortKey('pct')}>Akt vs. Plan</th>}
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((person, i) => (
                  <PersonRow key={i} person={person} mode={mode} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p style={{ marginTop: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text3)', textAlign: 'center' }}>
          {mode === 'timesheet'
            ? 'Billable udnyttelse = billable timer ÷ (billable + ikke-billable). Ferie og sygedage ekskluderet.'
            : 'Faktisk udnyttelse = faktisk ÷ kapacitet. Akt vs. plan = faktisk ÷ planlagt. Kapacitet ekskl. fravær.'}
        </p>
      </div>
    </div>
  );
}
