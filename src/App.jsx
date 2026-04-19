import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, CalendarDays, BarChart2, BookOpen, Settings2 } from 'lucide-react';
import DashboardScreen from './screens/DashboardScreen.jsx';
import CalendarScreen   from './screens/CalendarScreen.jsx';
import AnalysisScreen   from './screens/AnalysisScreen.jsx';
import JournalScreen    from './screens/JournalScreen.jsx';
import SettingsScreen   from './screens/SettingsScreen.jsx';
import LogSheet         from './components/LogSheet.jsx';
import Toast            from './components/Toast.jsx';
import { getEntries, getCheckins, getAppointments } from './utils/storage.js';
import './App.css';

const TABS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Today' },
  { id: 'calendar',  icon: CalendarDays,    label: 'Calendar' },
  { id: 'analysis',  icon: BarChart2,       label: 'Analysis' },
  { id: 'journal',   icon: BookOpen,        label: 'Journal' },
  { id: 'settings',  icon: Settings2,       label: 'Settings' },
];

export default function App() {
  const [tab, setTab]           = useState('dashboard');
  const [entries, setEntries]   = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [appts, setAppts]       = useState([]);
  const [sheet, setSheet]       = useState(null); // { type, existing }
  const [toast, setToast]       = useState(null);

  const refresh = useCallback(() => {
    setEntries(getEntries());
    setCheckins(getCheckins());
    setAppts(getAppointments());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }, []);

  const openLog = useCallback((type, existing = null) => {
    setSheet({ type, existing });
  }, []);

  const closeSheet = useCallback((saved) => {
    setSheet(null);
    if (saved) { refresh(); showToast('Entry saved'); }
  }, [refresh, showToast]);

  return (
    <div className="app">
      <div className="app-content">
        {tab === 'dashboard' && (
          <DashboardScreen entries={entries} checkins={checkins} appts={appts} onLog={openLog} onRefresh={refresh} showToast={showToast} />
        )}
        {tab === 'calendar' && (
          <CalendarScreen entries={entries} appts={appts} onEdit={openLog} />
        )}
        {tab === 'analysis' && (
          <AnalysisScreen entries={entries} checkins={checkins} />
        )}
        {tab === 'journal' && (
          <JournalScreen entries={entries} onEdit={openLog} onRefresh={refresh} showToast={showToast} />
        )}
        {tab === 'settings' && (
          <SettingsScreen entries={entries} onRefresh={refresh} showToast={showToast} />
        )}
      </div>

      <nav className="tab-bar">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} className={`tab-btn ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
            <Icon size={20} strokeWidth={tab === id ? 2 : 1.5} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {sheet && (
        <LogSheet type={sheet.type} existing={sheet.existing} onClose={closeSheet} />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
