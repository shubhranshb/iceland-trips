import { useState, useEffect, useRef } from "react";
import { DAYS, COST_BREAKDOWN, TRIP_INFO, AURORA_LINKS, WEATHER_LINKS, DAILY_ROUTES, BOOKINGS, PACK_LIST } from "../lib/tripData";

const SK = "iceland_trip_v4";
function load() { try { return JSON.parse(localStorage.getItem(SK) || "{}"); } catch { return {}; } }
function save(s) { try { localStorage.setItem(SK, JSON.stringify(s)); } catch {} }

// ─── Design tokens — Iceland light theme ─────────────────────────────────────
const C = {
  bg: "#eef4fb", card: "#ffffff", border: "#d8e3ef", border2: "#c5d4e4",
  text: "#1e293b", muted: "#64748b", subtle: "#94a3b8",
  green: "#059669", greenDim: "#a7f3d0", greenBg: "#ecfdf5",
  purple: "#6366f1", purpleBg: "#eef2ff", purpleDim: "#c7d2fe",
  blue: "#0284c7", blueBg: "#e0f2fe",
  amber: "#d97706", amberBg: "#fffbeb",
  red: "#dc2626", redBg: "#fef2f2",
  pink: "#db2777", pinkBg: "#fdf2f8",
  teal: "#0d9488", tealBg: "#f0fdfa",
  glacier: "#bae6fd", moss: "#86efac", aurora: "#a78bfa",
};

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const inputStyle = {
  background: "#f8fafc", border: `1px solid ${C.border}`, color: C.text,
  borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
};

const btn = (bg, color, extra = {}) => ({
  background: bg, color, border: "none", borderRadius: 8, padding: "7px 14px",
  fontSize: 13, fontWeight: 600, cursor: "pointer", ...extra,
});

const card = (extra = {}) => ({
  background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
  boxShadow: "0 1px 3px rgba(15,23,42,0.04)", ...extra,
});

const tag = (bg, color) => ({
  background: bg, color, fontSize: 11, padding: "2px 8px", borderRadius: 20,
  fontWeight: 600, display: "inline-block", marginRight: 4, marginTop: 3,
});

// ─── Fun Iceland tips (rotate daily) ─────────────────────────────────────────
const ICELAND_TIPS = [
  "December daylight is only ~4.5 hours — plan stops around sunrise (~11:00) and sunset (~15:30).",
  "The Yaris Cross hybrid gets ~20 km/l — fill up in Vík on Day 2 before the glacier stretch.",
  "Parka app + your rental plate = no parking fines. Add the plate at car pickup!",
  "Reynisfjara beach waves are deadly — never turn your back on the ocean.",
  "Aurora needs KP ≥ 3 + clear skies. Check vedur.is cloud cover before heading out.",
  "Choose ISK not EUR at payment terminals — you'll save on conversion fees.",
  "Bónus supermarket (yellow pig) is Iceland's cheapest — stock up before road days.",
];

function IcelandTip() {
  const tip = ICELAND_TIPS[new Date().getDate() % ICELAND_TIPS.length];
  return (
    <div style={{ background: C.blueBg, border: `1px solid ${C.glacier}`, borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.blue, textTransform: "uppercase", letterSpacing: ".06em" }}>💡 Iceland tip</p>
      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#0369a1", lineHeight: 1.55 }}>{tip}</p>
    </div>
  );
}
function Countdown() {
  const [diff, setDiff] = useState(null);
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const trip = new Date("2026-12-09T00:00:00");
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
    <div style={{ background: "linear-gradient(135deg, #6366f1 0%, #0284c7 50%, #0d9488 100%)", borderRadius: 16, padding: "16px", marginBottom: 12, boxShadow: "0 4px 14px rgba(99,102,241,0.25)" }}>
      <p style={{ color: "#e0e7ff", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 10px" }}>🇮🇸 Countdown to Iceland</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {[["Days", diff.days], ["Hours", diff.hrs], ["Mins", diff.mins]].map(([l, v]) => (
          <div key={l} style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,0.25)", borderRadius: 12, padding: "12px 6px", backdropFilter: "blur(4px)" }}>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{v}</p>
            <p style={{ margin: "3px 0 0", fontSize: 10, color: "#e0e7ff", fontWeight: 600, textTransform: "uppercase" }}>{l}</p>
          </div>
        ))}
      </div>
      <p style={{ color: "#e0e7ff", fontSize: 11, margin: "10px 0 0", textAlign: "center" }}>Dec 9–13, 2026 · Hotel 201 · Toyota Yaris Cross · 2 travellers</p>
    </div>
  );
}

// ─── Stop card ────────────────────────────────────────────────────────────────
const CAT = {
  nature: { bg: "#ecfdf5", border: "#a7f3d0", accent: "#059669" },
  food: { bg: "#fffbeb", border: "#fde68a", accent: "#d97706" },
  transport: { bg: "#e0f2fe", border: "#bae6fd", accent: "#0284c7" },
  sightseeing: { bg: "#eef2ff", border: "#c7d2fe", accent: "#6366f1" },
  aurora: { bg: "#ede9fe", border: "#c4b5fd", accent: "#7c3aed" },
  spa: { bg: "#fdf2f8", border: "#fbcfe8", accent: "#db2777" },
  cafe: { bg: "#f0fdfa", border: "#99f6e4", accent: "#0d9488" },
  rest: { bg: "#f8fafc", border: "#e2e8f0", accent: "#64748b" },
};

