import React, { useState, useMemo } from 'react';
import { ENTRY_TYPES } from '../utils/storage.js';
import { SEV_COLORS } from '../utils/constants.js';
import './AnalysisScreen.css';

export default function AnalysisScreen({ entries, checkins }) {
  const [period, setPeriod] = useState('30');

  const cutoff = useMemo(() => {
    if (period === 'all') return new Date(0);
    const d = new Date(); d.setDate(d.getDate() - parseInt(period)); return d;
  }, [period]);

  const filtered = useMemo(() => entries.filter(e => !e.falseAlarm && new Date(e.timestamp) >= cutoff), [entries, cutoff]);
  const filtCheckins = useMemo(() => checkins.filter(c => new Date(c.date) >= cutoff), [checkins, cutoff]);

  if (entries.length === 0) {
    return (
      <div className="screen">
        <div className="screen-scroll">
          <h1 className="screen-title" style={{marginBottom:8}}>Analysis</h1>
          <p className="screen-sub" style={{marginBottom:32}}>Patterns in your health data</p>
          <div className="empty">
            <div className="empty-icon">📊</div>
            <p>No data yet.<br/>Start logging events to see patterns and insights here.</p>
          </div>
        </div>
      </div>
    );
  }

  const insights = buildInsights(filtered, filtCheckins);

  return (
    <div className="screen">
      <div className="screen-scroll">
        <h1 className="screen-title" style={{marginBottom:4}}>Analysis</h1>
        <p className="screen-sub" style={{marginBottom:16}}>Patterns in your health data</p>

        {/* Period selector */}
        <div className="period-bar">
          {[['7','7d'],['30','30d'],['90','90d'],['all','All']].map(([v,l]) => (
            <button key={v} className={`period-btn ${period===v?'on':''}`} onClick={() => setPeriod(v)}>{l}</button>
          ))}
        </div>

        {/* Summary */}
        <SummaryRow entries={filtered} checkins={filtCheckins} />

        {filtered.length > 0 && <>
          <TypeBreakdown entries={filtered} />
          <FrequencyChart entries={filtered} period={period} />
          <TimeOfDayChart entries={filtered} />
          <SeverityChart entries={filtered} />
          <TopTriggers entries={filtered} />
          <TopCoping entries={filtered} />
          <SleepVsSeverity entries={filtered} />
          {filtCheckins.length >= 3 && <MoodEnergyChart checkins={filtCheckins} />}
          <StressCorrelation entries={filtered} checkins={filtCheckins} />
        </>}

        {insights.length > 0 && <InsightsPanel insights={insights} />}
      </div>
    </div>
  );
}

