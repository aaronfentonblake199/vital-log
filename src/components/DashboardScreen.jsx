import React, { useState } from 'react';
import { Plus, Download, Upload, Calendar } from 'lucide-react';
import {
  ENTRY_TYPES, APPT_TYPES,
  exportAllData, importData,
  saveAppointment, saveCheckin, getTodayCheckin
} from '../utils/storage.js';
import EntryCard from './EntryCard.jsx';
import CheckInStrip from './CheckInStrip.jsx';
import './DashboardScreen.css';

export default function DashboardScreen({ entries, checkins, appts, onLog, onRefresh, showToast }) {
  const [showApptForm, setShowApptForm] = useState(false);

  const today    = new Date();
  const todayStr = today.toDateString();

  const todayEntries = entries.filter(e => new Date(e.timestamp).toDateString() === todayStr && !e.falseAlarm);
  const weekEntries  = entries.filter(e => {
    const wk = new Date(); wk.setDate(wk.getDate() - 7);
    return new Date(e.timestamp) >= wk && !e.falseAlarm;
  });

  const upcoming     = appts.filter(a => new Date(a.datetime) >= today).slice(0, 3);
  const todayCheckin = getTodayCheckin();

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const added = importData(ev.target.result);
        onRefresh();
        showToast(`Imported ${added} new records`);
      } catch {
        showToast('Import failed — check file format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const h = today.getHours();
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="screen">
      <div className="screen-scroll">

        <div className="dash-header">
          <div>
            <h1 className="screen-title">{greeting}</h1>
            <p className="screen-sub">{today.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })}</p>
          </div>
          <div className="dash-actions">
            <button className="icon-btn" onClick={exportAllData} title="Export backup"><Download size={16}/></button>
            <label className="icon-btn" title="Import backup">
              <Upload size={16}/>
              <input type="file" accept=".json,.csv" style={{display:'none'}} onChange={handleImport}/>
            </label>
          </div>
        </div>

        <CheckInStrip
          checkin={todayCheckin}
          onSave={(data) => { saveCheckin(data); onRefresh(); showToast('Check-in saved ✓'); }}
        />

        <div className="stats-row">
          {[
            { num: todayEntries.length, label: 'Today' },
            { num: weekEntries.length,  label: 'This week' },
            { num: entries.filter(e => !e.falseAlarm).length, label: 'Total' },
          ].map(({ num, label }) => (
            <div key={label} className="stat-cell">
              <span className="stat-num">{num}</span>
              <span className="stat-lbl">{label}</span>
            </div>
          ))}
        </div>

        <div className="section-label">Log an event</div>
        <div className="log-grid">
          {Object.entries(ENTRY_TYPES).map(([key, { label, icon, color }]) => (
            <button key={key} className="log-tile" style={{ '--tc': color }} onClick={() => onLog(key)}>
              <span className="log-tile-icon">{icon}</span>
              <span className="log-tile-label">{label}</span>
              <div className="log-tile-ring"/>
            </button>
          ))}
        </div>

        {upcoming.length > 0 && (
          <div className="upcoming-section">
            <div className="section-label">Upcoming appointments</div>
            {upcoming.map(appt => <ApptChip key={appt.id} appt={appt}/>)}
          </div>
        )}

        <div className="add-appt-row">
          <button className="btn btn-ghost" style={{fontSize:13}} onClick={() => setShowApptForm(v => !v)}>
            <Calendar size={14}/> Add appointment
          </button>
        </div>

        {showApptForm && (
          <ApptForm
            onSave={(data) => { saveAppointment(data); onRefresh(); setShowApptForm(false); showToast('Appointment saved ✓'); }}
            onClose={() => setShowApptForm(false)}
          />
        )}

        <div className="section-label" style={{marginTop:24}}>Recent entries</div>
        {entries.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🌿</div>
            <p>Nothing logged yet.<br/>Tap an event above to start tracking.</p>
          </div>
        ) : (
          entries.slice(0, 8).map(e => (
            <EntryCard key={e.id} entry={e} onEdit={() => onLog(e.type, e)}/>
          ))
        )}

      </div>
    </div>
  );
}

function ApptChip({ appt }) {
  const d    = new Date(appt.datetime);
  const info = APPT_TYPES[appt.apptType] ?? { label: appt.apptType, icon: '📅' };
  return (
    <div className="appt-chip card card-sm">
      <span className="appt-icon">{info.icon}</span>
      <div className="appt-info">
        <span className="appt-label">{info.label}</span>
        {appt.provider && <span className="appt-provider">{appt.provider}</span>}
      </div>
      <div className="appt-time">
        <span>{d.toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</span>
        <span>{d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}</span>
      </div>
    </div>
  );
}

function ApptForm({ onSave, onClose }) {
  const [apptType, setApptType] = useState('gp');
  const [datetime, setDatetime] = useState('');
  const [provider, setProvider] = useState('');
  const [notes,    setNotes]    = useState('');

  return (
    <div className="appt-form card">
      <div className="appt-form-title">New Appointment</div>
      <label className="field-label">Type</label>
      <div className="pill-row" style={{marginBottom:16, flexWrap:'wrap'}}>
        {Object.entries(APPT_TYPES).map(([k, v]) => (
          <button key={k} className={`pill ${apptType === k ? 'on' : ''}`} onClick={() => setApptType(k)}>
            {v.icon} {v.label}
          </button>
        ))}
      </div>
      <label className="field-label">Date & Time</label>
      <input className="text-input" type="datetime-local" value={datetime}
        onChange={e => setDatetime(e.target.value)} style={{marginBottom:12}}/>
      <label className="field-label">Provider / clinic (optional)</label>
      <input className="text-input" placeholder="e.g. Dr Smith" value={provider}
        onChange={e => setProvider(e.target.value)} style={{marginBottom:12}}/>
      <label className="field-label">Notes (optional)</label>
      <textarea className="textarea" placeholder="What is this appointment for?"
        value={notes} onChange={e => setNotes(e.target.value)} style={{minHeight:70, marginBottom:16}}/>
      <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!datetime}
          onClick={() => onSave({ apptType, datetime, provider, notes })}>
          <Plus size={14}/> Save
        </button>
      </div>
    </div>
  );
}
