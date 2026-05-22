# Utilization Dashboard

Et simpelt dashboard til at visualisere team-udnyttelse fra CSV/Excel-filer.

## Understøttede filformater

### Format 1 — Timesheet
Kolonner: `person`, `actual_hours`, `work_is_billable`, `project_name`, `task_name`, `date`

Viser billable udnyttelse per person (billable ÷ total arbejdstid).

### Format 2 — Utilization
Kolonner: `person`, `actual_total_time`, `planned_total_time`, `time_off`, `available_time`

Viser faktisk vs. planlagt udnyttelse per person.

---

## Deploy til Vercel

### Option 1 — Vercel CLI (anbefalet)
```bash
npm install -g vercel
cd utilization-dashboard
npm install
vercel
```
Følg prompten — vælg defaults. Din app er live på `https://utilization-dashboard-xxx.vercel.app`.

### Option 2 — GitHub + Vercel UI
1. Push mappen til et GitHub repo
2. Gå til [vercel.com](https://vercel.com) → "New Project"
3. Importer dit repo
4. Vercel auto-detekterer Create React App — klik "Deploy"

---

## Kør lokalt
```bash
npm install
npm start
```
Åbner på `http://localhost:3000`