const PHOTO_BY_STOP = {
  d2s2: {
    angle: "Stand slightly right of the main path and frame the full waterfall with dark cliff edges.",
    timing: "Late morning light keeps mist brighter and cliffs detailed.",
    settings: "24-35mm, f/8, 1/250s handheld or 1/5s on tripod for silky water.",
    exampleUrl: "https://unsplash.com/s/photos/seljalandsfoss",
  },
  d2s3: {
    angle: "Use the black-sand foreground and center the waterfall for symmetry.",
    timing: "Best before sunset for warm cliff tones.",
    settings: "16-24mm wide, f/8, 1/320s or 0.5s with ND filter.",
    exampleUrl: "https://unsplash.com/s/photos/skogafoss",
  },
  d2s3b: {
    angle: "Shoot from low in the valley to include moss walls as a natural frame.",
    timing: "Early afternoon before the valley gets too dark.",
    settings: "20-28mm, f/7.1, tripod recommended for 1/4s water motion.",
    exampleUrl: "https://unsplash.com/s/photos/kvernufoss",
  },
  d2s5: {
    angle: "Use the glacial lagoon edge or black ash ridges as leading lines to the ice tongue.",
    timing: "Overcast works great for ice texture detail.",
    settings: "24-70mm, f/8, slight underexposure (-0.3 EV) to protect highlights.",
    exampleUrl: "https://unsplash.com/s/photos/solheimajokull",
  },
  d2s6: {
    angle: "From upper lighthouse area, place the arch on a rule-of-thirds point with ocean layers.",
    timing: "Blue hour for dramatic contrast between sea and sky.",
    settings: "16-35mm, f/8, bracket 3 exposures for high dynamic range scenes.",
    exampleUrl: "https://unsplash.com/s/photos/dyrholaey",
  },
  d2s7: {
    angle: "Use basalt columns on one side and sea stacks in distance for depth.",
    timing: "Low light with wave texture, but keep safe distance from water.",
    settings: "24-35mm, f/8, 1/500s for crashing waves or 1/2s tripod for motion blur.",
    exampleUrl: "https://unsplash.com/s/photos/reynisfjara",
  },
  d3s2: {
    angle: "Shoot through Almannagja rift path to emphasize the tectonic split.",
    timing: "Midday is fine because canyon walls reduce harsh light.",
    settings: "16-24mm, f/8, expose for sky and lift shadows later.",
    exampleUrl: "https://unsplash.com/s/photos/thingvellir",
  },
  d3s3: {
    angle: "Frame Strokkur with people at edge of frame to show eruption scale.",
    timing: "Wait 2-3 cycles to predict burst rhythm.",
    settings: "35-70mm, 1/1000s, burst mode on just before eruption.",
    exampleUrl: "https://unsplash.com/s/photos/geysir-iceland",
  },
  d3s4: {
    angle: "Shoot from lower viewpoint with diagonal river bend leading to falls.",
    timing: "Cloudy conditions avoid blown highlights in white water.",
    settings: "16-24mm, f/9, CPL filter for reducing glare.",
    exampleUrl: "https://unsplash.com/s/photos/gullfoss",
  },
  d4s1: {
    angle: "Shoot from low angle near the waterline with mountains behind the sculpture.",
    timing: "Sunrise or sunset gives soft reflections on steel.",
    settings: "24-35mm, f/5.6, keep horizon level.",
    exampleUrl: "https://unsplash.com/s/photos/sun-voyager-reykjavik",
  },
  d4s3: {
    angle: "Step back to include full tower and surrounding city rooftops.",
    timing: "Blue hour for lit windows and sky color separation.",
    settings: "16-24mm, f/8, slight vertical correction in post.",
    exampleUrl: "https://unsplash.com/s/photos/hallgrimskirkja",
  },
  d4s7: {
    angle: "Use the boardwalk line to lead toward horizon steam and water.",
    timing: "Dusk for best glow and atmosphere.",
    settings: "24-35mm, f/4, ISO 800 if handheld in low light.",
    exampleUrl: "https://unsplash.com/s/photos/sky-lagoon",
  },
};

const PHOTO_BY_CATEGORY = {
  nature: {
    angle: "Use foreground textures (rocks, grass, black sand) to create depth in wide shots.",
    timing: "Golden hour or blue hour gives better contrast than flat midday light.",
    settings: "16-35mm, f/8, shoot one wide scene and one tighter detail frame.",
    exampleUrl: "https://unsplash.com/s/photos/iceland-landscape",
  },
  sightseeing: {
    angle: "Use nearby lines (roads, fences, buildings) to guide the eye toward landmarks.",
    timing: "Blue hour is usually best for city landmarks and cleaner skies.",
    settings: "24-35mm, f/5.6-f/8, keep verticals straight.",
    exampleUrl: "https://unsplash.com/s/photos/reykjavik",
  },
  aurora: {
    angle: "Place horizon in lower third and include one foreground element for scale.",
    timing: "Shoot only when cloud cover is low and KP forecast is favorable.",
    settings: "Tripod, 14-24mm, f/2.8, ISO 1600-3200, 4-10s exposure.",
    exampleUrl: "https://unsplash.com/s/photos/iceland-aurora",
  },
};

const OSMO_ACTION6_PRESETS = {
  aurora: {
    title: "Aurora preset (tripod)",
    mode: "Pro Photo · RAW + JPEG",
    settings: "ISO 800-1600 (max 3200) · Shutter 4-10s · WB 3800-4300K · EV -0.3",
    videoMode: "Pro Video · 4K 25fps · 1/25 shutter",
    videoSettings: "ISO 800-3200 · WB 3800-4300K · EV -0.7 · D-Cinelike",
    videoNotes: "Tripod only for aurora video. Turn EIS/RS OFF. Keep clips 10-20s per take.",
    notes: "Turn EIS/RS stabilization OFF on tripod. Use 2s timer or remote trigger.",
  },
  nature: {
    title: "Landscape preset",
    mode: "Pro Photo · RAW + JPEG",
    settings: "ISO 100-400 · Shutter auto or 1/200+ handheld · WB 5200K",
    notes: "Use Ultra Wide only when edges are important; Wide gives cleaner natural lines.",
  },
  sightseeing: {
    title: "City/architecture preset",
    mode: "Pro Photo · RAW + JPEG",
    settings: "ISO 100-400 · Shutter 1/160+ · WB 5000K",
    notes: "Avoid ultra-wide close to buildings to reduce distortion.",
  },
  transport: {
    title: "Drive stop preset",
    mode: "Photo",
    settings: "ISO 100-400 · Shutter auto",
    notes: "Keep horizon level and wipe lens before every quick roadside shot.",
  },
  default: {
    title: "General preset",
    mode: "Photo",
    settings: "ISO 100-800 · Shutter auto · WB auto or 5200K",
    notes: "Shoot one wide and one close detail frame per location.",
  },
};

const QUICK_COPY_PRESETS = [
  {
    id: "aurora",
    label: "🌌 Aurora",
    text: "DJI Osmo Action 6 · Aurora: Pro Photo, RAW+JPEG, ISO 800-1600 (max 3200), shutter 4-10s, WB 3800-4300K, EV -0.3, tripod + EIS/RS OFF + 2s timer.",
  },
  {
    id: "aurora-video",
    label: "🎬 Aurora Video",
    text: "DJI Osmo Action 6 · Aurora Video: Pro Video 4K/25fps, shutter 1/25, ISO 800-3200, WB 3800-4300K, EV -0.7, D-Cinelike, tripod + EIS/RS OFF, 10-20s clips.",
  },
  {
    id: "waterfall",
    label: "💧 Waterfall",
    text: "DJI Osmo Action 6 · Waterfall: Pro Photo, RAW+JPEG, ISO 100-200, shutter 1/4s to 1s on tripod for silky water (or 1/500s handheld to freeze spray), WB 5200K.",
  },
  {
    id: "city-night",
    label: "🏙️ City Night",
    text: "DJI Osmo Action 6 · City Night: Pro Photo, RAW+JPEG, ISO 400-1200, shutter 1/15s to 1/60s handheld (or 1-2s tripod), WB 4200-5000K, EV -0.3.",
  },
];

function getPhotoGuide(stop) {
  return PHOTO_BY_STOP[stop.id] || PHOTO_BY_CATEGORY[stop.category] || null;
}

const LOCATION_ALIASES = [
  ["thingvellir", "pingvellir", "thingvellir national park"],
  ["reykjavik", "reykjavik city"],
  ["vik", "vik i myrdal", "vik village"],
  ["dyrholaey", "dyrholaey lighthouse", "dyrholaey arch"],
  ["solheimajokull", "solheimajokull glacier"],
  ["grotta", "grotta lighthouse"],
  ["skogafoss", "skoga"],
  ["seljalandsfoss", "seljalandsfoss waterfall"],
  ["keflavik", "kef airport", "kef"],
  ["kopavogur", "kopavogur hotel 201"],
];

