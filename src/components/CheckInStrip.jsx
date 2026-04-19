import React, { useState } from 'react';
import { Check } from 'lucide-react';
import './CheckInStrip.css';

const MOOD_EM = ['😔','😞','😐','🙂','😊'];
const ENERGY  = ['🪫','😴','😑','⚡','🔥'];
const ENERGY_L = ['Drained','Low','Okay','Good','Great'];
const SLEEP_Q  = ['Poor','Fair','Good'];
const STRESS_L = ['Low','Some','High'];

export default function CheckInStrip({ checkin, onSave }) {
  const [open, setOpen] = useState(false);
  const [mood,   setMood]   = useState(checkin?.mood   ?? null);
  const [energy, setEnergy] = useState(checkin?.energy ?? null);
  const [sleep,  setSleep]  = useState(checkin?.sleep  ?? null);
  const [stress, setStress] = useState(checkin?.stress ?? null);

  const done = checkin != null;
  const allSet = mood && energy && sleep && stress;

  if (done && !open) {
    return (
      <div className="checkin-done card card-sm" onClick={() => setOpen(true)}>
        <Check size={14} className="checkin-done-icon"/>
        <span>Daily check-in complete</span>
        <div className="checkin-done-emojis">
          {MOOD_EM[(checkin.mood??3)-1]}
          {ENERGY[(checkin.energy??3)-1]}
        </div>
      </div>
    );
  }

  if (!open && !done) {
    return (
      <button className="checkin-prompt card card-sm" onClick={() => setOpen(true)}>
        <span className="checkin-prompt-icon">☀️</span>
        <div>
          <div className="checkin-prompt-title">Daily check-in</div>
          <div className="checkin-prompt-sub">4 taps · takes 10 seconds</div>
        </div>
        <span className="checkin-prompt-arrow">›</span>
      </button>
    );
  }

  return (
    <div className="checkin-expanded card">
      <div className="checkin-expanded-title">Daily check-in</div>

      <div className="checkin-row">
        <span className="checkin-row-label">Mood</span>
        <div className="checkin-pills">
          {MOOD_EM.map((em, i) => (
            <button key={i} className={`ci-pill ${mood === i+1 ? 'on' : ''}`}
              onClick={() => setMood(i+1)}>{em}</button>
          ))}
        </div>
      </div>

      <div className="checkin-row">
        <span className="checkin-row-label">Energy</span>
        <div className="checkin-pills">
          {ENERGY.map((em, i) => (
            <button key={i} className={`ci-pill ${energy === i+1 ? 'on' : ''}`}
              onClick={() => setEnergy(i+1)}>{em}</button>
          ))}
        </div>
      </div>

      <div className="checkin-row">
        <span className="checkin-row-label">Sleep</span>
        <div className="checkin-pills">
          {SLEEP_Q.map((s, i) => (
            <button key={s} className={`ci-pill ci-text ${sleep === s ? 'on' : ''}`}
              onClick={() => setSleep(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="checkin-row">
        <span className="checkin-row-label">Stress</span>
        <div className="checkin-pills">
          {STRESS_L.map((s, i) => (
            <button key={s} className={`ci-pill ci-text ${stress === s ? 'on' : ''}`}
              onClick={() => setStress(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{display:'flex',gap:8,marginTop:14,justifyContent:'flex-end'}}>
        <button className="btn btn-ghost" style={{fontSize:13}} onClick={() => setOpen(false)}>Cancel</button>
        <button className="btn btn-primary" style={{fontSize:13}} disabled={!allSet}
          onClick={() => { onSave({ mood, energy, sleep, stress }); setOpen(false); }}>
          <Check size={13}/> Save check-in
        </button>
      </div>
    </div>
  );
}
