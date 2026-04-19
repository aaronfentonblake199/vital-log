import React from 'react';
import { Edit2 } from 'lucide-react';
import { ENTRY_TYPES } from '../utils/storage.js';
import { sevColor } from '../utils/constants.js';
import './EntryCard.css';

export default function EntryCard({ entry, onEdit, compact = false }) {
  const d = new Date(entry.timestamp);
  const typeInfo = ENTRY_TYPES[entry.type] ?? { label: entry.type, icon: '•', color: 'var(--text-2)' };
  const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const color = sevColor(entry.severity);

  const tags = [
    entry.falseAlarm && 'False alarm',
    entry.duration,
    entry.location,
    ...(entry.triggers ?? []).slice(0, 2),
    ...(entry.illnessType ? [entry.illnessType] : []),
    ...(entry.painType ? [entry.painType] : []),
  ].filter(Boolean);

  return (
    <div className={`ecard ${entry.falseAlarm ? 'faded' : ''} ${compact ? 'compact' : ''}`}>
      <div className="ecard-left">
        <div className="ecard-type-icon">{typeInfo.icon}</div>
        <div className="ecard-sev" style={{ '--c': color }}>{entry.severity ?? '–'}</div>
      </div>

      <div className="ecard-mid">
        <div className="ecard-top">
          <span className="ecard-type">{typeInfo.label}</span>
          <span className="ecard-time">{compact ? `${dateStr} · ${timeStr}` : timeStr}</span>
          {!compact && <span className="ecard-date">{dateStr}</span>}
        </div>
        {tags.length > 0 && (
          <div className="ecard-tags">
            {tags.slice(0,4).map(t => (
              <span key={t} className={`ecard-tag ${t==='False alarm'?'danger':''}`}>{t}</span>
            ))}
          </div>
        )}
        {entry.notes ? (
          <div className="ecard-notes">{entry.notes.slice(0,75)}{entry.notes.length>75?'…':''}</div>
        ) : null}
      </div>

      {onEdit && (
        <button className="ecard-edit" onClick={onEdit}><Edit2 size={13}/></button>
      )}
    </div>
  );
}