function normalizeText(v) {
  return (v || "")
    .toLowerCase()
    .replace(/þ/g, "th")
    .replace(/ð/g, "d")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function withLocationAliases(v) {
  const normalized = normalizeText(v);
  const extra = LOCATION_ALIASES
    .filter(group => group.some(term => normalized.includes(term)))
    .flat()
    .join(" ");
  return `${normalized} ${extra}`.trim();
}

function getActionCamPreset(stop) {
  if (stop.category === "aurora") return OSMO_ACTION6_PRESETS.aurora;
  return OSMO_ACTION6_PRESETS[stop.category] || OSMO_ACTION6_PRESETS.default;
}

async function copyText(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  if (typeof document !== "undefined") {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "true");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return;
  }
  throw new Error("Clipboard unavailable");
}

function Stop({ stop, checked, onToggle }) {
  const [open, setOpen] = useState(false);
  const c = CAT[stop.category] || CAT.rest;
  const photo = getPhotoGuide(stop);
  const actionPreset = getActionCamPreset(stop);
  return (
    <div style={{ border: `1px solid ${checked ? "#bbf7d0" : c.border}`, borderRadius: 12, marginBottom: 8, overflow: "hidden", background: checked ? "#f0fdf4" : c.bg, transition: "all .2s" }}>
      <div style={{ display: "flex", gap: 10, padding: "10px 12px", cursor: "pointer", alignItems: "flex-start" }} onClick={() => setOpen(o => !o)}>
        <div style={{ flexShrink: 0, paddingTop: 1 }}>
          <span style={{ fontSize: 20 }}>{stop.icon}</span>
          <p style={{ margin: "2px 0 0", fontSize: 10, color: C.muted, textAlign: "center" }}>{stop.time}</p>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: checked ? C.muted : C.text, textDecoration: checked ? "line-through" : "none" }}>{stop.name}</p>
          {stop.warning && <p style={{ margin: "0 0 3px", fontSize: 11, color: C.red, fontWeight: 600 }}>⚠️ {stop.warning}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
            {(stop.tags || []).map(t => <span key={t} style={tag("#f1f5f9", C.muted)}>{t}</span>)}
            {stop.parking && !open && (
              <span style={tag("#f1f5f9", C.muted)}>🅿️ Parking note</span>
            )}
          </div>
        </div>
        <div style={{ flexShrink: 0, display: "flex", gap: 8, alignItems: "center" }}>
          {stop.cost != null && <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>€{stop.cost}</span>}
          <div onClick={e => { e.stopPropagation(); onToggle(); }} style={{
            width: 26, height: 26, borderRadius: "50%", border: `2px solid ${checked ? C.green : "#d1d5db"}`,
            background: checked ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
          }}>
            {checked && <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>✓</span>}
          </div>
          <span style={{ color: C.muted, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${c.border}` }}>
          {stop.note && <p style={{ fontSize: 13, color: C.muted, margin: "10px 0 8px", lineHeight: 1.65 }}>{stop.note}</p>}
          {stop.walking && (
            <div style={{ background: "#ecfeff", border: `1px solid #a5f3fc`, borderRadius: 8, padding: "7px 10px", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>🚶</span>
              <p style={{ fontSize: 12, color: "#0e7490", margin: 0, fontWeight: 600 }}>{stop.walking}</p>
            </div>
          )}
          {stop.parking && (
            <div style={{ background: "#f8fafc", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>🅿️ Parking (for this stop)</p>
              <p style={{ fontSize: 12, color: C.muted, margin: "0 0 6px", lineHeight: 1.5 }}>{stop.parking}</p>
              {stop.parkingMapsUrl && (
                <a href={stop.parkingMapsUrl} target="_blank" rel="noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: "#fff", color: C.blue, borderRadius: 8, border: `1px solid ${C.glacier}`,
                  padding: "6px 12px", fontSize: 12, fontWeight: 700, textDecoration: "none",
                }}>🗺️ Open parking in Maps ↗</a>
              )}
            </div>
          )}
          {photo && (
            <div style={{ background: "#eff6ff", border: `1px solid ${C.glacier}`, borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: C.blue, margin: "0 0 6px" }}>📸 Best photo setup</p>
              <p style={{ fontSize: 12, color: C.text, margin: "0 0 4px", lineHeight: 1.55 }}><strong>Angle:</strong> {photo.angle}</p>
              <p style={{ fontSize: 12, color: C.text, margin: "0 0 4px", lineHeight: 1.55 }}><strong>Timing:</strong> {photo.timing}</p>
              <p style={{ fontSize: 12, color: C.text, margin: "0 0 7px", lineHeight: 1.55 }}><strong>Settings:</strong> {photo.settings}</p>
              {actionPreset && (
                <div style={{ background: "#fff", border: `1px solid ${C.glacier}`, borderRadius: 8, padding: "8px 10px", marginBottom: 7 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: C.blue, margin: "0 0 4px" }}>🎥 DJI Osmo Action 6 · {actionPreset.title}</p>
                  <p style={{ fontSize: 12, color: C.text, margin: "0 0 3px", lineHeight: 1.5 }}><strong>Mode:</strong> {actionPreset.mode}</p>
                  <p style={{ fontSize: 12, color: C.text, margin: "0 0 3px", lineHeight: 1.5 }}><strong>Set:</strong> {actionPreset.settings}</p>
                  {actionPreset.videoMode && <p style={{ fontSize: 12, color: C.text, margin: "0 0 3px", lineHeight: 1.5 }}><strong>Video mode:</strong> {actionPreset.videoMode}</p>}
                  {actionPreset.videoSettings && <p style={{ fontSize: 12, color: C.text, margin: "0 0 3px", lineHeight: 1.5 }}><strong>Video set:</strong> {actionPreset.videoSettings}</p>}
                  {actionPreset.videoNotes && <p style={{ fontSize: 11, color: C.muted, margin: "0 0 3px", lineHeight: 1.5 }}>{actionPreset.videoNotes}</p>}
                  <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.5 }}>{actionPreset.notes}</p>
                </div>
              )}
              {photo.exampleUrl && (
                <a href={photo.exampleUrl} target="_blank" rel="noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: "#fff", color: C.blue, borderRadius: 8, border: `1px solid ${C.glacier}`,
                  padding: "6px 12px", fontSize: 12, fontWeight: 700, textDecoration: "none",
                }}>🖼️ See example shots ↗</a>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {stop.mapsUrl && (
              <a href={stop.mapsUrl} target="_blank" rel="noreferrer" style={{ ...btn("#eff6ff", "#2563eb", { textDecoration: "none", fontSize: 12, border: "1px solid #bfdbfe" }) }}>📍 Open stop in Maps ↗</a>
            )}
            <button onClick={e => { e.stopPropagation(); onToggle(); }} style={btn(checked ? "#f0fdf4" : "#f9fafb", checked ? C.green : C.muted, { fontSize: 12, border: `1px solid ${checked ? "#bbf7d0" : "#e5e7eb"}` })}>
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
  const auroraPreset = OSMO_ACTION6_PRESETS.aurora;
  return (
    <div style={{ background: "linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)", border: `1px solid ${C.purpleDim}`, borderRadius: 14, padding: "12px 14px", marginTop: 8 }}>
      <p style={{ color: C.purple, fontWeight: 700, fontSize: 13, margin: "0 0 4px" }}>🌌 Tonight's aurora spot</p>
      <p style={{ color: C.text, fontWeight: 600, fontSize: 14, margin: "0 0 6px" }}>{spot.name}</p>
      <p style={{ color: C.muted, fontSize: 12, margin: "0 0 8px", lineHeight: 1.6 }}>{spot.note}</p>
      <div style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", marginBottom: 10, border: `1px solid ${C.purpleDim}` }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: C.purple, margin: "0 0 4px" }}>🎥 DJI Osmo Action 6 · {auroraPreset.title}</p>
        <p style={{ fontSize: 12, color: C.text, margin: "0 0 3px", lineHeight: 1.5 }}><strong>Mode:</strong> {auroraPreset.mode}</p>
        <p style={{ fontSize: 12, color: C.text, margin: "0 0 3px", lineHeight: 1.5 }}><strong>Set:</strong> {auroraPreset.settings}</p>
        <p style={{ fontSize: 12, color: C.text, margin: "0 0 3px", lineHeight: 1.5 }}><strong>Video mode:</strong> {auroraPreset.videoMode}</p>
        <p style={{ fontSize: 12, color: C.text, margin: "0 0 3px", lineHeight: 1.5 }}><strong>Video set:</strong> {auroraPreset.videoSettings}</p>
        <p style={{ fontSize: 11, color: C.muted, margin: "0 0 3px", lineHeight: 1.5 }}>{auroraPreset.videoNotes}</p>
        <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.5 }}>{auroraPreset.notes}</p>
      </div>
      {spot.parking && (
        <div style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", marginBottom: 10, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.green, margin: "0 0 3px" }}>🅿️ Parking</p>
          <p style={{ fontSize: 12, color: "#047857", margin: "0 0 6px", lineHeight: 1.5 }}>{spot.parking}</p>
          {spot.parkingMapsUrl && (
            <a href={spot.parkingMapsUrl} target="_blank" rel="noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: C.greenBg, color: C.green, borderRadius: 8,
              padding: "4px 10px", fontSize: 11, fontWeight: 700, textDecoration: "none",
            }}>🗺️ Open parking in Maps ↗</a>
          )}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {AURORA_LINKS.map(l => (
          <a key={l.url} href={l.url} target="_blank" rel="noreferrer" style={{ background: "#fff", color: C.purple, border: `1px solid ${C.purpleDim}`, borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>
            {l.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Days tab ─────────────────────────────────────────────────────────────────
const DAY_THEMES = {
  1: { emoji: "✈️", gradient: "linear-gradient(135deg, #eef2ff, #e0e7ff)" },
  2: { emoji: "🌊", gradient: "linear-gradient(135deg, #e0f2fe, #ecfdf5)" },
  3: { emoji: "🌋", gradient: "linear-gradient(135deg, #fffbeb, #fef3c7)" },
  4: { emoji: "🏙️", gradient: "linear-gradient(135deg, #fdf2f8, #fce7f3)" },
  5: { emoji: "🛫", gradient: "linear-gradient(135deg, #f0fdfa, #ccfbf1)" },
};

function ParkingHint({ stops, aurora }) {
  const parkingStops = stops.filter(s => s.parking).length;
  const total = parkingStops + (aurora?.parking ? 1 : 0);
  if (!total) return null;

  return (
    <div style={{ ...card(), padding: "10px 12px", marginBottom: 12, background: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
          🅿️ Parking details are embedded in the relevant itinerary stops below ({total} total).
        </p>
        <a href="https://www.parka.is" target="_blank" rel="noreferrer" style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: C.blue, textDecoration: "none" }}>
          Parka ↗
        </a>
      </div>
    </div>
  );
}

function DaysTab({ state, toggle }) {
  const [activeDay, setActiveDay] = useState(1);
  const [search, setSearch] = useState("");
  const [copiedPreset, setCopiedPreset] = useState("");
  const day = DAYS.find(d => d.id === activeDay);
  const stops = day?.stops || [];
  const done = stops.filter(s => state[s.id]).length;
  const route = DAILY_ROUTES[activeDay];
  const theme = DAY_THEMES[activeDay] || DAY_THEMES[1];
  const q = normalizeText(search);

  const locationMatches = q
    ? DAYS.flatMap(d => d.stops
      .filter(s => {
        const haystack = [s.name, s.note, (s.tags || []).join(" "), s.parking]
          .filter(Boolean)
          .join(" ");
        return withLocationAliases(haystack).includes(withLocationAliases(q));
      })
      .map(s => ({
        dayId: d.id,
        date: d.date,
        dayTitle: d.title,
        stopId: s.id,
        stopName: s.name,
        time: s.time,
      })))
    : [];

  const matchDays = q
    ? Array.from(new Map(locationMatches.map(m => [m.dayId, m])).values())
    : [];

  async function onCopyPreset(preset) {
    try {
      await copyText(preset.text);
      setCopiedPreset(preset.id);
      setTimeout(() => setCopiedPreset(""), 1500);
    } catch {
      setCopiedPreset("error");
      setTimeout(() => setCopiedPreset(""), 1800);
    }
  }

  return (
    <div>
      {/* Day selector */}
      <div style={{ display: "flex", gap: 6, padding: "12px 16px", overflowX: "auto", background: C.card, borderBottom: `1px solid ${C.border}`, WebkitOverflowScrolling: "touch" }}>
        {DAYS.map(d => {
          const dd = d.stops.filter(s => state[s.id]).length;
          const pct = Math.round((dd / d.stops.length) * 100);
          const active = activeDay === d.id;
          const dt = DAY_THEMES[d.id];
          return (
            <button key={d.id} onClick={() => setActiveDay(d.id)} style={{
              flexShrink: 0, padding: "10px 14px", borderRadius: 12,
              border: `2px solid ${active ? C.purple : C.border}`,
              background: active ? C.purpleBg : "#f8fafc",
              color: active ? C.purple : C.muted,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 56,
              boxShadow: active ? "0 2px 8px rgba(99,102,241,0.15)" : "none",
            }}>
              <span style={{ fontSize: 18 }}>{dt.emoji}</span>
              <span>Day {d.id}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: pct === 100 ? C.green : active ? C.purple : C.subtle }}>
                {pct === 100 ? "✓ Done" : pct > 0 ? `${pct}%` : d.date.split(" ")[1]}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ ...card(), padding: "10px 12px", marginBottom: 12 }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Find location by day
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search location (e.g., Reynisfjara, Skogafoss, Vik)"
              style={{ ...inputStyle, flex: 1 }}
            />
            {!!search.trim() && (
              <button onClick={() => setSearch("")} style={btn("#f8fafc", C.muted, { fontSize: 12, border: `1px solid ${C.border}` })}>
                Clear
              </button>
            )}
          </div>

          {!!q && (
            <div style={{ marginTop: 8 }}>
              {matchDays.length > 0 ? (
                <>
                  <p style={{ margin: "0 0 6px", fontSize: 12, color: C.text }}>
                    Found in {matchDays.length} day{matchDays.length > 1 ? "s" : ""}:
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                    {matchDays.map(m => (
                      <button
                        key={m.dayId}
                        onClick={() => setActiveDay(m.dayId)}
                        style={btn("#eef2ff", C.purple, { fontSize: 11, border: `1px solid ${C.purpleDim}`, padding: "5px 10px" })}
                      >
                        Day {m.dayId} · {m.date}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {locationMatches.slice(0, 6).map(m => (
                      <button
                        key={m.stopId}
                        onClick={() => setActiveDay(m.dayId)}
                        style={{
                          textAlign: "left",
                          background: "#f8fafc",
                          border: `1px solid ${C.border}`,
                          borderRadius: 8,
                          padding: "6px 8px",
                          color: C.text,
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        Day {m.dayId} · {m.time} · {m.stopName}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ margin: 0, fontSize: 12, color: C.red }}>No matching location found in itinerary yet.</p>
              )}
            </div>
          )}
        </div>

        <div style={{ ...card(), padding: "10px 12px", marginBottom: 12, background: "#f8fafc" }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>
            DJI one-tap presets
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {QUICK_COPY_PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => onCopyPreset(p)}
                style={btn("#eef2ff", C.purple, { fontSize: 11, border: `1px solid ${C.purpleDim}`, padding: "6px 10px" })}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p style={{ margin: "7px 0 0", fontSize: 11, color: copiedPreset === "error" ? C.red : C.muted }}>
            {copiedPreset && copiedPreset !== "error"
              ? "Copied preset to clipboard."
              : copiedPreset === "error"
                ? "Could not copy automatically on this browser."
                : "Tap any preset to copy settings and use them on camera."}
          </p>
        </div>

        {/* Day header */}
        <div style={{ ...card(), padding: "14px", marginBottom: 12, background: theme.gradient }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 600 }}>{day.date}</p>
              <h2 style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: C.text }}>{theme.emoji} {day.title}</h2>
            </div>
            <span style={{ background: "#fff", color: C.purple, borderRadius: 10, padding: "4px 10px", fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 8, border: `1px solid ${C.border}` }}>{day.badge}</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[`🚗 ${day.kmDriving} km`, `🚶 ${day.walkingKm || "—"}`, `🅿️ ~€${day.parkingEur}`, `${done}/${stops.length} stops`].map(t => (
              <span key={t} style={{ background: "#fff", color: C.muted, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 600, border: `1px solid ${C.border}` }}>{t}</span>
            ))}
            {stops.some(s => s.category === "transport" && s.icon === "⛽") && (
              <span style={{ background: C.amberBg, color: C.amber, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, border: `1px solid #fde68a` }}>⛽ Fuel stop</span>
            )}
          </div>
        </div>

        {/* Parking stays contextual to each stop */}
        <ParkingHint stops={stops} aurora={day.aurora} />

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
          <a href={WEATHER_LINKS[activeDay <= 1 ? 2 : activeDay === 2 ? 0 : activeDay === 3 ? 1 : 2].url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, background: C.blueBg, border: `1px solid ${C.glacier}`, borderRadius: 12, padding: "8px 12px", marginBottom: 12, textDecoration: "none" }}>
            <span style={{ fontSize: 18 }}>🌦️</span>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.blue }}>Check weather for today's route ↗</p>
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

  const booked = BOOKINGS.filter(b => (vals[b.confirmationKey] || "").trim().length > 0).length;

  return (
    <div style={{ padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>✅ Confirmations</h2>
        <span style={{ background: booked === BOOKINGS.length ? C.greenBg : C.purpleBg, color: booked === BOOKINGS.length ? C.green : C.purple, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, border: `1px solid ${booked === BOOKINGS.length ? C.greenDim : C.purpleDim}` }}>{booked}/{BOOKINGS.length} confirmed</span>
      </div>
      <p style={{ fontSize: 12, color: C.muted, margin: "0 0 14px", lineHeight: 1.5 }}>Add your booking reference numbers below. The green tick appears only after you save a confirmation number.</p>
      {BOOKINGS.map(b => {
        const conf = vals[b.confirmationKey] || "";
        const link = vals[b.linkKey] || "";
        const isEdit = editing === b.id;
        const isDone = conf.trim().length > 0;
        return (
          <div key={b.id} style={{ ...card(), padding: "12px 14px", marginBottom: 10, borderColor: isDone ? C.greenDim : C.border, borderWidth: isDone ? 2 : 1 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{CAT_ICON[b.category]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>{b.label}</p>
                  <span style={{ fontSize: 18 }}>{isDone ? "✅" : "⬜"}</span>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: C.muted }}>{b.detail}</p>
                {conf ? <p style={{ margin: "0 0 4px", fontSize: 12, color: C.green, fontWeight: 600 }}>📝 Ref: {conf}</p> : <p style={{ margin: "0 0 4px", fontSize: 11, color: C.subtle }}>No confirmation added yet</p>}
                {link && <a href={link.startsWith("http") ? link : "https://" + link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.blue, textDecoration: "none" }}>🔗 Open booking ↗</a>}
              </div>
            </div>
            {isEdit ? (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={conf} onChange={e => saveField(b.confirmationKey, e.target.value)}
                  placeholder="Confirmation / booking reference"
                  style={inputStyle} />
                <input value={link} onChange={e => saveField(b.linkKey, e.target.value)}
                  placeholder="Booking URL (optional)"
                  style={inputStyle} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditing(null)} style={btn(C.greenBg, C.green, { border: `1px solid ${C.greenDim}` })}>Save</button>
                  {b.url && <a href={b.url} target="_blank" rel="noreferrer" style={{ ...btn(C.blueBg, C.blue, { textDecoration: "none", border: `1px solid ${C.glacier}` }) }}>Book ↗</a>}
                </div>
              </div>
            ) : (
              <button onClick={() => setEditing(b.id)} style={{ ...btn("#f8fafc", C.purple, { marginTop: 8, fontSize: 12, border: `1px solid ${C.purpleDim}` }) }}>
                {conf ? "Edit details" : "+ Add confirmation number"}
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
        <span style={{ background: doneCt === PACK_LIST.length ? C.greenBg : C.purpleBg, color: doneCt === PACK_LIST.length ? C.green : C.purple, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, border: `1px solid ${doneCt === PACK_LIST.length ? C.greenDim : C.purpleDim}` }}>{doneCt}/{PACK_LIST.length}</span>
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
                  {packed[item.id] && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}
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

      <div style={{ ...card(), padding: "10px 14px", marginBottom: 12, background: C.redBg, borderColor: "#fecaca" }}>
        <p style={{ color: C.red, fontWeight: 700, fontSize: 13, margin: "0 0 4px" }}>⚠️ Critical daily habit</p>
        <p style={{ color: "#b91c1c", fontSize: 12, margin: 0, lineHeight: 1.6 }}>Check road.is for closures every morning before setting off. December storms can close roads within hours. If road is marked F-road or closed — do not drive it.</p>
      </div>

      <p style={{ fontSize: 12, color: C.muted, margin: "0 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em" }}>🌤 Weather by area</p>
      {WEATHER_LINKS.slice(0, 3).map(l => (
        <a key={l.url} href={l.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "flex-start", gap: 10, ...card(), padding: "10px 14px", marginBottom: 8, textDecoration: "none" }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🌦️</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.blue }}>{l.label}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{l.desc}</p>
          </div>
          <span style={{ color: C.blue, fontSize: 16, flexShrink: 0 }}>↗</span>
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
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{l.desc}</p>
          </div>
          <span style={{ color: C.purple, fontSize: 16, flexShrink: 0 }}>↗</span>
        </a>
      ))}

      <div style={{ background: C.greenBg, border: `1px solid ${C.greenDim}`, borderRadius: 12, padding: "10px 14px", marginTop: 4 }}>
        <p style={{ color: C.green, fontWeight: 700, fontSize: 12, margin: "0 0 4px" }}>🌡️ What to expect in December</p>
        <p style={{ color: "#047857", fontSize: 12, margin: 0, lineHeight: 1.7 }}>
          Temp: −5°C to +5°C · Wind: can reach 80+ km/h · Sunset: ~15:30 · Sunrise: ~11:00 · Daylight: ~4.5h · Snow: possible but not guaranteed · Ice: very likely on paths and roads
        </p>
      </div>
    </div>
  );
}

// ─── Cost / Budget tab ────────────────────────────────────────────────────────
function CostTab({ state, update }) {
  const costs = state.costs || {};
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");

  function getCost(item) {
    if (costs[item.id] !== undefined && costs[item.id] !== "") return Number(costs[item.id]) || 0;
    return item.eur;
  }

  function saveCost(id) {
    const num = parseFloat(editVal);
    const next = { ...costs, [id]: isNaN(num) ? 0 : Math.round(num * 100) / 100 };
    update("costs", next);
    setEditing(null);
  }

  function resetCost(id) {
    const next = { ...costs };
    delete next[id];
    update("costs", next);
    setEditing(null);
  }

  const total = COST_BREAKDOWN.reduce((s, i) => s + getCost(i), 0);
  const estimateTotal = COST_BREAKDOWN.reduce((s, i) => s + i.eur, 0);
  const diff = total - estimateTotal;
  const cats = [...new Set(COST_BREAKDOWN.map(i => i.category))];
  const catColors = { experience: C.purple, sightseeing: C.blue, transport: C.amber, food: C.teal, shopping: C.pink };
  const editedCount = Object.keys(costs).filter(k => costs[k] !== "" && costs[k] !== undefined).length;

  return (
    <div style={{ padding: "16px 16px 80px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: "0 0 4px" }}>💶 Budget tracker</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 14px", lineHeight: 1.5 }}>Tap any amount to update with what you actually spent. Changes save automatically.</p>
      <div style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #e0f2fe 100%)", border: `1px solid ${C.greenDim}`, borderRadius: 16, padding: "16px", marginBottom: 14, textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 13, color: C.muted, fontWeight: 600 }}>Your trip total</p>
        <p style={{ margin: "4px 0 0", fontSize: 40, fontWeight: 900, color: C.green }}>€{total.toFixed(0)}</p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: C.muted }}>
          Estimate was €{estimateTotal} · {diff === 0 ? "on budget" : diff > 0 ? `€${diff.toFixed(0)} over` : `€${Math.abs(diff).toFixed(0)} under`}
          {editedCount > 0 && ` · ${editedCount} item${editedCount > 1 ? "s" : ""} updated`}
        </p>
      </div>
      {cats.map(cat => {
        const items = COST_BREAKDOWN.filter(i => i.category === cat);
        const catTotal = items.reduce((s, i) => s + getCost(i), 0);
        const col = catColors[cat] || C.text;
        return (
          <div key={cat} style={{ ...card(), padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: col, textTransform: "capitalize" }}>{cat}</p>
              <span style={{ fontSize: 14, fontWeight: 800, color: col }}>€{catTotal.toFixed(0)}</span>
            </div>
            {items.map(item => {
              const actual = getCost(item);
              const isEdited = costs[item.id] !== undefined && costs[item.id] !== "";
              const isEditing = editing === item.id;
              return (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderTop: `1px solid ${C.border}`, gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, color: C.text, fontWeight: 600 }}>{item.label}</p>
                    <p style={{ margin: "1px 0 0", fontSize: 11, color: C.muted }}>{item.note}</p>
                    {isEdited && actual !== item.eur && (
                      <p style={{ margin: "2px 0 0", fontSize: 10, color: C.subtle }}>Was €{item.eur}</p>
                    )}
                  </div>
                  {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>€</span>
                        <input
                          type="number"
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          autoFocus
                          style={{ ...inputStyle, width: 72, textAlign: "right", padding: "6px 8px" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => saveCost(item.id)} style={btn(C.greenBg, C.green, { fontSize: 11, padding: "4px 8px" })}>Save</button>
                        {isEdited && <button onClick={() => resetCost(item.id)} style={btn("#f8fafc", C.muted, { fontSize: 11, padding: "4px 8px", border: `1px solid ${C.border}` })}>Reset</button>}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditing(item.id); setEditVal(String(actual)); }}
                      style={{
                        background: isEdited ? C.greenBg : "#f8fafc", border: `1px solid ${isEdited ? C.greenDim : C.border}`,
                        borderRadius: 8, padding: "6px 10px", cursor: "pointer", flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 800, color: C.green }}>€{actual}</span>
                      <p style={{ margin: "1px 0 0", fontSize: 9, color: C.subtle, fontWeight: 600 }}>tap to edit</p>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
      <div style={{ ...card(), padding: "10px 14px", background: C.blueBg, borderColor: C.glacier }}>
        <p style={{ fontSize: 12, color: "#0369a1", margin: 0, lineHeight: 1.7 }}>
          Excludes flights (booked separately). ISK: 1,000 ISK ≈ €7. Tap any € amount to track real spending as you go.
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
      <div style={{ background: C.blueBg, border: `1px solid ${C.glacier}`, borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.blue, margin: "0 0 8px" }}>🚗 Lotus Car Rental — Toyota Yaris Cross 4x4 Hybrid</p>
        {[
          ["Office", "Flugvellir 6, 230 Keflavík (5 min from KEF by free shuttle)"],
          ["Pickup", "Shared shuttle every 15 min · No booking needed · Exit at stop 4"],
          ["After 6pm", "Private shuttle — call +354 787 4444 (press 1) on arrival"],
          ["Fuel", "95 Unleaded petrol (hybrid — never plug in, charges itself)"],
          ["Economy", "~20–22 km/litre · Est. €80–90 total fuel for trip"],
          ["N1 chip", "Ask for N1 fuel discount chip at pickup — free, saves ISK per litre"],
          ["Fuel stops", "N1 KEF on arrival · N1 Vík on Day 2 · N1/Olis Keflavík on Day 5"],
          ["WiFi", "Free 4G WiFi included — keep device charged via car USB"],
          ["Insurance", "Zero excess · SCDW · Gravel · Sand & Ash · Tire · Animal"],
          ["Roadside", "24/7 assistance — call +354 787 4444"],
          ["Drop-off", "Return to Flugvellir 6 · Dec season open 5am–1am · Free airport shuttle"],
          ["On pickup", "Ask for N1 chip ✓ · Confirm winter tyres ✓ · Save +354 787 4444 now ✓"],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 10, padding: "6px 0", borderTop: `1px solid ${C.glacier}` }}>
            <span style={{ fontSize: 12, color: C.blue, minWidth: 72, flexShrink: 0, fontWeight: 600 }}>{l}</span>
            <span style={{ fontSize: 12, color: "#0369a1", fontWeight: 500 }}>{v}</span>
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
      <div style={{ background: C.greenBg, border: `1px solid ${C.greenDim}`, borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.green, margin: "0 0 8px" }}>🥗 Vegetarian food cheatsheet</p>
        {[
          ["Reykjavík", "Loving Hut (vegan Asian soups) · Chickpea (falafel, closed Sun) · 101 Street Food (unlimited soup)"],
          ["South Coast", "Skógafoss café (soup) · Suður-Vík in Vík (veggie soup, open noon)"],
          ["Golden Circle", "Geysir Bistro · Gullfoss Café — both have hot soup"],
          ["Budget", "Bónus supermarket (yellow pig) — Iceland's cheapest. Stock up night before road days."],
        ].map(([l, v]) => (
          <div key={l} style={{ padding: "6px 0", borderTop: `1px solid ${C.greenDim}` }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#047857" }}>{l}: </span>
            <span style={{ fontSize: 12, color: "#065f46" }}>{v}</span>
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
          style={{ width: "100%", minHeight: 100, ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
        />
      </div>

      {/* Export / Import data */}
      <div style={{ background: C.purpleBg, border: `1px solid ${C.purpleDim}`, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.purple, margin: "0 0 6px" }}>💾 Backup your data</p>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 10px", lineHeight: 1.5 }}>
          Your packing ticks, booking confirmations and notes are saved in this browser. Export before redeploying so you don't lose anything.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => {
            const data = localStorage.getItem(SK) || "{}";
            navigator.clipboard.writeText(data).then(() => alert("✅ Data copied to clipboard! Paste it somewhere safe (Notes, email).")).catch(() => {
              const el = document.createElement("textarea");
              el.value = data;
              document.body.appendChild(el);
              el.select();
              document.execCommand("copy");
              document.body.removeChild(el);
              alert("✅ Data copied! Paste it somewhere safe.");
            });
          }} style={btn(C.purpleBg, C.purple, { border: `1px solid ${C.purpleDim}`, fontSize: 12 })}>
            📋 Export data (copy)
          </button>
          <button onClick={() => {
            const input = prompt("Paste your exported data here:");
            if (!input) return;
            try {
              JSON.parse(input);
              localStorage.setItem(SK, input);
              alert("✅ Data imported! Reload the app to see your restored data.");
              window.location.reload();
            } catch {
              alert("❌ Invalid data. Make sure you paste the full exported text.");
            }
          }} style={btn("#f8fafc", C.muted, { border: `1px solid ${C.border}`, fontSize: 12 })}>
            📥 Import data (paste)
          </button>
          <button onClick={() => {
            if (confirm("⚠️ This will clear ALL your data (ticks, notes, confirmations). Are you sure?")) {
              localStorage.removeItem(SK);
              alert("Data cleared.");
              window.location.reload();
            }
          }} style={btn(C.redBg, C.red, { border: `1px solid ${C.redBg}`, fontSize: 12 })}>
            🗑️ Clear all
          </button>
        </div>
      </div>
      <div style={{ ...card(), padding: "12px 14px", background: C.redBg, borderColor: "#fecaca" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.red, margin: "0 0 8px" }}>🆘 Emergency contacts</p>
        {[
          ["Emergency", "112 (police, fire, ambulance)"],
          ["Road rescue", "1777 (Icelandic emergency hotline)"],
          ["Hotel 201", "+354 556 1100"],
          ["Safe Travel", "safetravel.is — register your trip"],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 10, padding: "5px 0", borderTop: `1px solid #fecaca` }}>
            <span style={{ fontSize: 12, color: C.red, minWidth: 80, flexShrink: 0, fontWeight: 600 }}>{l}</span>
            <span style={{ fontSize: 12, color: "#b91c1c", fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SOS Tab ─────────────────────────────────────────────────────────────────
function SosTab() {
  const sections = [
    {
      title: "🚨 Life-threatening emergency",
      color: C.red, border: "#fecaca", bg: C.redBg,
      contacts: [
        { label: "Emergency (112)", number: "112", desc: "Police · Fire · Ambulance · Mountain rescue — FREE, 24/7", primary: true },
      ],
      note: "Call 112 first for any life-threatening situation. Operators speak English.",
    },
    {
      title: "🚗 Lotus Car Rental — 24/7",
      color: C.blue, border: C.glacier, bg: C.blueBg,
      contacts: [
        { label: "Lotus 24/7 Roadside", number: "+354 787 4444", desc: "Breakdown · Lost keys · Flat tyre · Stuck vehicle · Fuel delivery", primary: true },
        { label: "Airport shuttle", number: "+354 787 4444", desc: "Press 1 after clearing customs for private shuttle after 6pm" },
        { label: "Email", number: "info@lotuscarrental.is", desc: "Non-urgent queries", noCall: true },
      ],
      note: "Lotus has service affiliates all around Iceland. Help is always close.",
    },
    {
      title: "🏨 Hotel 201",
      color: C.purple, border: C.purpleDim, bg: C.purpleBg,
      contacts: [
        { label: "Hotel 201 reception", number: "+354 556 1100", desc: "24/7 front desk · Hliðasmári 5, Kópavogur", primary: true },
      ],
      note: "Your home base. Call if you need directions, have an issue, or need help.",
    },
    {
      title: "🛣️ Road & weather emergencies",
      color: C.amber, border: "#fde68a", bg: C.amberBg,
      contacts: [
        { label: "Road emergency / rescue", number: "1777", desc: "Icelandic emergency road line — breakdown, stuck on road", primary: true },
        { label: "Vegagerðin (roads)", number: "1777", desc: "Road conditions · Closures · Weather hazards" },
      ],
      note: "Check road.is every morning. If a road is marked closed — do not drive it.",
    },
    {
      title: "🌌 Aurora & Tour",
      color: C.purple, border: C.purpleDim, bg: C.purpleBg,
      contacts: [
        { label: "Adventures.is (tour op)", number: "+354 562 7000", desc: "Your lava tunnel + northern lights tour operator", primary: false },
        { label: "Email adventures.is", number: "info@adventures.is", desc: "For tour queries / rescheduling", noCall: true },
      ],
      note: "Tour pickup is 19:30 Dec 9 from central Reykjavík. Free re-try if no aurora.",
    },
    {
      title: "🏥 Medical & safety",
      color: C.green, border: C.greenDim, bg: C.greenBg,
      contacts: [
        { label: "Emergency", number: "112", desc: "Medical emergency — ambulance", primary: true },
        { label: "NHS Direct equivalent", number: "1770", desc: "Non-emergency medical advice in Iceland" },
        { label: "Safe Travel Iceland", number: "safetravel.is", desc: "Register your trip — family can track you", noCall: true },
        { label: "Landspítali Hospital", number: "+354 543 1000", desc: "Reykjavík main hospital — Hringbraut, 101 Reykjavík" },
      ],
      note: "EHIC card covers emergency treatment in Iceland. Carry it at all times.",
    },
    {
      title: "🅿️ Parking & payment issues",
      color: C.teal, border: "#99f6e4", bg: C.tealBg,
      contacts: [
        { label: "Parka support", number: "parka.is", desc: "Parking app issues — use in-app chat", noCall: true },
        { label: "EasyPark support", number: "easypark.net", desc: "Backup parking app", noCall: true },
        { label: "Wise card support", number: "wise.com/help", desc: "Card blocked / payment issues", noCall: true },
      ],
      note: "Always choose ISK not EUR at payment terminals. Call your bank if card declined.",
    },
  ];

  return (
    <div style={{ padding: "16px 16px 80px", background: C.bg }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: "0 0 4px" }}>🆘 Emergency & Support</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 16px", lineHeight: 1.5 }}>All numbers saved here — save this page as a bookmark. Works offline once loaded.</p>

      <div style={{ ...card(), padding: "12px 14px", marginBottom: 16, background: C.redBg, borderColor: "#fecaca" }}>
        <p style={{ color: C.red, fontWeight: 800, fontSize: 16, margin: "0 0 2px" }}>🚨 112 — Main emergency number</p>
        <p style={{ color: "#b91c1c", fontSize: 12, margin: 0 }}>Police · Fire · Ambulance · Mountain rescue · Always FREE · Always answered in English</p>
        <a href="tel:112" style={{ display: "block", marginTop: 10, background: C.red, color: "#fff", borderRadius: 10, padding: "10px", textAlign: "center", textDecoration: "none", fontWeight: 800, fontSize: 16 }}>📞 Call 112 now</a>
      </div>

      {sections.map((s, si) => (
        <div key={si} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: s.color, margin: "0 0 8px" }}>{s.title}</p>
          {s.contacts.map((c, ci) => (
            <div key={ci} style={{ padding: "8px 0", borderTop: `1px solid ${s.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>{c.label}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{c.desc}</p>
                </div>
                {!c.noCall ? (
                  <a href={`tel:${c.number.replace(/\s/g, "")}`} style={{
                    background: c.primary ? s.color : "#fff",
                    border: `1px solid ${s.color}`,
                    color: c.primary ? "#fff" : s.color,
                    borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700,
                    textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap",
                  }}>📞 {c.number}</a>
                ) : (
                  <span style={{ fontSize: 11, color: s.color, fontWeight: 600, flexShrink: 0 }}>{c.number}</span>
                )}
              </div>
            </div>
          ))}
          {s.note && <p style={{ fontSize: 11, color: C.muted, margin: "8px 0 0", lineHeight: 1.5, fontStyle: "italic" }}>{s.note}</p>}
        </div>
      ))}

      <div style={{ ...card(), padding: "12px 14px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>📍 Key addresses</p>
        {[
          ["Hotel 201", "Hliðasmári 5, 200 Kópavogur"],
          ["Lotus Car Rental", "Flugvellir 6, 230 Keflavík"],
          ["KEF Airport", "Keflavíkurflugvöllur, 235 Reykjanesbær"],
          ["Landspítali Hospital", "Hringbraut, 101 Reykjavík"],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 10, padding: "6px 0", borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.muted, minWidth: 80, flexShrink: 0 }}>{l}</span>
            <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
const TABS = [
  { id: "days", icon: "📅", label: "Itinerary", short: "Days" },
  { id: "bookings", icon: "✅", label: "Confirm", short: "Refs" },
  { id: "pack", icon: "🎒", label: "Pack", short: "Pack" },
  { id: "cost", icon: "💶", label: "Budget", short: "€" },
  { id: "weather", icon: "🌦️", label: "Weather", short: "Wx" },
  { id: "info", icon: "ℹ️", label: "Info", short: "Info" },
  { id: "sos", icon: "🆘", label: "SOS", short: "SOS" },
];

function getTabBadge(tabId, state) {
  if (tabId === "bookings") {
    const vals = state.bookings || {};
    const pending = BOOKINGS.filter(b => !(vals[b.confirmationKey] || "").trim()).length;
    return pending > 0 ? pending : null;
  }
  if (tabId === "pack") {
    const packed = state.packed || {};
    const left = PACK_LIST.filter(p => !packed[p.id]).length;
    return left > 0 && left < PACK_LIST.length ? left : null;
  }
  return null;
}

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
    <div style={{ maxWidth: 480, margin: "0 auto", fontFamily: FONT, background: C.bg, minHeight: "100vh", position: "relative" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #fff 0%, #f8fafc 100%)", borderBottom: `1px solid ${C.border}`, padding: "14px 16px 10px", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: C.text, letterSpacing: "-0.02em" }}>🇮🇸 Iceland 2026</h1>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>Dec 9–13 · Hotel 201 · Yaris Cross · 2 travellers</p>
          </div>
          <div style={{ textAlign: "right", background: C.purpleBg, borderRadius: 10, padding: "6px 10px", border: `1px solid ${C.purpleDim}` }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.purple }}>{doneStops}/{allStops.length}</p>
            <p style={{ margin: "1px 0 0", fontSize: 10, color: C.muted, fontWeight: 600 }}>{pct}% explored</p>
          </div>
        </div>
        <div style={{ height: 4, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.purple}, ${C.teal})`, width: `${pct}%`, transition: "width .4s", borderRadius: 4 }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingBottom: 76 }}>
        {tab === "days" && (
          <div>
            <div style={{ padding: "12px 16px 0" }}>
              <Countdown />
              <IcelandTip />
            </div>
            <DaysTab state={state} toggle={toggle} />
          </div>
        )}
        {tab === "bookings" && <BookingsTab state={state} update={update} />}
        {tab === "pack" && <PackingTab state={state} update={update} />}
        {tab === "weather" && <WeatherTab />}
        {tab === "cost" && <CostTab state={state} update={update} />}
        {tab === "info" && <InfoTab state={state} update={update} />}
        {tab === "sos" && <SosTab />}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 100, boxShadow: "0 -2px 12px rgba(15,23,42,0.06)", paddingBottom: "env(safe-area-inset-bottom, 0)" }}>
        {TABS.map(t => {
          const active = tab === t.id;
          const badge = getTabBadge(t.id, state);
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "8px 0 10px", border: "none", background: "transparent", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative",
            }}>
              <div style={{
                background: active ? C.purpleBg : "transparent",
                borderRadius: 10, padding: "4px 10px",
                border: active ? `1px solid ${C.purpleDim}` : "1px solid transparent",
              }}>
                <span style={{ fontSize: 17 }}>{t.icon}</span>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: active ? C.purple : C.subtle, letterSpacing: ".02em" }}>{t.short}</span>
              {badge && (
                <span style={{
                  position: "absolute", top: 4, right: "50%", marginRight: -22,
                  background: C.amber, color: "#fff", borderRadius: 10,
                  fontSize: 9, fontWeight: 800, padding: "1px 5px", minWidth: 14, textAlign: "center",
                }}>{badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
