import { useState, useEffect, useRef } from "react";
import { DAYS, COST_BREAKDOWN, TRIP_INFO, AURORA_LINKS, WEATHER_LINKS, DAILY_ROUTES, BOOKINGS, PACK_LIST } from "../lib/tripData";

const SK = "iceland_trip_v4";
function load() { try { return JSON.parse(localStorage.getItem(SK) || "{}"); } catch { return {}; } }
function save(s) { try { localStorage.setItem(SK, JSON.stringify(s)); } catch {} }

// ─── Tiny UI primitives ───────────────────────────────────────────────────────
const C = {
  bg: "#0f0f0f", card: "#1a1a1a", border: "#2a2a2a", border2: "#333",
  text: "#f0f0f0", muted: "#888", subtle: "#555",
  green: "#22c55e", greenDim: "#14532d", greenBg: "#0d2818",
  purple: "#a78bfa", purpleBg: "#1e1040", purpleDim: "#4c1d95",
  blue: "#60a5fa", blueBg: "#1e3a5f",
  amber: "#fbbf24", amberBg: "#451a03",
  red: "#f87171", redBg: "#450a0a",
  pink: "#f9a8d4", pinkBg: "#4a0e2a",
  teal: "#2dd4bf", tealBg: "#0d3330",
};

const btn = (bg, color, extra = {}) => ({
  background: bg, color, border: "none", borderRadius: 8, padding: "7px 14px",
  fontSize: 13, fontWeight: 600, cursor: "pointer", ...extra,
});

const card = (extra = {}) => ({
  background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, ...extra,
});

const tag = (bg, color) => ({
  background: bg, color, fontSize: 11, padding: "2px 8px", borderRadius: 20,
  fontWeight: 600, display: "inline-block", marginRight: 4, marginTop: 3,
});

// ─── Countdown ────────────────────────────────────────────────────────────────
function Countdown() {
  const [diff, setDiff] = useState(null);
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const trip = new Date("2025-12-09T00:00:00");
      const ms = trip - now;
      if (ms <= 0) { setDiff({ days: 0, hrs: 0, mins: 0, gone: true }); return; }
      const days = Math.floor(ms / 86400000);
      const hrs = Math.floor((ms % 86400000) / 3600000);
      const mins = Math.floor((ms % 3600000) / 60000);
      setDiff({ days, hrs, mins, gone: false });
    };
    calc(); const iv = setInterval(calc, 30000); return () => clearInterval(iv);
  }, []);
  if (!diff) return null;
  if (diff.gone) return (
    <div style={{ background: C.greenBg, border: `1px solid ${C.green}`, borderRadius: 12, padding: "12px 16px", marginBottom: 12, textAlign: "center" }}>
      <p style={{ color: C.green, fontWeight: 700, fontSize: 16, margin: 0 }}>🎉 You're in Iceland! Enjoy every moment!</p>
    </div>
  );
  return (
    <div style={{ background: "linear-gradient(135deg, #1e1040 0%, #0f0820 100%)", border: `1px solid ${C.purpleDim}`, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
      <p style={{ color: C.purple, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 10px" }}>🇮🇸 Countdown to Iceland</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {[["Days", diff.days], ["Hours", diff.hrs], ["Mins", diff.mins]].map(([l, v]) => (
          <div key={l} style={{ flex: 1, textAlign: "center", background: "#2d1f5e", borderRadius: 10, padding: "10px 6px" }}>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{v}</p>
            <p style={{ margin: "3px 0 0", fontSize: 10, color: C.purple, fontWeight: 600, textTransform: "uppercase" }}>{l}</p>
          </div>
        ))}
      </div>
      <p style={{ color: "#6b5f9e", fontSize: 11, margin: "10px 0 0", textAlign: "center" }}>Dec 9–13 · Hotel 201 · Kia Sportage · 2 travellers</p>
    </div>
  );
}

// ─── Stop card ────────────────────────────────────────────────────────────────
const CAT = {
  nature: { bg: "#0d2818", border: "#14532d", accent: C.green },
  food: { bg: "#1c1208", border: "#713f12", accent: C.amber },
  transport: { bg: C.blueBg, border: "#1e40af", accent: C.blue },
  sightseeing: { bg: C.purpleBg, border: "#4c1d95", accent: C.purple },
  aurora: { bg: "#050310", border: C.purpleDim, accent: C.purple },
  spa: { bg: C.pinkBg, border: "#831843", accent: C.pink },
  cafe: { bg: C.tealBg, border: "#0f766e", accent: C.teal },
  rest: { bg: "#111", border: C.border, accent: C.muted },
};

