import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, ExternalLink, Phone, Pill, User } from 'lucide-react';
import {
  getMedications, saveMedication, deleteMedication,
  getContacts, saveContact, deleteContact,
  getSettings, updateSettings,
  syncGoogleFit, fetchGoogleFitData, storeGFitData, getGFitData,
  exportAllData, exportEntriesCSV, getEntries,
} from '../utils/storage.js';
import './SettingsScreen.css';

export default function SettingsScreen({ entries, onRefresh, showToast }) {
  const [meds,      setMeds]      = useState(getMedications());
  const [contacts,  setContacts]  = useState(getContacts());
  const [settings,  setSettings]  = useState(getSettings());
  const [gfitData,  setGfitData]  = useState(getGFitData());
  const [syncing,   setSyncing]   = useState(false);
  const [section,   setSection]   = useState('overview');

  const [newMed,    setNewMed]    = useState({ name:'', dose:'', frequency:'' });
  const [newContact,setNewContact]= useState({ name:'', role:'', phone:'' });
  const [clientId,  setClientId]  = useState(settings.gfitClientId ?? '');

  const refreshMeds     = () => setMeds(getMedications());
  const refreshContacts = () => setContacts(getContacts());

  const handleSaveMed = () => {
    if (!newMed.name) return;
    saveMedication(newMed);
    refreshMeds();
    setNewMed({ name:'', dose:'', frequency:'' });
    showToast('Medication saved');
  };

  const handleSaveContact = () => {
    if (!newContact.name) return;
    saveContact(newContact);
    refreshContacts();
    setNewContact({ name:'', role:'', phone:'' });
    showToast('Contact saved');
  };

  const handleGFitSync = async () => {
    const cid = clientId || settings.gfitClientId;
    if (!cid) { showToast('Enter your Google Client ID first'); return; }
    try {
      setSyncing(true);
      updateSettings({ gfitClientId: cid });
      const token = await syncGoogleFit(cid);
      const data  = await fetchGoogleFitData(token);
      const stored= storeGFitData(data);
      setGfitData(stored);
      showToast('Google Fit synced ✓');
    } catch (err) {
      showToast(err.message === 'Cancelled' ? 'Sync cancelled' : 'Sync failed — check Client ID');
    } finally {
      setSyncing(false);
    }
  };

  const SECTIONS = [
    { id:'overview',   label:'Overview' },
    { id:'meds',       label:'Medications' },
    { id:'contacts',   label:'Contacts' },
    { id:'gfit',       label:'Google Fit' },
    { id:'data',       label:'Data' },
  ];

  return (
    <div className="screen">
      <div className="screen-scroll">
        <h1 className="screen-title" style={{marginBottom:16}}>Settings</h1>

        <div className="settings-tabs">
          {SECTIONS.map(s => (
            <button key={s.id} className={`settings-tab ${section===s.id?'on':''}`}
              onClick={() => setSection(s.id)}>{s.label}</button>
          ))}
        </div>

        {section === 'overview' && <OverviewSection entries={entries} gfitData={gfitData}/>}
        {section === 'meds'     && (
          <MedsSection meds={meds} newMed={newMed} setNewMed={setNewMed}
            onSave={handleSaveMed} onDelete={id => { deleteMedication(id); refreshMeds(); showToast('Removed'); }}/>
        )}
        {section === 'contacts' && (
          <ContactsSection contacts={contacts} newContact={newContact} setNewContact={setNewContact}
            onSave={handleSaveContact} onDelete={id => { deleteContact(id); refreshContacts(); showToast('Removed'); }}/>
        )}
        {section === 'gfit' && (
          <GFitSection clientId={clientId} setClientId={setClientId} syncing={syncing}
            gfitData={gfitData} onSync={handleGFitSync}/>
        )}
        {section === 'data' && (
          <DataSection entries={entries} showToast={showToast}/>
        )}
      </div>
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────────── */
function OverviewSection({ entries, gfitData }) {
  const total = entries.filter(e=>!e.falseAlarm).length;
  const synced = gfitData?.syncedAt ? new Date(gfitData.syncedAt).toLocaleDateString('en-GB') : 'Never';
  const stats = [
    { icon:'📋', label:'Total entries',     val: total },
    { icon:'📅', label:'First entry',       val: total ? new Date(entries[entries.length-1]?.timestamp).toLocaleDateString('en-GB') : '–' },
    { icon:'🔄', label:'Google Fit synced', val: synced },
  ];
  return (
    <div>
      {stats.map(s => (
        <div key={s.label} className="settings-row card card-sm">
          <span className="settings-row-icon">{s.icon}</span>
          <span className="settings-row-label">{s.label}</span>
          <span className="settings-row-val">{s.val}</span>
        </div>
      ))}
      <div className="settings-info">
        <p>Vital Log stores all data locally on this device only. Nothing is sent to any server.</p>
      </div>
    </div>
  );
}

/* ── Medications ──────────────────────────────────────────── */
function MedsSection({ meds, newMed, setNewMed, onSave, onDelete }) {
  return (
    <div>
      <div className="section-label">Current medications</div>
      {meds.length === 0 && <p className="settings-empty">No medications added yet.</p>}
      {meds.map(m => (
        <div key={m.id} className="settings-row card card-sm">
          <Pill size={15} style={{color:'var(--violet)',flexShrink:0}}/>
          <div className="settings-row-info">
            <span className="settings-row-label">{m.name}</span>
            {m.dose && <span className="settings-row-sub">{m.dose}{m.frequency ? ` · ${m.frequency}` : ''}</span>}
          </div>
          <button className="icon-btn" style={{width:28,height:28}} onClick={() => onDelete(m.id)}><Trash2 size={12}/></button>
        </div>
      ))}

      <div className="section-label" style={{marginTop:20}}>Add medication</div>
      <div className="add-form card">
        <input className="text-input" placeholder="Medication name" value={newMed.name}
          onChange={e => setNewMed(m=>({...m,name:e.target.value}))} style={{marginBottom:8}}/>
        <input className="text-input" placeholder="Dose (e.g. 500mg)" value={newMed.dose}
          onChange={e => setNewMed(m=>({...m,dose:e.target.value}))} style={{marginBottom:8}}/>
        <input className="text-input" placeholder="Frequency (e.g. twice daily)" value={newMed.frequency}
          onChange={e => setNewMed(m=>({...m,frequency:e.target.value}))} style={{marginBottom:12}}/>
        <button className="btn btn-primary" onClick={onSave} disabled={!newMed.name}>
          <Plus size={14}/> Add medication
        </button>
      </div>
    </div>
  );
}

/* ── Contacts ─────────────────────────────────────────────── */
function ContactsSection({ contacts, newContact, setNewContact, onSave, onDelete }) {
  return (
    <div>
      <div className="section-label">Emergency &amp; healthcare contacts</div>
      {contacts.length === 0 && <p className="settings-empty">No contacts added yet.</p>}
      {contacts.map(c => (
        <div key={c.id} className="settings-row card card-sm">
          <User size={15} style={{color:'var(--emerald)',flexShrink:0}}/>
          <div className="settings-row-info">
            <span className="settings-row-label">{c.name}</span>
            {c.role && <span className="settings-row-sub">{c.role}</span>}
          </div>
          {c.phone && (
            <a href={`tel:${c.phone}`} className="icon-btn" style={{width:28,height:28,textDecoration:'none'}}>
              <Phone size={12}/>
            </a>
          )}
          <button className="icon-btn" style={{width:28,height:28}} onClick={() => onDelete(c.id)}>
            <Trash2 size={12}/>
          </button>
        </div>
      ))}

      <div className="section-label" style={{marginTop:20}}>Add contact</div>
      <div className="add-form card">
        <input className="text-input" placeholder="Name" value={newContact.name}
          onChange={e => setNewContact(c=>({...c,name:e.target.value}))} style={{marginBottom:8}}/>
        <input className="text-input" placeholder="Role (e.g. GP, Dentist, Family)" value={newContact.role}
          onChange={e => setNewContact(c=>({...c,role:e.target.value}))} style={{marginBottom:8}}/>
        <input className="text-input" placeholder="Phone number" type="tel" value={newContact.phone}
          onChange={e => setNewContact(c=>({...c,phone:e.target.value}))} style={{marginBottom:12}}/>
        <button className="btn btn-primary" onClick={onSave} disabled={!newContact.name}>
          <Plus size={14}/> Add contact
        </button>
      </div>
    </div>
  );
}

/* ── Google Fit ───────────────────────────────────────────── */
function GFitSection({ clientId, setClientId, syncing, gfitData, onSync }) {
  return (
    <div>
      <div className="settings-info">
        <p>Sync data from Google Fit at the tap of a button. Your data is pulled in and stored locally — nothing is sent anywhere. Internet is required only during the sync.</p>
      </div>

      {gfitData?.syncedAt && (
        <div className="card card-sm" style={{marginBottom:12}}>
          <div style={{fontSize:12,color:'var(--text-2)'}}>Last synced: {new Date(gfitData.syncedAt).toLocaleString('en-GB')}</div>
          <div style={{fontSize:12,color:'var(--text-2)',marginTop:4}}>
            {gfitData.steps?.length ?? 0} days of steps · {gfitData.heartRate?.length ?? 0} heart rate readings
          </div>
        </div>
      )}

      <div className="section-label">Google OAuth Client ID</div>
      <div className="card">
        <p style={{fontSize:12,color:'var(--text-2)',marginBottom:10,lineHeight:1.6}}>
          To use Google Fit sync, you need a free Google Cloud OAuth Client ID.{' '}
          <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer"
            style={{color:'var(--emerald)',textDecoration:'none'}}>
            Set one up here <ExternalLink size={10}/>
          </a>
        </p>
        <input className="text-input" placeholder="Your OAuth 2.0 Client ID"
          value={clientId} onChange={e => setClientId(e.target.value)} style={{marginBottom:12}}/>
        <button className="btn btn-primary" onClick={onSync} disabled={syncing||!clientId}>
          <RefreshCw size={14} style={syncing?{animation:'spin 1s linear infinite'}:{}}/>
          {syncing ? 'Syncing…' : 'Sync with Google Fit'}
        </button>
      </div>

      <div className="settings-info" style={{marginTop:8}}>
        <p>Pulls: sleep duration, step count, heart rate. Data stays on your device after sync.</p>
      </div>
    </div>
  );
}

/* ── Data management ──────────────────────────────────────── */
function DataSection({ entries, showToast }) {
  return (
    <div>
      <div className="section-label">Export</div>
      <div className="data-btns">
        <button className="btn btn-ghost" onClick={exportAllData}>
          Export full backup (JSON)
        </button>
        <button className="btn btn-ghost" onClick={() => exportEntriesCSV(entries)}>
          Export entries as CSV
        </button>
      </div>

      <div className="settings-info" style={{marginTop:16}}>
        <p><strong>JSON backup</strong> includes everything — entries, check-ins, appointments, medications, contacts. Use this to restore on a new device.</p>
        <p style={{marginTop:8}}><strong>CSV</strong> is useful for sharing with a doctor or importing into a spreadsheet.</p>
      </div>

      <div className="section-label" style={{marginTop:20}}>About</div>
      <div className="settings-info">
        <p>Vital Log v2.0<br/>All data stored locally on this device only.<br/>No accounts. No tracking. No ads.</p>
      </div>
    </div>
  );
}
