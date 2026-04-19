import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { deleteEntry, ENTRY_TYPES } from '../utils/storage.js';
import EntryCard from '../components/EntryCard.jsx';
import './JournalScreen.css';

export default function JournalScreen({ entries, onEdit, onRefresh, showToast }) {
  const [search,  setSearch]  = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [delConfirm, setDelConfirm] = useState(null);

  const filtered = entries.filter(e => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (e.notes||'').toLowerCase().includes(q) ||
      (e.triggers||[]).some(t => t.toLowerCase().includes(q)) ||
      (e.location||'').toLowerCase().includes(q) ||
      (e.symptoms||[]).some(s => s.toLowerCase().includes(q)) ||
      (e.illnessSymptoms||[]).some(s => s.toLowerCase().includes(q)) ||
      (ENTRY_TYPES[e.type]?.label||'').toLowerCase().includes(q)
    );
  });

  // Group by month
  const grouped = {};
  filtered.forEach(e => {
    const d   = new Date(e.timestamp);
    const key = d.toLocaleDateString('en-GB', { month:'long', year:'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  const handleDelete = (id) => {
    if (delConfirm === id) {
      deleteEntry(id);
      onRefresh();
      showToast('Entry deleted');
      setDelConfirm(null);
    } else {
      setDelConfirm(id);
      setTimeout(() => setDelConfirm(null), 3000);
    }
  };

  return (
    <div className="screen">
      <div className="screen-scroll">
        <h1 className="screen-title" style={{marginBottom:16}}>Journal</h1>

        {/* Search */}
        <div className="search-wrap">
          <Search size={14} className="search-ico"/>
          <input className="search-input" placeholder="Search notes, triggers, locations…"
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>

        {/* Type filter */}
        <div className="type-filter-row">
          <button className={`type-filter-btn ${typeFilter==='all'?'on':''}`} onClick={() => setTypeFilter('all')}>All</button>
          {Object.entries(ENTRY_TYPES).map(([key,{icon}]) => (
            <button key={key} className={`type-filter-btn ${typeFilter===key?'on':''}`}
              onClick={() => setTypeFilter(typeFilter===key?'all':key)}>
              {icon}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <p>{search ? 'No entries match your search.' : 'No entries yet.'}</p>
          </div>
        ) : (
          Object.entries(grouped).map(([month, monthEntries]) => (
            <div key={month} className="month-group">
              <div className="month-label">{month}</div>
              {monthEntries.map(e => (
                <div key={e.id} className="journal-entry-wrap">
                  <EntryCard entry={e} onEdit={() => onEdit(e.type, e)} compact/>
                  <button
                    className={`del-btn ${delConfirm===e.id?'confirm':''}`}
                    onClick={() => handleDelete(e.id)}
                  >
                    <Trash2 size={12}/>
                    {delConfirm===e.id && <span>Confirm?</span>}
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