function Stop({ stop, checked, onToggle }) {
  const [open, setOpen] = useState(false);
  const c = CAT[stop.category] || CAT.rest;
  return (
    <div style={{ border: `1px solid ${checked ? C.greenDim : c.border}`, borderRadius: 12, marginBottom: 8, overflow: "hidden", background: checked ? "#0a1a0f" : c.bg, transition: "all .2s" }}>
      <div style={{ display: "flex", gap: 10, padding: "10px 12px", cursor: "pointer", alignItems: "flex-start" }} onClick={() => setOpen(o => !o)}>
        <div style={{ flexShrink: 0, paddingTop: 1 }}>
          <span style={{ fontSize: 20 }}>{stop.icon}</span>
          <p style={{ margin: "2px 0 0", fontSize: 10, color: C.muted, textAlign: "center" }}>{stop.time}</p>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: checked ? C.muted : C.text, textDecoration: checked ? "line-through" : "none" }}>{stop.name}</p>
          {stop.warning && <p style={{ margin: "0 0 3px", fontSize: 11, color: C.red, fontWeight: 600 }}>⚠️ {stop.warning}</p>}
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {(stop.tags || []).map(t => <span key={t} style={tag("#1f1f1f", C.muted)}>{t}</span>)}
          </div>
        </div>
        <div style={{ flexShrink: 0, display: "flex", gap: 8, alignItems: "center" }}>
          {stop.cost != null && <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>€{stop.cost}</span>}
          <div onClick={e => { e.stopPropagation(); onToggle(); }} style={{
            width: 26, height: 26, borderRadius: "50%", border: `2px solid ${checked ? C.green : C.subtle}`,
            background: checked ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
          }}>
            {checked && <span style={{ color: "#000", fontSize: 14, fontWeight: 900 }}>✓</span>}
          </div>
          <span style={{ color: C.muted, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${c.border}` }}>
          {stop.note && <p style={{ fontSize: 13, color: "#ccc", margin: "10px 0 8px", lineHeight: 1.65 }}>{stop.note}</p>}
          {stop.parking && (
            <div style={{ background: "#0d2818", border: `1px solid ${C.greenDim}`, borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.green, margin: "0 0 2px" }}>🅿️ Parking</p>
              <p style={{ fontSize: 12, color: "#86efac", margin: 0 }}>{stop.parking}</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {stop.mapsUrl && (
              <a href={stop.mapsUrl} target="_blank" rel="noreferrer" style={btn(C.blueBg, C.blue, { textDecoration: "none", fontSize: 12 })}>📍 Google Maps ↗</a>
            )}
            <button onClick={e => { e.stopPropagation(); onToggle(); }} style={btn(checked ? C.greenBg : "#1a1a1a", checked ? C.green : C.muted, { fontSize: 12 })}>
              {checked ? "✓ Done — undo?" : "Mark done"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Aurora box ───────────────────────────────────────────────────────────────
function AuroraBox({ spot }) {
  return (
    <div style={{ background: "linear-gradient(135deg, #050310 0%, #1e1040 100%)", border: `1px solid ${C.purpleDim}`, borderRadius: 12, padding: "12px 14px", marginTop: 8 }}>
      <p style={{ color: C.purple, fontWeight: 700, fontSize: 13, margin: "0 0 4px" }}>🌌 Tonight's aurora spot</p>
      <p style={{ color: "#e0d4ff", fontWeight: 600, fontSize: 14, margin: "0 0 6px" }}>{spot.name}</p>
      <p style={{ color: "#9b8fd4", fontSize: 12, margin: "0 0 10px", lineHeight: 1.6 }}>{spot.note}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {AURORA_LINKS.map(l => (
          <a key={l.url} href={l.url} target="_blank" rel="noreferrer" style={{ background: "#2d1f5e", color: C.purple, borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>
            {l.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Days tab ─────────────────────────────────────────────────────────────────
function DaysTab({ state, toggle }) {
  const [activeDay, setActiveDay] = useState(1);
  const day = DAYS.find(d => d.id === activeDay);
  const stops = day?.stops || [];
  const done = stops.filter(s => state[s.id]).length;
  const route = DAILY_ROUTES[activeDay];

  return (
    <div>
      {/* Day selector */}
      <div style={{ display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto", background: C.card, borderBottom: `1px solid ${C.border}` }}>
        {DAYS.map(d => {
          const dd = d.stops.filter(s => state[s.id]).length;
          const pct = Math.round((dd / d.stops.length) * 100);
          return (
            <button key={d.id} onClick={() => setActiveDay(d.id)} style={{
              flexShrink: 0, padding: "8px 16px", borderRadius: 20,
              border: `1px solid ${activeDay === d.id ? C.purple : C.border2}`,
              background: activeDay === d.id ? C.purpleBg : "transparent",
              color: activeDay === d.id ? C.purple : C.muted,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>
              Day {d.id} {pct === 100 ? "✅" : pct > 0 ? `${pct}%` : ""}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "12px 16px" }}>
        {/* Day header */}
        <div style={{ ...card(), padding: "12px 14px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{day.date}</p>
              <h2 style={{ margin: "3px 0 0", fontSize: 17, fontWeight: 800, color: C.text }}>{day.title}</h2>
            </div>
            <span style={{ background: day.badgeColor + "33", color: day.badgeText === "#3C3489" ? C.purple : day.badgeText === "#0C447C" ? C.blue : day.badgeText === "#72243E" ? C.pink : C.amber, borderRadius: 10, padding: "3px 10px", fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 8, marginTop: 2 }}>{day.badge}</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[`🚗 ${day.kmDriving} km`, `🅿️ ~€${day.parkingEur}`, `${done}/${stops.length} done`].map(t => (
              <span key={t} style={{ background: "#222", color: C.muted, borderRadius: 8, padding: "4px 10px", fontSize: 12 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Route link */}
        {route && (
          <a href={route.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, ...card(), padding: "10px 14px", marginBottom: 12, textDecoration: "none" }}>
            <span style={{ fontSize: 22 }}>🗺️</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.blue }}>Open route in Google Maps</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{route.label}</p>
            </div>
            <span style={{ color: C.blue, fontSize: 18 }}>↗</span>
          </a>
        )}

        {/* Weather link for this day */}
        {activeDay <= 4 && (
          <a href={WEATHER_LINKS[activeDay <= 1 ? 2 : activeDay === 2 ? 0 : activeDay === 3 ? 1 : 2].url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, background: "#0a1a20", border: "1px solid #0f4c5c", borderRadius: 10, padding: "8px 12px", marginBottom: 12, textDecoration: "none" }}>
            <span style={{ fontSize: 18 }}>🌦️</span>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#67e8f9" }}>Check weather for today's route ↗</p>
          </a>
        )}

        {/* Stops */}
        {stops.map(s => <Stop key={s.id} stop={s} checked={!!state[s.id]} onToggle={() => toggle(s.id)} />)}

        {/* Aurora */}
        {day.aurora && <AuroraBox spot={day.aurora} />}
      </div>
    </div>
  );
}

// ─── Bookings tab ─────────────────────────────────────────────────────────────
const CAT_ICON = { flight: "✈️", hotel: "🏨", car: "🚗", tour: "🌌", spa: "🌊" };

function BookingsTab({ state, update }) {
  const [editing, setEditing] = useState(null);
  const [vals, setVals] = useState({});
  useEffect(() => { setVals(state.bookings || {}); }, [state.bookings]);

  function saveField(key, val) {
    const next = { ...vals, [key]: val };
    setVals(next);
    update("bookings", next);
  }

  const booked = BOOKINGS.filter(b => b.booked || vals[b.confirmationKey]).length;

  return (
    <div style={{ padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>📋 Bookings</h2>
        <span style={{ background: booked === BOOKINGS.length ? C.greenBg : "#1a1a1a", color: booked === BOOKINGS.length ? C.green : C.muted, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>{booked}/{BOOKINGS.length} confirmed</span>
      </div>
      {BOOKINGS.map(b => {
        const conf = vals[b.confirmationKey] || "";
        const link = vals[b.linkKey] || "";
        const isEdit = editing === b.id;
        const isDone = b.booked || conf.length > 0;
        return (
          <div key={b.id} style={{ ...card(), padding: "12px 14px", marginBottom: 10, borderColor: isDone ? C.greenDim : C.border }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{CAT_ICON[b.category]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>{b.label}</p>
                  <span style={{ fontSize: 18 }}>{isDone ? "✅" : "⬜"}</span>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: C.muted }}>{b.detail}</p>
                {conf ? <p style={{ margin: "0 0 4px", fontSize: 12, color: C.green, fontWeight: 600 }}>📝 Ref: {conf}</p> : !b.booked && <p style={{ margin: "0 0 4px", fontSize: 11, color: C.subtle }}>No confirmation added yet</p>}
                {link && <a href={link.startsWith("http") ? link : "https://" + link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.blue, textDecoration: "none" }}>🔗 Open booking ↗</a>}
              </div>
            </div>
            {isEdit ? (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={conf} onChange={e => saveField(b.confirmationKey, e.target.value)}
                  placeholder="Confirmation / booking reference"
                  style={{ background: "#111", border: `1px solid ${C.border2}`, color: C.text, borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none" }} />
                <input value={link} onChange={e => saveField(b.linkKey, e.target.value)}
                  placeholder="Booking URL (optional)"
                  style={{ background: "#111", border: `1px solid ${C.border2}`, color: C.text, borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditing(null)} style={btn(C.greenBg, C.green)}>Save</button>
                  {b.url && <a href={b.url} target="_blank" rel="noreferrer" style={{ ...btn(C.blueBg, C.blue), textDecoration: "none" }}>Book ↗</a>}
                </div>
              </div>
            ) : (
              <button onClick={() => setEditing(b.id)} style={{ ...btn("#222", C.muted), marginTop: 8, fontSize: 12 }}>
                {conf ? "Edit details" : "+ Add confirmation"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Packing tab ──────────────────────────────────────────────────────────────
const PACK_CATS = { clothing: "🧥 Clothing & gear", gear: "📷 Gadgets & equipment", apps: "📱 Apps & downloads", docs: "📄 Documents & payments", health: "💊 Health & comfort", food: "🍫 Snacks" };

function PackingTab({ state, update }) {
  const packed = state.packed || {};
  function toggle(id) { const n = { ...packed, [id]: !packed[id] }; update("packed", n); }
  const doneCt = PACK_LIST.filter(p => packed[p.id]).length;

  return (
    <div style={{ padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>🎒 Pack list</h2>
        <span style={{ background: doneCt === PACK_LIST.length ? C.greenBg : "#1a1a1a", color: doneCt === PACK_LIST.length ? C.green : C.muted, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>{doneCt}/{PACK_LIST.length}</span>
      </div>
      {Object.entries(PACK_CATS).map(([cat, label]) => {
        const items = PACK_LIST.filter(p => p.category === cat);
        const catDone = items.filter(p => packed[p.id]).length;
        return (
          <div key={cat} style={{ ...card(), padding: "10px 14px", marginBottom: 10 }}>
            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: C.text, display: "flex", justifyContent: "space-between" }}>
              {label} <span style={{ color: catDone === items.length ? C.green : C.muted, fontWeight: 600 }}>{catDone}/{items.length}</span>
            </p>
            {items.map(item => (
              <div key={item.id} onClick={() => toggle(item.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "7px 0",
                borderBottom: `1px solid ${C.border}`, cursor: "pointer",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, border: `2px solid ${packed[item.id] ? C.green : C.subtle}`,
                  background: packed[item.id] ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {packed[item.id] && <span style={{ color: "#000", fontSize: 12, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: packed[item.id] ? C.subtle : C.text, textDecoration: packed[item.id] ? "line-through" : "none" }}>{item.label}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Weather & Roads tab ──────────────────────────────────────────────────────
function WeatherTab() {
  return (
    <div style={{ padding: "16px 16px 80px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>🌦️ Weather & Roads</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 16px", lineHeight: 1.6 }}>Check every morning before driving. Road conditions can change fast in December Iceland.</p>

      <div style={{ ...card(), padding: "10px 14px", marginBottom: 12, background: C.redBg, borderColor: "#7f1d1d" }}>
        <p style={{ color: C.red, fontWeight: 700, fontSize: 13, margin: "0 0 4px" }}>⚠️ Critical daily habit</p>
        <p style={{ color: "#fca5a5", fontSize: 12, margin: 0, lineHeight: 1.6 }}>Check road.is for closures every morning before setting off. December storms can close roads within hours. If road is marked F-road or closed — do not drive it.</p>
      </div>

      <p style={{ fontSize: 12, color: C.muted, margin: "0 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em" }}>🌤 Weather by area</p>
      {WEATHER_LINKS.slice(0, 3).map(l => (
        <a key={l.url} href={l.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "flex-start", gap: 10, ...card(), padding: "10px 14px", marginBottom: 8, textDecoration: "none" }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🌦️</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#67e8f9" }}>{l.label}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{l.desc}</p>
          </div>
          <span style={{ color: "#67e8f9", fontSize: 16, flexShrink: 0 }}>↗</span>
        </a>
      ))}

      <p style={{ fontSize: 12, color: C.muted, margin: "14px 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em" }}>🚗 Road conditions</p>
      {WEATHER_LINKS.slice(3).map(l => (
        <a key={l.url} href={l.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "flex-start", gap: 10, ...card(), padding: "10px 14px", marginBottom: 8, textDecoration: "none" }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🛣️</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.amber }}>{l.label}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{l.desc}</p>
          </div>
          <span style={{ color: C.amber, fontSize: 16, flexShrink: 0 }}>↗</span>
        </a>
      ))}

      <p style={{ fontSize: 12, color: C.muted, margin: "14px 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em" }}>🌌 Aurora trackers</p>
      {AURORA_LINKS.map(l => (
        <a key={l.url} href={l.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.purpleBg, border: `1px solid ${C.purpleDim}`, borderRadius: 10, padding: "10px 14px", marginBottom: 8, textDecoration: "none" }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🌌</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.purple }}>{l.label}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9b8fd4" }}>{l.desc}</p>
          </div>
          <span style={{ color: C.purple, fontSize: 16, flexShrink: 0 }}>↗</span>
        </a>
      ))}

      <div style={{ background: "#0d2818", border: `1px solid ${C.greenDim}`, borderRadius: 10, padding: "10px 14px", marginTop: 4 }}>
        <p style={{ color: C.green, fontWeight: 700, fontSize: 12, margin: "0 0 4px" }}>🌡️ What to expect in December</p>
        <p style={{ color: "#86efac", fontSize: 12, margin: 0, lineHeight: 1.7 }}>
          Temp: −5°C to +5°C · Wind: can reach 80+ km/h · Sunset: ~15:30 · Sunrise: ~11:00 · Daylight: ~4.5h · Snow: possible but not guaranteed · Ice: very likely on paths and roads
        </p>
      </div>
    </div>
  );
}

// ─── Cost tab ─────────────────────────────────────────────────────────────────
function CostTab() {
  const total = COST_BREAKDOWN.reduce((s, i) => s + i.eur, 0);
  const cats = [...new Set(COST_BREAKDOWN.map(i => i.category))];
  const catColors = { experience: C.purple, sightseeing: C.blue, transport: C.amber, food: C.teal, shopping: C.pink };
  return (
    <div style={{ padding: "16px 16px 80px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: "0 0 4px" }}>💶 Cost estimate</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 14px" }}>On-trip costs for 2 people — excludes flights, hotel, car rental</p>
      <div style={{ background: "linear-gradient(135deg, #0d2818 0%, #0a1f10 100%)", border: `1px solid ${C.greenDim}`, borderRadius: 14, padding: "16px", marginBottom: 14, textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 13, color: "#86efac" }}>Total estimated on-trip spend</p>
        <p style={{ margin: "4px 0 0", fontSize: 40, fontWeight: 900, color: C.green }}>€{total}</p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: C.greenDim }}>for 2 people · 4 days</p>
      </div>
      {cats.map(cat => {
        const items = COST_BREAKDOWN.filter(i => i.category === cat);
        const catTotal = items.reduce((s, i) => s + i.eur, 0);
        const col = catColors[cat] || C.text;
        return (
          <div key={cat} style={{ ...card(), padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: col, textTransform: "capitalize" }}>{cat}</p>
              <span style={{ fontSize: 14, fontWeight: 800, color: col }}>€{catTotal}</span>
            </div>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "6px 0", borderTop: `1px solid ${C.border}` }}>
                <div style={{ flex: 1, paddingRight: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, color: C.text }}>{item.label}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 11, color: C.muted }}>{item.note}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.green, flexShrink: 0 }}>€{item.eur}</span>
              </div>
            ))}
          </div>
        );
      })}
      <div style={{ ...card(), padding: "10px 14px", background: "#111" }}>
        <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.7 }}>
          Excludes: flights (booked), hotel 4 nights (booked), car rental (to book), Sky Lagoon (to book), personal shopping. ISK: 1,000 ISK ≈ €7. Prices approximate for Dec 2025.
        </p>
      </div>
    </div>
  );
}

// ─── Info tab ─────────────────────────────────────────────────────────────────
function InfoTab({ state, update }) {
  const [note, setNote] = useState(state.notes || "");
  function saveNote(v) { setNote(v); update("notes", v); }

  return (
    <div style={{ padding: "16px 16px 80px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: "0 0 14px" }}>ℹ️ Essential info</h2>

      {/* Hotel + flights */}
      <div style={{ ...card(), padding: "12px 14px", marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>✈️ Trip details</p>
        {[
          ["Outbound", "KL 1770 + HV 6887 · BER→AMS→KEF · Dec 9"],
          ["Return", "HV 6888 + KL 1785 · KEF→AMS→BER · Dec 13"],
          ["Hotel", "Hotel 201 · Hliðasmári 5, Kópavogur · +354 556 1100"],
          ["Car", "Toyota Yaris Cross 4x4 Hybrid · Pick up + drop KEF · €287"],
          ["Breakfast", "Included at hotel all 4 mornings"],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 10, padding: "6px 0", borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.muted, minWidth: 68, flexShrink: 0 }}>{l}</span>
            <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Car details */}
      <div style={{ background: "#0d1f2d", border: `1px solid #1e3a5f`, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.blue, margin: "0 0 8px" }}>🚗 Car — Toyota Yaris Cross 4x4 Hybrid</p>
        {[
          ["Fuel", "95 Unleaded petrol (hybrid — never plug in, charges itself)"],
          ["Economy", "~20–22 km/litre · Est. €80–90 total fuel for trip"],
          ["WiFi", "Free 4G WiFi included — keep device charged via car USB"],
          ["Fill up", "Near KEF on arrival · Vík on Day 2 · Olis Keflavík on Day 5"],
          ["Insurance", "Zero excess · SCDW · Gravel · Sand & Ash · Tire · Animal"],
          ["Roadside", "24/7 assistance · Lost keys · Towing · Flat battery · Fuel delivery"],
          ["On pickup", "Confirm winter tyres ✓ · Save emergency number in phone ✓"],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 10, padding: "6px 0", borderTop: `1px solid #1e3a5f` }}>
            <span style={{ fontSize: 12, color: C.blue, minWidth: 72, flexShrink: 0 }}>{l}</span>
            <span style={{ fontSize: 12, color: "#93c5fd", fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Parking apps */}
      <div style={{ ...card(), padding: "12px 14px", marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>🅿️ Parking apps</p>
        {[
          { name: "Parka", desc: "Primary — most South Coast + Golden Circle sites", url: "https://www.parka.is" },
          { name: "EasyPark", desc: "Backup — Reykjavík street parking", url: "https://easypark.net" },
          { name: "Checkit.is", desc: "Seljalandsfoss + Þingvellir", url: "https://www.checkit.is" },
        ].map(a => (
          <a key={a.name} href={a.url} target="_blank" rel="noreferrer" style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: `1px solid ${C.border}`, textDecoration: "none", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.green }}>{a.name}</p>
              <p style={{ margin: "1px 0 0", fontSize: 11, color: C.muted }}>{a.desc}</p>
            </div>
            <span style={{ color: C.green, fontSize: 16 }}>↗</span>
          </a>
        ))}
        <p style={{ fontSize: 11, color: C.subtle, margin: "8px 0 0", lineHeight: 1.5 }}>Add rental plate immediately at car pick-up. Parking is camera-enforced — fines go to rental company with admin fee.</p>
      </div>

      {/* Vegetarian food */}
      <div style={{ background: "#0d2818", border: `1px solid ${C.greenDim}`, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.green, margin: "0 0 8px" }}>🥗 Vegetarian food cheatsheet</p>
        {[
          ["Reykjavík", "Loving Hut (vegan Asian soups) · Chickpea (falafel, closed Sun) · 101 Street Food (unlimited soup)"],
          ["South Coast", "Skógafoss café (soup) · Suður-Vík in Vík (veggie soup, open noon)"],
          ["Golden Circle", "Geysir Bistro · Gullfoss Café — both have hot soup"],
          ["Budget", "Bónus supermarket (yellow pig) — Iceland's cheapest. Stock up night before road days."],
        ].map(([l, v]) => (
          <div key={l} style={{ padding: "6px 0", borderTop: `1px solid ${C.greenDim}` }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#86efac" }}>{l}: </span>
            <span style={{ fontSize: 12, color: "#4ade80" }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div style={{ ...card(), padding: "12px 14px", marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>📝 Your notes</p>
        <textarea
          value={note}
          onChange={e => saveNote(e.target.value)}
          placeholder="Add anything here — phone numbers, reminders, PIN codes…"
          style={{ width: "100%", minHeight: 100, background: "#111", border: `1px solid ${C.border2}`, color: C.text, borderRadius: 8, padding: "8px 10px", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }}
        />
      </div>

      {/* Emergency */}
      <div style={{ background: C.redBg, border: `1px solid #7f1d1d`, borderRadius: 12, padding: "12px 14px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.red, margin: "0 0 8px" }}>🆘 Emergency contacts</p>
        {[
          ["Emergency", "112 (police, fire, ambulance)"],
          ["Road rescue", "1777 (Icelandic emergency hotline)"],
          ["Hotel 201", "+354 556 1100"],
          ["Safe Travel", "safetravel.is — register your trip"],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 10, padding: "5px 0", borderTop: `1px solid #7f1d1d` }}>
            <span style={{ fontSize: 12, color: "#f87171", minWidth: 80, flexShrink: 0 }}>{l}</span>
            <span style={{ fontSize: 12, color: "#fca5a5", fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main app ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "days", icon: "📅", label: "Days" },
  { id: "bookings", icon: "📋", label: "Bookings" },
  { id: "pack", icon: "🎒", label: "Pack" },
  { id: "weather", icon: "🌦️", label: "Weather" },
  { id: "cost", icon: "💶", label: "Cost" },
  { id: "info", icon: "ℹ️", label: "Info" },
];

export default function App() {
  const [tab, setTab] = useState("days");
  const [state, setState] = useState({});
  useEffect(() => { setState(load()); }, []);

  function toggle(key) {
    const next = { ...state, [key]: !state[key] };
    setState(next); save(next);
  }
  function update(key, val) {
    const next = { ...state, [key]: val };
    setState(next); save(next);
  }

  const allStops = DAYS.flatMap(d => d.stops);
  const doneStops = allStops.filter(s => state[s.id]).length;
  const pct = Math.round((doneStops / allStops.length) * 100);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: C.bg, minHeight: "100vh", position: "relative" }}>
      {/* Header */}
      <div style={{ background: "#080808", borderBottom: `1px solid ${C.border}`, padding: "14px 16px 10px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: C.text }}>🇮🇸 Iceland Trip</h1>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>Dec 9–13 · Hotel 201 · 2 travellers</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.purple }}>{doneStops}/{allStops.length} done</p>
            <p style={{ margin: "2px 0 0", fontSize: 10, color: C.subtle }}>{pct}% complete</p>
          </div>
        </div>
        <div style={{ height: 3, background: "#222", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.purple}, ${C.green})`, width: `${pct}%`, transition: "width .4s" }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingBottom: 70 }}>
        {tab === "days" && (
          <div>
            <div style={{ padding: "12px 16px 0" }}>
              <Countdown />
            </div>
            <DaysTab state={state} toggle={toggle} />
          </div>
        )}
        {tab === "bookings" && <BookingsTab state={state} update={update} />}
        {tab === "pack" && <PackingTab state={state} update={update} />}
        {tab === "weather" && <WeatherTab />}
        {tab === "cost" && <CostTab />}
        {tab === "info" && <InfoTab state={state} update={update} />}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#080808", borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 100 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "10px 0 12px", border: "none", background: "transparent", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            borderTop: `2px solid ${tab === t.id ? C.purple : "transparent"}`,
          }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: tab === t.id ? C.purple : C.subtle, textTransform: "uppercase", letterSpacing: ".05em" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
