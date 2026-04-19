// ── Storage keys ──────────────────────────────────────────────────────
const KEYS = {
  entries:      'vl_entries',
  checkins:     'vl_checkins',
  appointments: 'vl_appointments',
  medications:  'vl_medications',
  contacts:     'vl_contacts',
  settings:     'vl_settings',
};

// ── Generic helpers ────────────────────────────────────────────────────
function load(key)        { try { return JSON.parse(localStorage.getItem(key)) ?? []; } catch { return []; } }
function loadObj(key)     { try { return JSON.parse(localStorage.getItem(key)) ?? {}; } catch { return {}; } }
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

// ── Entry types ────────────────────────────────────────────────────────
export const ENTRY_TYPES = {
  panic:     { label: 'Panic Attack',  color: 'var(--rose)',    icon: '⚡' },
  headache:  { label: 'Headache',      color: 'var(--violet)',  icon: '🤯' },
  toothache: { label: 'Toothache',     color: 'var(--amber)',   icon: '🦷' },
  illness:   { label: 'Illness',       color: 'var(--sky)',     icon: '🤒' },
  pain:      { label: 'Pain / Other',  color: 'var(--coral)',   icon: '💢' },
};

export const APPT_TYPES = {
  dentist:       { label: 'Dentist',        icon: '🦷' },
  chiropractor:  { label: 'Chiropractor',   icon: '🦴' },
  gp:            { label: 'GP / Doctor',    icon: '🩺' },
  specialist:    { label: 'Specialist',     icon: '🔬' },
  physio:        { label: 'Physio',         icon: '💪' },
  other:         { label: 'Other',          icon: '📅' },
};

// ── Entries ────────────────────────────────────────────────────────────
export function getEntries()       { return load(KEYS.entries); }
export function saveEntry(data)    {
  const entries = getEntries();
  const entry = { id: `e_${Date.now()}`, timestamp: new Date().toISOString(), ...data };
  entries.unshift(entry);
  save(KEYS.entries, entries);
  return entry;
}
export function updateEntry(id, updates) {
  const entries = getEntries();
  const i = entries.findIndex(e => e.id === id);
  if (i !== -1) { entries[i] = { ...entries[i], ...updates }; save(KEYS.entries, entries); }
}
export function deleteEntry(id)    { save(KEYS.entries, getEntries().filter(e => e.id !== id)); }

// ── Daily check-ins ────────────────────────────────────────────────────
export function getCheckins()      { return load(KEYS.checkins); }
export function getTodayCheckin()  {
  const today = new Date().toDateString();
  return getCheckins().find(c => new Date(c.date).toDateString() === today) ?? null;
}
export function saveCheckin(data)  {
  const checkins = getCheckins();
  const today = new Date().toDateString();
  const existing = checkins.findIndex(c => new Date(c.date).toDateString() === today);
  const checkin = { id: `c_${Date.now()}`, date: new Date().toISOString(), ...data };
  if (existing !== -1) checkins[existing] = checkin;
  else checkins.unshift(checkin);
  save(KEYS.checkins, checkins);
  return checkin;
}

// ── Appointments ───────────────────────────────────────────────────────
export function getAppointments()  { return load(KEYS.appointments); }
export function saveAppointment(data) {
  const appts = getAppointments();
  const appt = { id: `a_${Date.now()}`, createdAt: new Date().toISOString(), ...data };
  appts.push(appt);
  appts.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  save(KEYS.appointments, appts);
  return appt;
}
export function updateAppointment(id, updates) {
  const appts = getAppointments();
  const i = appts.findIndex(a => a.id === id);
  if (i !== -1) { appts[i] = { ...appts[i], ...updates }; save(KEYS.appointments, appts); }
}
export function deleteAppointment(id) { save(KEYS.appointments, getAppointments().filter(a => a.id !== id)); }

// ── Medications ────────────────────────────────────────────────────────
export function getMedications()   { return load(KEYS.medications); }
export function saveMedication(data) {
  const meds = getMedications();
  const med = { id: `m_${Date.now()}`, ...data };
  meds.push(med);
  save(KEYS.medications, meds);
  return med;
}
export function updateMedication(id, updates) {
  const meds = getMedications();
  const i = meds.findIndex(m => m.id === id);
  if (i !== -1) { meds[i] = { ...meds[i], ...updates }; save(KEYS.medications, meds); }
}
export function deleteMedication(id) { save(KEYS.medications, getMedications().filter(m => m.id !== id)); }

// ── Emergency contacts ─────────────────────────────────────────────────
export function getContacts()      { return load(KEYS.contacts); }
export function saveContact(data)  {
  const contacts = getContacts();
  const contact = { id: `k_${Date.now()}`, ...data };
  contacts.push(contact);
  save(KEYS.contacts, contacts);
  return contact;
}
export function updateContact(id, updates) {
  const contacts = getContacts();
  const i = contacts.findIndex(c => c.id === id);
  if (i !== -1) { contacts[i] = { ...contacts[i], ...updates }; save(KEYS.contacts, contacts); }
}
export function deleteContact(id)  { save(KEYS.contacts, getContacts().filter(c => c.id !== id)); }

// ── Settings ───────────────────────────────────────────────────────────
export function getSettings()      { return loadObj(KEYS.settings); }
export function updateSettings(updates) {
  save(KEYS.settings, { ...getSettings(), ...updates });
}

