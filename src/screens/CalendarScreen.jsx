import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ENTRY_TYPES, APPT_TYPES } from '../utils/storage.js';
import EntryCard from '../components/EntryCard.jsx';
import './CalendarScreen.css';

export default function CalendarScreen({ entries, appts, onEdit }) {
  const now = new Date();
  const [year,  setYear]     = useState(now.getFullYear());
  const [month, setMonth]    = useState(now.getMonth());
  const [selected, setSelected] = useState(null);

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); setSelected(null); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); setSelected(null); };

  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();

  // Map day -> { entries[], appts[] }
  const dayMap = {};
  entries.forEach(e => {
    const d = new Date(e.timestamp);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const k = d.getDate();
      if (!dayMap[k]) dayMap[k] = { entries:[], appts:[] };
      dayMap[k].entries.push(e);
    }
  });
  appts.forEach(a => {
    const d = new Date(a.datetime);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const k = d.getDate();
      if (!dayMap[k]) dayMap[k] = { entries:[], appts:[] };
      dayMap[k].appts.push(a);
    }
  });

  const selData    = selected ? (dayMap[selected] ?? { entries:[], appts:[] }) : null;
  const maxCount   = Math.max(...Object.values(dayMap).map(v => v.entries.filter(e=>!e.falseAlarm).length), 1);
  const monthLabel = new Date(year, month).toLocaleDateString('en-GB', { month:'long', year:'numeric' });
  const DAYS       = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  return (
    <div className="screen">
      <div className="screen-scroll">
        <div className="screen-title" style={{marginBottom:20}}>Calendar</div>

        <div className="card cal-card">
          <div className="cal-nav">
            <button className="icon-btn" onClick={prev}><ChevronLeft size={16}/></button>
            <span className="cal-month-label">{monthLabel}</span>
            <button className="icon-btn" onClick={next}><ChevronRight size={16}/></button>
          </div>

          <div className="cal-day-headers">
            {DAYS.map(d => <div key={d} className="cal-dh">{d}</div>)}
          </div>

          <div className="cal-grid">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`x${i}`} className="cal-cell empty"/>)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day      = i + 1;
              const data     = dayMap[day];
              const realCount = data ? data.entries.filter(e => !e.falseAlarm).length : 0;
              const hasAppt  = data?.appts?.length > 0;
              const isToday  = now.getDate() === day && now.getMonth() === month && now.getFullYear() === year;
              const isSel    = selected === day;
              const intensity = realCount > 0 ? Math.max(0.18, realCount / maxCount) : 0;

              return (
                <button key={day}
                  className={`cal-cell ${realCount>0?'has-entries':''} ${isToday?'today':''} ${isSel?'sel':''}`}
                  style={realCount > 0 ? { '--int': intensity } : {}}
                  onClick={() => setSelected(isSel ? null : day)}
                >
                  <span className="cal-num">{day}</span>
                  {realCount > 0 && <span className="cal-count">{realCount}</span>}
                  {hasAppt && <span className="cal-appt-dot"/>}
                </button>
              );
            })}
          </div>

          <div className="cal-legend">
            <div className="cal-legend-item"><div className="cal-legend-dot entry"/><span>Events</span></div>
            <div className="cal-legend-item"><div className="cal-legend-dot appt"/><span>Appointment</span></div>
          </div>
        </div>

        {selected && selData && (
          <div className="cal-detail fade-in">
            <div className="section-label">
              {selected} {new Date(year,month).toLocaleDateString('en-GB',{month:'long'})} · {(selData.entries.length + selData.appts.length)} item{selData.entries.length+selData.appts.length!==1?'s':''}
            </div>

            {selData.appts.map(appt => {
              const info = APPT_TYPES[appt.apptType] ?? { label: appt.apptType, icon:'📅' };
              const t    = new Date(appt.datetime);
              return (
                <div key={appt.id} className="card card-sm appt-detail-card">
                  <span>{info.icon}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{info.label}</div>
                    {appt.provider && <div style={{fontSize:12,color:'var(--text-2)'}}>{appt.provider}</div>}
                    <div style={{fontSize:12,color:'var(--text-2)'}}>{t.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                </div>
              );
            })}

            {selData.entries.length === 0 && selData.appts.length === 0 && (
              <div className="empty" style={{padding:'20px 0'}}>
                <p>No entries on this day.</p>
              </div>
            )}

            {selData.entries.map(e => (
              <EntryCard key={e.id} entry={e} onEdit={() => onEdit(e.type, e)} compact/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
