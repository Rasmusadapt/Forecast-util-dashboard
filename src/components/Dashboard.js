import React, { useState } from 'react';
import StatCard from './StatCard';
import PersonRow from './PersonRow';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function pctColor(pct) {
  if (pct === null || pct === undefined) return '#a8a49a';
  if (pct >= 80) return '#4a7a2a';
  if (pct >= 60) return '#9a6820';
  return '#b83030';
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#F5F2E8', border: '1px solid rgba(26,25,20,0.18)', borderRadius: '3px', padding: '8px 12px', fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#1a1918' }}>
      <div style={{ marginBottom: '4px', fontWeight: 500 }}>{label}</div>
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

  const totalActual = data.reduce((s, p) => s + p.actual, 0);
  const totalPlanned = mode === 'utilization' ? data.reduce((s, p) => s + (p.planned ?? 0), 0) : null;
  const totalTimeOff = data.reduce((s, p) => s + (p.time_off ?? 0), 0);
  const teamVsPlan = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : null;
  const avgUtil = mode === 'timesheet'
    ? data.filter(p => p.utilPct !== null).reduce((s, p, _, a) => s + p.utilPct / a.length, 0)
    : null;

  const sorted = [...data].sort((a, b) => {
    if (sortKey === 'name') return a.name.localeCompare(b.name);
    if (sortKey === 'actual') return b.actual - a.actual;
    if (sortKey === 'pct') {
      const pa = mode === 'timesheet' ? (a.utilPct ?? -1) : (a.vsplan ?? -1);
      const pb = mode === 'timesheet' ? (b.utilPct ?? -1) : (b.vsplan ?? -1);
      return pb - pa;
    }
    return 0;
  });

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
    fontWeight: 400,
    background: 'var(--bg2)',
  };

  const sortBtn = (key, label) => (
    <button key={key} onClick={() => setSortKey(key)} style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      padding: '5px 14px',
      borderRadius: 'var(--radius)',
      border: '1px solid',
      cursor: 'pointer',
      transition: 'all 0.15s',
      borderColor: sortKey === key ? 'var(--text)' : 'var(--border)',
      background: sortKey === key ? 'var(--text)' : 'transparent',
      color: sortKey === key ? 'var(--bg)' : 'var(--text2)',
      letterSpacing: '0.06em',
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>A D A P T</span>
          <span style={{ color: 'var(--text3)', fontSize: '13px' }}>/</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 300, color: 'var(--text2)' }}>DM Dashboard</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text3)', background: 'var(--bg3)', padding: '3px 8px', borderRadius: '2px', letterSpacing: '0.04em' }}>{fileName}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {mode === 'timesheet' ? 'Timesheet' : 'Utilization'}
          </span>
        </div>
        <button onClick={onReset} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text2)', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '6px 16px', cursor: 'pointer', letterSpacing: '0.04em' }}>
          ← Ny fil
        </button>
      </div>

      <div style={{ padding: '2.5rem', maxWidth: '1280px', margin: '0 auto' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', marginBottom: '2.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <StatCard label="Faktisk timer" value={`${totalActual.toFixed(0)} h`} />
          {totalPlanned != null && <StatCard label="Planlagte timer" value={`${totalPlanned.toFixed(0)} h`} />}
          {teamVsPlan != null && (
            <StatCard
              label="Faktisk vs. planlagt"
              value={`${teamVsPlan.toFixed(0)}%`}
              accent={teamVsPlan >= 80 ? 'var(--green)' : teamVsPlan >= 50 ? 'var(--amber)' : 'var(--red)'}
              sub={`${(totalActual - totalPlanned).toFixed(0)} h gap`}
            />
          )}
          {avgUtil != null && (
            <StatCard
              label="Gns. billable util."
              value={`${avgUtil.toFixed(0)}%`}
              accent={avgUtil >= 80 ? 'var(--green)' : avgUtil >= 65 ? 'var(--amber)' : 'var(--red)'}
            />
          )}
          <StatCard label="Ferie / fravær" value={`${totalTimeOff.toFixed(0)} h`} sub={`${data.length} personer`} />
        </div>

        {/* Chart */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem', marginBottom: '1px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Timer per person</p>
              <p style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 300 }}>{mode === 'utilization' ? 'Faktisk vs. planlagt' : 'Faktisk billable timer'}</p>
            </div>
            {mode === 'utilization' && (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {[['var(--green)', 'Faktisk'], ['var(--teal)', 'Planlagt']].map(([c, l]) => (
                  <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '1px', background: c, display: 'inline-block' }} />{l}
                  </span>
                ))}
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barGap={2} barCategoryGap="28%">
              <XAxis dataKey="name" tick={{ fill: '#a8a49a', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a8a49a', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(26,25,20,0.04)' }} />
              {mode === 'utilization' && chartData[0]?.planned != null ? (
                <>
                  <Bar dataKey="planned" name="Planlagt" fill="var(--teal)" radius={[2,2,0,0]} opacity={0.4} />
                  <Bar dataKey="actual" name="Faktisk" radius={[2,2,0,0]}>
                    {chartData.map((e, i) => <Cell key={i} fill={pctColor(e.pct)} />)}
                  </Bar>
                </>
              ) : (
                <Bar dataKey="actual" name="Faktisk" radius={[2,2,0,0]}>
                  {chartData.map((e, i) => <Cell key={i} fill={pctColor(e.pct)} />)}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 var(--radius) var(--radius)', overflow: 'hidden', marginBottom: '2.5rem' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2px' }}>Detaljeret overblik</p>
              <p style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 300 }}>{data.length} personer</p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[['default','Standard'],['pct','%'],['actual','Timer'],['name','Navn']].map(([k,l]) => sortBtn(k,l))}
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
                  <th style={thStyle}>{mode === 'utilization' ? 'Akt / Plan vs. kapacitet' : 'Billable udnyttelse'}</th>
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

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text3)', letterSpacing: '0.05em' }}>
            A D A P T / DM Dashboard
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text3)' }}>
            {mode === 'timesheet'
              ? 'Billable udnyttelse = billable ÷ (billable + ikke-billable). Ferie ekskluderet.'
              : 'Faktisk udnyttelse = faktisk ÷ kapacitet. Akt vs. plan = faktisk ÷ planlagt.'}
          </span>
        </div>
      </div>
    </div>
  );
}
