import React, { useState, useEffect, useRef } from 'react';
import './loader.css';

const CONVO = [
  { type: 'typing', who: 'them', ms: 700 },
  { type: 'msg',    who: 'them', text: 'Hey there 👋' },
  { type: 'gap',    ms: 300 },
  { type: 'typing', who: 'me',   ms: 600 },
  { type: 'msg',    who: 'me',   text: 'Loading for you ✨' },
  { type: 'gap',    ms: 280 },
  { type: 'typing', who: 'them', ms: 750 },
  { type: 'msg',    who: 'them', text: 'Almost ready 🚀' },
  { type: 'gap',    ms: 280 },
  { type: 'typing', who: 'me',   ms: 550 },
  { type: 'msg',    who: 'me',   text: 'Just a sec… ⏳' },
  { type: 'gap',    ms: 1800 },
  { type: 'clear' },
  { type: 'gap',    ms: 700 },
];

/* Build absolute-time event list */
const buildTimeline = (convo) => {
  let t = 0;
  const events = [];
  convo.forEach((s) => {
    if (s.type === 'typing') {
      events.push({ at: t, act: 'typing', who: s.who, on: true  });
      t += s.ms;
      events.push({ at: t, act: 'typing', who: s.who, on: false });
    } else if (s.type === 'msg') {
      events.push({ at: t, act: 'msg', who: s.who, text: s.text });
    } else if (s.type === 'gap') {
      t += s.ms;
    } else if (s.type === 'clear') {
      events.push({ at: t, act: 'clear' });
    }
  });
  return { events, total: t };
};

const { events: TL, total: LOOP_MS } = buildTimeline(CONVO);
let uid = 0;

/* ── Typing dots ── */
const Dots = () => (
  <span className="lc-dots">
    <span /><span /><span />
  </span>
);

/* ── Main Loader ── */
const Loader = ({
  show = true,
  onComplete,
  className = '',
}) => {
  const [msgs,  setMsgs]  = useState([]);
  const [tthem, setTThem] = useState(false);
  const [tme,   setTMe]   = useState(false);
  const [fading, setFading] = useState(false);
  const [gone,   setGone]   = useState(false);
  const [clearing, setClr]  = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!show) {
      setFading(true);
      const id = setTimeout(() => { setGone(true); onComplete?.(); }, 500);
      return () => clearTimeout(id);
    }

    const ids = [];
    const sched = (fn, ms) => { const id = setTimeout(fn, ms); ids.push(id); return id; };

    const run = () => {
      TL.forEach((ev) => {
        sched(() => {
          if (ev.act === 'typing') {
            ev.who === 'them' ? setTThem(ev.on) : setTMe(ev.on);
          } else if (ev.act === 'msg') {
            setMsgs((p) => [...p, { id: ++uid, who: ev.who, text: ev.text }]);
          } else if (ev.act === 'clear') {
            setClr(true);
            sched(() => { setMsgs([]); setClr(false); }, 480);
          }
        }, ev.at);
      });
      sched(run, LOOP_MS);
    };

    run();
    return () => ids.forEach(clearTimeout);
  }, [show, onComplete]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, tthem, tme]);

  if (gone) return null;

  return (
    <div className={`lc-overlay ${fading ? 'lc-out' : ''} ${className}`}
      role="status" aria-label="Loading">

      <div className={`lc-feed ${clearing ? 'lc-feed--clear' : ''}`}>

        {msgs.map((m) => (
          <div key={m.id} className={`lc-row lc-row--${m.who}`}>
            {m.who === 'them' && <div className="lc-av lc-av--them">S</div>}
            <div className={`lc-bbl lc-bbl--${m.who}`}>{m.text}</div>
            {m.who === 'me' && (
              <span className="lc-tick" aria-hidden="true">
                <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
                  <path d="M1 4.5l3 3L11 1"   stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 4.5l3 3 5.5-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity=".5"/>
                </svg>
              </span>
            )}
          </div>
        ))}

        {tthem && (
          <div className="lc-row lc-row--them lc-row--typing">
            <div className="lc-av lc-av--them">S</div>
            <div className="lc-bbl lc-bbl--them lc-bbl--typing"><Dots /></div>
          </div>
        )}

        {tme && (
          <div className="lc-row lc-row--me lc-row--typing">
            <div className="lc-bbl lc-bbl--me lc-bbl--typing"><Dots /></div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Loader;