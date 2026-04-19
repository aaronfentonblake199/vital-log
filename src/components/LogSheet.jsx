import React, { useState, useRef } from 'react';
import { X, Check, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { saveEntry, updateEntry, ENTRY_TYPES } from '../utils/storage.js';
import {
  DURATIONS, LOCATIONS, SLEEP_OPTS, MOOD_EMOJIS, MOOD_LABELS, COPING,
  PANIC_TRIGGERS, PANIC_SYMPTOMS,
  HEADACHE_TYPES, HEADACHE_LOCATIONS, HEADACHE_TRIGGERS, HEADACHE_SYMPTOMS,
  TOOTH_TYPES, TOOTH_LOCATIONS, TOOTH_TRIGGERS,
  ILLNESS_TYPES, ILLNESS_SYMPTOMS,
  PAIN_TYPES, PAIN_BODY_LOCATIONS,
  SEV_COLORS, SEV_LABELS,
} from '../utils/constants.js';
import './LogSheet.css';

// ── Step definitions per type ──────────────────────────────────────────
function getSteps(type) {
  const shared = ['severity','duration','mood','sleep','lifestyle','coping','notes','flags'];
  const maps = {
    panic:     ['severity','duration','mood','triggers','symptoms','location','coping','sleep','lifestyle','notes','flags'],
    headache:  ['severity','duration','painType','painLocation','triggers','symptoms','medication','sleep','lifestyle','notes','flags'],
    toothache: ['severity','duration','toothType','toothLocation','toothTriggers','medication','notes','flags'],
    illness:   ['severity','illnessType','illnessSymptoms','duration','medication','sleep','notes','flags'],
    pain:      ['severity','duration','painType','painBodyLocation','location','medication','notes','flags'],
  };
  return maps[type] ?? shared;
}

const STEP_TITLES = {
  severity:         'How severe is it?',
  duration:         'How long has it lasted?',
  mood:             'What is your mood?',
  triggers:         'What triggered it?',
  symptoms:         'What are you feeling?',
  location:         'Where are you?',
  coping:           'What has helped?',
  sleep:            'How did you sleep?',
  lifestyle:        'Lifestyle factors',
  notes:            'Thoughts & notes',
  flags:            'Anything else?',
  painType:         'What type of pain?',
  painLocation:     'Where is the pain?',
  painBodyLocation: 'Where on your body?',
  toothType:        'How does it feel?',
  toothLocation:    'Which area?',
  toothTriggers:    'What makes it worse?',
  illnessType:      'What type of illness?',
  illnessSymptoms:  'What symptoms?',
  medication:       'Pain relief taken?',
};

function initData(type, existing) {
  return {
    type,
    severity:         existing?.severity ?? null,
    duration:         existing?.duration ?? null,
    mood:             existing?.mood ?? null,
    triggers:         existing?.triggers ?? [],
    symptoms:         existing?.symptoms ?? [],
    location:         existing?.location ?? null,
    coping:           existing?.coping ?? [],
    sleep:            existing?.sleep ?? null,
    caffeine:         existing?.caffeine ?? false,
    alcohol:          existing?.alcohol ?? false,
    stress:           existing?.stress ?? null,
    hydration:        existing?.hydration ?? null,
    screenTime:       existing?.screenTime ?? false,
    notes:            existing?.notes ?? '',
    falseAlarm:       existing?.falseAlarm ?? false,
    painType:         existing?.painType ?? null,
    painLocations:    existing?.painLocations ?? [],
    painBodyLocation: existing?.painBodyLocation ?? [],
    toothType:        existing?.toothType ?? null,
    toothLocation:    existing?.toothLocation ?? null,
    toothTriggers:    existing?.toothTriggers ?? [],
    illnessType:      existing?.illnessType ?? null,
    illnessSymptoms:  existing?.illnessSymptoms ?? [],
    medication:       existing?.medication ?? '',
    medicationHelped: existing?.medicationHelped ?? null,
  };
}

export default function LogSheet({ type, existing, onClose }) {
  const steps  = getSteps(type);
  const [step, setStep]   = useState(0);
  const [data, setData]   = useState(() => initData(type, existing));
  const [quick, setQuick] = useState(false);
  const bodyRef = useRef(null);

  const current = steps[step];
  const isLast  = step === steps.length - 1;
  const typeInfo = ENTRY_TYPES[type] ?? {};

  const set  = (k, v)  => setData(d => ({ ...d, [k]: v }));
  const tog  = (k, v)  => setData(d => ({ ...d, [k]: d[k].includes(v) ? d[k].filter(x => x !== v) : [...d[k], v] }));
  const next = ()      => { if (!isLast) { setStep(s => s + 1); bodyRef.current?.scrollTo(0,0); } };
  const back = ()      => { if (step > 0) setStep(s => s - 1); };

  const handleSave = () => {
    if (existing) updateEntry(existing.id, data);
    else saveEntry(data);
    onClose(true);
  };

  const handleQuickSave = () => {
    if (existing) updateEntry(existing.id, data);
    else saveEntry(data);
    onClose(true);
  };

  // Auto-advance single-select steps after tap
  const autoAdvance = (fn) => {
    fn();
    if (!isLast) setTimeout(() => { setStep(s => s + 1); bodyRef.current?.scrollTo(0,0); }, 260);
  };

  return (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose(false)}>
      <div className="sheet scale-in">

        {/* Header */}
        <div className="sheet-header">
          <button className="sheet-close" onClick={() => onClose(false)}><X size={16}/></button>
          <div className="sheet-title-row">
            <span className="sheet-icon">{typeInfo.icon}</span>
            <span className="sheet-title">{existing ? `Edit ${typeInfo.label}` : `Log ${typeInfo.label}`}</span>
          </div>
          <div className="sheet-progress">
            {steps.map((_, i) => (
              <div key={i} className={`prog-seg ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`}/>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="sheet-body" ref={bodyRef}>
          <div className="step-q">{STEP_TITLES[current]}</div>

          {current === 'severity' && (
            <SeverityStep value={data.severity} onChange={v => autoAdvance(() => set('severity', v))} />
          )}
          {current === 'duration' && (
            <PillStep options={DURATIONS} value={data.duration} onChange={v => autoAdvance(() => set('duration', v))} />
          )}
          {current === 'mood' && (
            <MoodStep value={data.mood} onChange={v => autoAdvance(() => set('mood', v))} />
          )}
          {current === 'triggers' && (
            <ChipStep options={PANIC_TRIGGERS} values={data.triggers} onToggle={v => tog('triggers', v)} />
          )}
          {current === 'symptoms' && (
            <ChipStep options={PANIC_SYMPTOMS} values={data.symptoms} onToggle={v => tog('symptoms', v)} />
          )}
          {current === 'location' && (
            <PillStep options={LOCATIONS} value={data.location} onChange={v => autoAdvance(() => set('location', v))} />
          )}
          {current === 'coping' && (
            <ChipStep options={COPING} values={data.coping} onToggle={v => tog('coping', v)} />
          )}
          {current === 'sleep' && (
            <PillStep options={SLEEP_OPTS} value={data.sleep} onChange={v => autoAdvance(() => set('sleep', v))} />
          )}
          {current === 'lifestyle' && (
            <LifestyleStep data={data} set={set} />
          )}
          {current === 'notes' && (
            <NotesStep value={data.notes} onChange={v => set('notes', v)} />
          )}
          {current === 'flags' && (
            <FlagsStep data={data} set={set} />
          )}
          {current === 'painType' && (
            <PillStep options={type === 'toothache' ? TOOTH_TYPES : PAIN_TYPES} value={data.painType} onChange={v => autoAdvance(() => set('painType', v))} />
          )}
          {current === 'painLocation' && (
            <ChipStep options={HEADACHE_LOCATIONS} values={data.painLocations} onToggle={v => tog('painLocations', v)} />
          )}
          {current === 'painBodyLocation' && (
            <ChipStep options={PAIN_BODY_LOCATIONS} values={data.painBodyLocation} onToggle={v => tog('painBodyLocation', v)} />
          )}
          {current === 'toothType' && (
            <PillStep options={TOOTH_TYPES} value={data.toothType} onChange={v => autoAdvance(() => set('toothType', v))} />
          )}
          {current === 'toothLocation' && (
            <PillStep options={TOOTH_LOCATIONS} value={data.toothLocation} onChange={v => autoAdvance(() => set('toothLocation', v))} />
          )}
          {current === 'toothTriggers' && (
            <ChipStep options={TOOTH_TRIGGERS} values={data.toothTriggers} onToggle={v => tog('toothTriggers', v)} />
          )}
          {current === 'illnessType' && (
            <PillStep options={ILLNESS_TYPES} value={data.illnessType} onChange={v => autoAdvance(() => set('illnessType', v))} />
          )}
          {current === 'illnessSymptoms' && (
            <ChipStep options={ILLNESS_SYMPTOMS} values={data.illnessSymptoms} onToggle={v => tog('illnessSymptoms', v)} />
          )}
          {current === 'medication' && (
            <MedicationStep data={data} set={set} />
          )}
        </div>

        {/* Footer */}
        <div className="sheet-footer">
          <button className="btn btn-ghost" onClick={back} style={{ visibility: step > 0 ? 'visible' : 'hidden' }}>
            <ChevronLeft size={15}/> Back
          </button>

          {/* Quick save — always available after severity is set */}
          {data.severity && !isLast && (
            <button className="btn quick-save-btn" onClick={handleQuickSave} title="Save now and skip remaining steps">
              <Zap size={13}/> Quick save
            </button>
          )}

          {isLast ? (
            <button className="btn btn-primary" onClick={handleSave}>
              <Check size={15}/> Save
            </button>
          ) : (
            <button className="btn btn-primary" onClick={next}>
              Next <ChevronRight size={15}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────

function SeverityStep({ value, onChange }) {
  const colors = SEV_COLORS;
  const labels = SEV_LABELS;
  return (
    <div className="sev-list">
      {[1,2,3,4,5].map(n => (
        <button key={n} className={`sev-item ${value === n ? 'on' : ''}`}
          style={{ '--c': colors[n-1] }} onClick={() => onChange(n)}>
          <span className="sev-num">{n}</span>
          <div className="sev-bar-wrap">
            <div className="sev-bar" style={{ width: `${n*20}%` }}/>
          </div>
          <span className="sev-lbl">{labels[n-1]}</span>
          {value === n && <Check size={14} className="sev-check"/>}
        </button>
      ))}
    </div>
  );
}

function MoodStep({ value, onChange }) {
  return (
    <div className="mood-row">
      {MOOD_EMOJIS.map((em, i) => {
        const v = i + 1;
        return (
          <button key={v} className={`mood-btn ${value === v ? 'on' : ''}`} onClick={() => onChange(v)}>
            <span className="mood-em">{em}</span>
            <span className="mood-lbl">{MOOD_LABELS[i]}</span>
          </button>
        );
      })}
    </div>
  );
}

function PillStep({ options, value, onChange }) {
  return (
    <div className="pill-list">
      {options.map(opt => (
        <button key={opt} className={`pill-item ${value === opt ? 'on' : ''}`} onClick={() => onChange(opt)}>
          <span>{opt}</span>
          {value === opt && <Check size={13}/>}
        </button>
      ))}
    </div>
  );
}

function ChipStep({ options, values, onToggle }) {
  return (
    <div className="chip-grid">
      {options.map(opt => (
        <button key={opt} className={`chip ${values.includes(opt) ? 'on' : ''}`} onClick={() => onToggle(opt)}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function LifestyleStep({ data, set }) {
  const items = [
    { key: 'caffeine',   icon: '☕', label: 'Caffeine today' },
    { key: 'alcohol',    icon: '🍷', label: 'Alcohol recently' },
    { key: 'screenTime', icon: '📱', label: 'Lots of screen time' },
  ];
  return (
    <div className="toggle-list">
      {items.map(({ key, icon, label }) => (
        <button key={key} className={`toggle-item ${data[key] ? 'on' : ''}`} onClick={() => set(key, !data[key])}>
          <span className="toggle-icon">{icon}</span>
          <span className="toggle-label">{label}</span>
          <div className={`toggle-pill ${data[key] ? 'on' : ''}`}/>
        </button>
      ))}
      <div className="stress-row">
        <span className="field-label" style={{marginBottom:0}}>Stress level today</span>
        <div className="stress-btns">
          {[1,2,3,4,5].map(n => (
            <button key={n} className={`stress-btn ${data.stress === n ? 'on' : ''}`} onClick={() => set('stress', data.stress === n ? null : n)}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="stress-row" style={{marginTop:12}}>
        <span className="field-label" style={{marginBottom:0}}>Hydration today</span>
        <div className="pill-row" style={{marginTop:8}}>
          {['Poor','Fair','Good'].map(v => (
            <button key={v} className={`pill ${data.hydration === v ? 'on' : ''}`}
              onClick={() => set('hydration', data.hydration === v ? null : v)}>{v}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MedicationStep({ data, set }) {
  return (
    <div className="med-step">
      <label className="field-label">Medication / pain relief taken</label>
      <input className="text-input" placeholder="e.g. 2× paracetamol 500mg" value={data.medication}
        onChange={e => set('medication', e.target.value)} autoFocus />
      {data.medication && (
        <div style={{marginTop:16}}>
          <label className="field-label">Did it help?</label>
          <div className="pill-row" style={{marginTop:8}}>
            {['Yes','Somewhat','No'].map(v => (
              <button key={v} className={`pill ${data.medicationHelped === v ? 'on' : ''}`}
                onClick={() => set('medicationHelped', v)}>{v}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NotesStep({ value, onChange }) {
  return (
    <textarea className="textarea" placeholder="How are you feeling? What were you doing? Any other context…"
      value={value} onChange={e => onChange(e.target.value)} autoFocus style={{minHeight:150}}/>
  );
}

function FlagsStep({ data, set }) {
  return (
    <div className="toggle-list">
      <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.6,marginBottom:16}}>
        Mark as a false alarm if you later realised this wasn't what you thought. Keeps your data clean.
      </p>
      <button className={`toggle-item ${data.falseAlarm ? 'on' : ''}`} onClick={() => set('falseAlarm', !data.falseAlarm)}>
        <span className="toggle-icon">🚩</span>
        <span className="toggle-label">Mark as false alarm</span>
        <div className={`toggle-pill ${data.falseAlarm ? 'on' : ''}`}/>
      </button>
    </div>
  );
}
