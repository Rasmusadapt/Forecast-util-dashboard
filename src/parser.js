import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Detect which format the file is
function detectFormat(headers) {
  const h = headers.map(x => x.toLowerCase().trim());
  if (h.includes('work_is_billable') || h.includes('actual_hours')) return 'timesheet';
  if (h.includes('actual_total_time') && h.includes('planned_total_time')) return 'utilization';
  return 'unknown';
}

function parseCSV(text) {
  const result = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
  return result.data;
}

function parseXLSX(buffer) {
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: '' });
}

// --- Format 1: Timesheet (person, date, actual_hours, work_is_billable, project_name, task_name) ---
function processTimesheet(rows) {
  const people = {};

  for (const row of rows) {
    const person = (row['person'] || '').trim();
    if (!person) continue;

    // actual_hours may be in minutes (integers like 30, 60) or hours (floats like 0.5, 1.0)
    // From analysis: values like 30, 60, 120 are minutes
    const raw = parseFloat(row['actual_hours'] || 0);
    // Heuristic: if max value > 24 across dataset assume minutes
    if (!people[person]) people[person] = { billable: 0, non_billable: 0, time_off: 0, _rawVals: [] };
    people[person]._rawVals.push(raw);
  }

  // Determine if values are minutes or hours
  const allVals = Object.values(people).flatMap(p => p._rawVals);
  const maxVal = Math.max(...allVals);
  const divisor = maxVal > 24 ? 60 : 1; // if any single entry > 24, treat as minutes

  // Reset and reprocess
  for (const p of Object.values(people)) {
    p.billable = 0; p.non_billable = 0; p.time_off = 0;
  }

  for (const row of rows) {
    const person = (row['person'] || '').trim();
    if (!person) continue;
    const hours = parseFloat(row['actual_hours'] || 0) / divisor;
    const billable = (row['work_is_billable'] || '').trim();
    const project = (row['project_name'] || '');
    const task = (row['task_name'] || '');

    if (project.includes('Time Off') || task === 'Vacation' || task === 'Sick') {
      people[person].time_off += hours;
    } else if (billable === 'Yes') {
      people[person].billable += hours;
    } else {
      people[person].non_billable += hours;
    }
  }

  return Object.entries(people)
    .map(([name, d]) => {
      const totalWork = d.billable + d.non_billable;
      const utilPct = totalWork > 0 ? (d.billable / totalWork) * 100 : null;
      return {
        name,
        actual: d.billable,
        planned: null,
        non_billable: d.non_billable,
        time_off: d.time_off,
        available: null,
        utilPct,
        vsplan: null,
        mode: 'timesheet',
      };
    })
    .filter(p => p.actual > 0 || p.non_billable > 0 || p.time_off > 0)
    .sort((a, b) => (b.utilPct ?? -1) - (a.utilPct ?? -1));
}

// --- Format 2: Utilization (person, actual_total_time, planned_total_time, time_off, available_time) ---
function processUtilization(rows) {
  return rows
    .map(row => {
      const name = (row['person'] || row['role'] || '').trim();
      const actual = parseFloat(row['actual_total_time'] || 0) / 60;
      const planned = parseFloat(row['planned_total_time'] || 0) / 60;
      const time_off = parseFloat(row['time_off'] || 0) / 60;
      const available = parseFloat(row['available_time'] || 0) / 60;
      const vsplan = planned > 0 ? (actual / planned) * 100 : null;
      const utilPct = available > 0 ? (actual / available) * 100 : null;
      const planPct = available > 0 ? (planned / available) * 100 : null;
      return { name, actual, planned, time_off, available, vsplan, utilPct, planPct, non_billable: null, mode: 'utilization' };
    })
    .filter(p => p.actual > 0 || p.planned > 0)
    .sort((a, b) => (b.vsplan ?? -1) - (a.vsplan ?? -1));
}

export async function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    reader.onload = (e) => {
      try {
        let rows;
        if (isXLSX) {
          rows = parseXLSX(new Uint8Array(e.target.result));
        } else {
          rows = parseCSV(e.target.result);
        }

        if (!rows || rows.length === 0) { reject(new Error('Filen er tom eller kan ikke læses.')); return; }

        const headers = Object.keys(rows[0]);
        const format = detectFormat(headers);

        if (format === 'unknown') {
          reject(new Error('Ukendt filformat. Forventede kolonner: person, actual_hours, work_is_billable — eller — person, actual_total_time, planned_total_time.'));
          return;
        }

        const data = format === 'timesheet' ? processTimesheet(rows) : processUtilization(rows);
        resolve({ data, format, rowCount: rows.length });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Kunne ikke læse filen.'));
    if (isXLSX) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  });
}