// ── Export / Import ────────────────────────────────────────────────────
export function exportAllData() {
  const blob = new Blob([JSON.stringify({
    version: 2,
    exportedAt: new Date().toISOString(),
    entries:      getEntries(),
    checkins:     getCheckins(),
    appointments: getAppointments(),
    medications:  getMedications(),
    contacts:     getContacts(),
    settings:     getSettings(),
  }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vital-log-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(jsonText) {
  const data = JSON.parse(jsonText);
  let imported = 0;

  if (data.entries?.length) {
    const existing = new Set(getEntries().map(e => e.timestamp));
    const newOnes = data.entries.filter(e => !existing.has(e.timestamp));
    save(KEYS.entries, [...getEntries(), ...newOnes].sort((a,b) => new Date(b.timestamp)-new Date(a.timestamp)));
    imported += newOnes.length;
  }
  if (data.checkins?.length) {
    const existing = new Set(getCheckins().map(c => c.date?.slice(0,10)));
    const newOnes = data.checkins.filter(c => !existing.has(c.date?.slice(0,10)));
    save(KEYS.checkins, [...getCheckins(), ...newOnes]);
    imported += newOnes.length;
  }
  if (data.appointments?.length) {
    save(KEYS.appointments, data.appointments);
  }
  if (data.medications?.length) {
    save(KEYS.medications, data.medications);
  }
  if (data.contacts?.length) {
    save(KEYS.contacts, data.contacts);
  }
  return imported;
}

export function exportEntriesCSV(entries) {
  const headers = ['Date','Time','Type','Severity','Duration','Mood','Triggers','Symptoms','Location','Pain Location','Pain Type','Coping','Sleep','Caffeine','Alcohol','Stress','Notes','False Alarm'];
  const rows = entries.map(e => {
    const d = new Date(e.timestamp);
    return [
      d.toLocaleDateString(), d.toLocaleTimeString(),
      e.type ?? '', e.severity ?? '', e.duration ?? '', e.mood ?? '',
      (e.triggers??[]).join(';'), (e.symptoms??[]).join(';'),
      e.location ?? '', (e.painLocations??[]).join(';'), e.painType ?? '',
      (e.coping??[]).join(';'), e.sleep ?? '',
      e.caffeine?'Yes':'No', e.alcohol?'Yes':'No',
      e.stress ?? '', (e.notes??'').replace(/\n/g,' '),
      e.falseAlarm?'Yes':'No',
    ].map(v => `"${v}"`).join(',');
  });
  const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vital-log-entries-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Google Fit sync ────────────────────────────────────────────────────
const GFIT_CLIENT_ID = ''; // Set in settings if user provides
const GFIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.body.read',
].join(' ');

export async function syncGoogleFit(clientId) {
  return new Promise((resolve, reject) => {
    const redirectUri = window.location.origin + window.location.pathname;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(GFIT_SCOPES)}`;
    const popup = window.open(authUrl, 'gfit_auth', 'width=500,height=600');
    const check = setInterval(() => {
      try {
        if (popup.closed) { clearInterval(check); reject(new Error('Cancelled')); return; }
        const hash = popup.location.hash;
        if (hash && hash.includes('access_token')) {
          clearInterval(check);
          popup.close();
          const params = new URLSearchParams(hash.slice(1));
          resolve(params.get('access_token'));
        }
      } catch {}
    }, 500);
  });
}

export async function fetchGoogleFitData(token) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const body = {
    aggregateBy: [
      { dataTypeName: 'com.google.step_count.delta' },
      { dataTypeName: 'com.google.heart_rate.bpm' },
      { dataTypeName: 'com.google.sleep.segment' },
    ],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: thirtyDaysAgo,
    endTimeMillis: now,
  };
  const res = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Google Fit API error');
  const data = await res.json();
  return processGFitData(data);
}

function processGFitData(data) {
  const results = { steps: [], heartRate: [], sleep: [] };
  for (const bucket of (data.bucket ?? [])) {
    const date = new Date(parseInt(bucket.startTimeMillis)).toISOString().slice(0,10);
    for (const dataset of (bucket.dataset ?? [])) {
      for (const point of (dataset.point ?? [])) {
        const type = point.dataTypeName;
        const val = point.value?.[0];
        if (type === 'com.google.step_count.delta' && val?.intVal) {
          results.steps.push({ date, steps: val.intVal });
        }
        if (type === 'com.google.heart_rate.bpm' && val?.fpVal) {
          results.heartRate.push({ date, bpm: Math.round(val.fpVal) });
        }
        if (type === 'com.google.sleep.segment') {
          results.sleep.push({ date, type: val?.intVal });
        }
      }
    }
  }
  return results;
}

export function storeGFitData(data) {
  const existing = loadObj('vl_gfit') ?? {};
  const merged = {
    syncedAt: new Date().toISOString(),
    steps: [...(existing.steps ?? []), ...data.steps],
    heartRate: [...(existing.heartRate ?? []), ...data.heartRate],
    sleep: [...(existing.sleep ?? []), ...data.sleep],
  };
  save('vl_gfit', merged);
  return merged;
}

export function getGFitData() { return loadObj('vl_gfit'); }