/* ── Summary ─────────────────────────────────────────────── */
function SummaryRow({ entries, checkins }) {
  const withSev = entries.filter(e => e.severity);
  const avgSev  = withSev.length ? (withSev.reduce((s,e) => s+(e.severity||0),0)/withSev.length).toFixed(1) : '–';
  return (
    <div className="summary-row">
      {[
        { num: entries.length, lbl: 'Events' },
        { num: avgSev,         lbl: 'Avg severity' },
        { num: checkins.length,lbl: 'Check-ins' },
      ].map(({num,lbl}) => (
        <div key={lbl} className="summary-cell">
          <span className="summary-num">{num}</span>
          <span className="summary-lbl">{lbl}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Type breakdown ──────────────────────────────────────── */
function TypeBreakdown({ entries }) {
  const counts = {};
  entries.forEach(e => { counts[e.type] = (counts[e.type]||0)+1; });
  const total = entries.length;
  return (
    <div className="card an-card">
      <div className="an-title">By event type</div>
      <div className="type-list">
        {Object.entries(ENTRY_TYPES).map(([key,{label,icon,color}]) => {
          const n = counts[key]||0;
          if (!n) return null;
          return (
            <div key={key} className="type-row">
              <span className="type-icon">{icon}</span>
              <span className="type-label">{label}</span>
              <div className="type-bar-wrap">
                <div className="type-bar" style={{width:`${(n/total)*100}%`, background:color}}/>
              </div>
              <span className="type-count">{n}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Frequency chart ─────────────────────────────────────── */
function FrequencyChart({ entries, period }) {
  const days = period === 'all' ? 30 : parseInt(period);
  const now  = new Date();
  const buckets = Array.from({length:days},(_,i) => {
    const d = new Date(now); d.setDate(d.getDate()-(days-1-i));
    const key = d.toDateString();
    return { label: d.getDate().toString(), key, count: entries.filter(e => new Date(e.timestamp).toDateString()===key).length };
  });
  const max = Math.max(...buckets.map(b=>b.count),1);
  const showEvery = days<=7?1:days<=30?5:10;

  return (
    <div className="card an-card">
      <div className="an-title">Frequency</div>
      <div className="bar-chart">
        {buckets.map((b,i) => (
          <div key={b.key} className="bar-col">
            <div className="bar-inner" style={{height:`${(b.count/max)*100}%`, opacity:b.count>0?1:0.15}}/>
            {(i%showEvery===0||i===buckets.length-1) && <div className="bar-lbl">{b.label}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Time of day ─────────────────────────────────────────── */
function TimeOfDayChart({ entries }) {
  const slots = [
    { label:'Night',     sub:'12–6am',  r:[0,6] },
    { label:'Morning',   sub:'6–12pm',  r:[6,12] },
    { label:'Afternoon', sub:'12–6pm',  r:[12,18] },
    { label:'Evening',   sub:'6–12am',  r:[18,24] },
  ];
  const counts = slots.map(s => ({ ...s, n: entries.filter(e => { const h=new Date(e.timestamp).getHours(); return h>=s.r[0]&&h<s.r[1]; }).length }));
  const max = Math.max(...counts.map(c=>c.n),1);

  return (
    <div className="card an-card">
      <div className="an-title">Time of day</div>
      {counts.map(s => (
        <div key={s.label} className="horiz-bar-row">
          <div className="horiz-bar-info">
            <span className="horiz-label">{s.label}</span>
            <span className="horiz-sub">{s.sub}</span>
          </div>
          <div className="horiz-bar-wrap">
            <div className="horiz-bar" style={{width:`${(s.n/max)*100}%`}}/>
          </div>
          <span className="horiz-count">{s.n}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Severity breakdown ──────────────────────────────────── */
function SeverityChart({ entries }) {
  const counts = [1,2,3,4,5].map(n => entries.filter(e=>e.severity===n).length);
  const max = Math.max(...counts,1);
  const labels = ['Mild','Moderate','Notable','Intense','Severe'];

  return (
    <div className="card an-card">
      <div className="an-title">Severity breakdown</div>
      {[1,2,3,4,5].map((n,i) => (
        <div key={n} className="horiz-bar-row">
          <span className="horiz-label" style={{width:68}}>{labels[i]}</span>
          <div className="horiz-bar-wrap">
            <div className="horiz-bar" style={{width:`${(counts[i]/max)*100}%`, background:SEV_COLORS[i]}}/>
          </div>
          <span className="horiz-count">{counts[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Top triggers ────────────────────────────────────────── */
function TopTriggers({ entries }) {
  const freq = countFreq(entries.flatMap(e => [...(e.triggers||[]), ...(e.toothTriggers||[]), ...(e.illnessSymptoms||[])]));
  const top  = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,6);
  if (!top.length) return null;
  const max = top[0][1];
  return (
    <div className="card an-card">
      <div className="an-title">Top triggers &amp; symptoms</div>
      {top.map(([label,count]) => (
        <div key={label} className="horiz-bar-row">
          <span className="horiz-label">{label}</span>
          <div className="horiz-bar-wrap">
            <div className="horiz-bar violet" style={{width:`${(count/max)*100}%`}}/>
          </div>
          <span className="horiz-count">{count}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Top coping ──────────────────────────────────────────── */
function TopCoping({ entries }) {
  const freq = countFreq(entries.flatMap(e => e.coping||[]));
  const top  = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if (!top.length) return null;
  const max = top[0][1];
  return (
    <div className="card an-card">
      <div className="an-title">Coping strategies used</div>
      {top.map(([label,count]) => (
        <div key={label} className="horiz-bar-row">
          <span className="horiz-label">{label}</span>
          <div className="horiz-bar-wrap">
            <div className="horiz-bar teal" style={{width:`${(count/max)*100}%`}}/>
          </div>
          <span className="horiz-count">{count}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Sleep vs severity ───────────────────────────────────── */
function SleepVsSeverity({ entries }) {
  const groups = { Poor:[], Fair:[], Good:[] };
  entries.filter(e=>e.sleep).forEach(e => { if(groups[e.sleep]) groups[e.sleep].push(e.severity||3); });
  const avgs = Object.entries(groups).map(([lbl,sevs]) => ({
    lbl, avg: sevs.length ? (sevs.reduce((a,b)=>a+b,0)/sevs.length).toFixed(1) : null, n: sevs.length
  })).filter(g=>g.n>0);
  if (avgs.length < 2) return null;
  const max = 5;
  return (
    <div className="card an-card">
      <div className="an-title">Sleep quality vs severity</div>
      {avgs.map(g => (
        <div key={g.lbl} className="horiz-bar-row">
          <span className="horiz-label" style={{width:68}}>{g.lbl} sleep</span>
          <div className="horiz-bar-wrap">
            <div className="horiz-bar amber" style={{width:`${(parseFloat(g.avg)/max)*100}%`}}/>
          </div>
          <span className="horiz-count">{g.avg} avg</span>
        </div>
      ))}
      <p className="an-hint">Higher severity after poorer sleep may indicate a pattern.</p>
    </div>
  );
}

/* ── Mood & energy from checkins ─────────────────────────── */
function MoodEnergyChart({ checkins }) {
  const days   = checkins.slice(0,14).reverse();
  const maxMood = 5;
  return (
    <div className="card an-card">
      <div className="an-title">Mood &amp; energy (check-ins)</div>
      <div className="spark-chart">
        {days.map((c,i) => {
          const d = new Date(c.date);
          return (
            <div key={c.id??i} className="spark-col">
              <div className="spark-bars">
                <div className="spark-bar mood" style={{height:`${((c.mood||3)/maxMood)*100}%`}} title={`Mood: ${c.mood}`}/>
                <div className="spark-bar energy" style={{height:`${((c.energy||3)/maxMood)*100}%`}} title={`Energy: ${c.energy}`}/>
              </div>
              <div className="spark-lbl">{d.getDate()}</div>
            </div>
          );
        })}
      </div>
      <div className="spark-legend">
        <span><span className="spark-dot mood-dot"/>Mood</span>
        <span><span className="spark-dot energy-dot"/>Energy</span>
      </div>
    </div>
  );
}

/* ── Stress correlation ──────────────────────────────────── */
function StressCorrelation({ entries, checkins }) {
  if (checkins.length < 3 || entries.length < 3) return null;
  const byDate = {};
  checkins.forEach(c => { byDate[c.date?.slice(0,10)] = c; });
  const pairs = entries
    .filter(e => e.severity)
    .map(e => ({ sev: e.severity, stress: byDate[e.timestamp?.slice(0,10)]?.stress }))
    .filter(p => p.stress);
  if (pairs.length < 3) return null;

  const stressMap = { Low:1, Some:2, High:3 };
  const correlation = pairs.reduce((s,p) => s + stressMap[p.stress] * p.sev, 0) / pairs.length;

  return (
    <div className="card an-card insights-card">
      <div className="an-title">Stress &amp; severity</div>
      <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.6}}>
        {correlation > 6
          ? '⚡ High stress days tend to coincide with more severe episodes. Managing stress may reduce severity.'
          : correlation > 4
          ? '📊 There is a moderate relationship between your stress levels and episode severity.'
          : '✅ Your episodes do not appear to closely follow your reported stress levels.'}
      </p>
    </div>
  );
}

/* ── Insights panel ──────────────────────────────────────── */
function InsightsPanel({ insights }) {
  return (
    <div className="card an-card insights-card">
      <div className="an-title">Insights</div>
      <div className="insights-list">
        {insights.map((ins,i) => (
          <div key={i} className="insight-item">
            <span className="insight-icon">{ins.icon}</span>
            <span className="insight-text">{ins.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */
function countFreq(arr) {
  return arr.reduce((acc,v) => { acc[v]=(acc[v]||0)+1; return acc; }, {});
}

function topItem(arr) {
  if (!arr.length) return null;
  const f = countFreq(arr);
  return Object.entries(f).sort((a,b)=>b[1]-a[1])[0]?.[0];
}

function buildInsights(entries, checkins) {
  if (entries.length < 3) return [];
  const ins = [];

  const trigger = topItem(entries.flatMap(e => e.triggers||[]));
  if (trigger) ins.push({ icon:'⚡', text:`Your most common trigger is "${trigger}".` });

  const hours = entries.map(e => new Date(e.timestamp).getHours());
  const avgH  = Math.round(hours.reduce((a,b)=>a+b,0)/hours.length);
  const tLabel = avgH<6?'late night':avgH<12?'morning':avgH<18?'afternoon':'evening';
  ins.push({ icon:'🕐', text:`Events most often occur in the ${tLabel} (around ${avgH}:00).` });

  const coping = topItem(entries.flatMap(e => e.coping||[]));
  if (coping) ins.push({ icon:'🛡️', text:`You most commonly use "${coping}" as a coping strategy.` });

  const poor = entries.filter(e=>e.sleep==='Poor');
  const good = entries.filter(e=>e.sleep==='Good');
  if (poor.length>=2 && good.length>=2) {
    const pa = poor.reduce((s,e)=>s+(e.severity||3),0)/poor.length;
    const ga = good.reduce((s,e)=>s+(e.severity||3),0)/good.length;
    if (pa > ga+0.5) ins.push({ icon:'😴', text:`Episodes after poor sleep are on average ${(pa-ga).toFixed(1)} points more severe.` });
  }

  const medEntries = entries.filter(e=>e.medication&&e.medicationHelped);
  if (medEntries.length>=2) {
    const helped = medEntries.filter(e=>e.medicationHelped==='Yes').length;
    ins.push({ icon:'💊', text:`Pain relief helped in ${Math.round((helped/medEntries.length)*100)}% of logged cases.` });
  }

  const typeCounts = countFreq(entries.map(e=>e.type));
  const topType = Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0];
  if (topType) {
    const info = ENTRY_TYPES[topType[0]];
    ins.push({ icon: info?.icon??'📋', text:`${info?.label??topType[0]} is your most frequently logged event (${topType[1]} times).` });
  }

  return ins;
}
