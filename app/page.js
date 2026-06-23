"use client";

import { useEffect, useState } from "react";
import {
  TRIP_INFO,
  BOOKINGS,
  AURORA_LINKS,
  DAILY_ROUTES,
  CAFES,
  DAYS,
  COST_SUMMARY,
} from "../tripData";

const totalCost = COST_SUMMARY.breakdown.reduce((sum, item) => sum + item.amount, 0);

function getCountdown(startDate, endDate) {
  const now = new Date();
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);
  const msPerDay = 1000 * 60 * 60 * 24;

  if (now < start) {
    const days = Math.ceil((start - now) / msPerDay);
    return { status: "upcoming", days, label: days === 1 ? "day to go" : "days to go" };
  }
  if (now <= end) {
    const dayNum = Math.floor((now - start) / msPerDay) + 1;
    return { status: "active", days: dayNum, label: `Day ${dayNum} of trip` };
  }
  const daysAgo = Math.floor((now - end) / msPerDay);
  return {
    status: "past",
    days: daysAgo,
    label: daysAgo === 0 ? "Trip ended today" : daysAgo === 1 ? "day ago" : "days ago",
  };
}

export default function TripPlanner() {
  const [activeDay, setActiveDay] = useState(1);
  const [countdown, setCountdown] = useState(() =>
    getCountdown(TRIP_INFO.startDate, TRIP_INFO.endDate)
  );
  const day = DAYS.find((d) => d.id === activeDay);
  const route = DAILY_ROUTES[day.routeKey];

  useEffect(() => {
    const tick = () => setCountdown(getCountdown(TRIP_INFO.startDate, TRIP_INFO.endDate));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <main>
      <header className="hero">
        <h1>🇮🇸 Iceland Trip</h1>
        <p>{TRIP_INFO.dates} · {TRIP_INFO.travellers} travellers</p>

        <div className={`countdown countdown--${countdown.status}`}>
          <span className="countdown-number">{countdown.days}</span>
          <span className="countdown-label">
            {countdown.status === "upcoming" && countdown.label}
            {countdown.status === "active" && countdown.label}
            {countdown.status === "past" && (
              <>Trip ended · {countdown.days} {countdown.label}</>
            )}
          </span>
        </div>

        <div className="meta-grid">
          <div className="meta-card">
            <span>Hotel</span>
            {TRIP_INFO.hotel}
          </div>
          <div className="meta-card">
            <span>Car</span>
            {TRIP_INFO.car}
          </div>
          <div className="meta-card">
            <span>Breakfast</span>
            {TRIP_INFO.breakfast}
          </div>
          <div className="meta-card">
            <span>Currency</span>
            {TRIP_INFO.currency}
          </div>
        </div>
      </header>

      <section className="panel bookings-panel">
        <h2 className="section-title">Booking references</h2>
        <p className="bookings-hint">Edit values in <code>tripData.js</code> → <code>BOOKINGS</code></p>
        <div className="bookings-grid">
          {BOOKINGS.flights.map((flight) => (
            <div key={flight.route} className="booking-card">
              <span className="booking-label">✈️ Flight PNR</span>
              <span className="booking-sub">{flight.route}</span>
              <span className={`booking-value${flight.pnr ? "" : " booking-value--empty"}`}>
                {flight.pnr || "—"}
              </span>
            </div>
          ))}
          <div className="booking-card">
            <span className="booking-label">🏨 Hotel booking ID</span>
            <span className="booking-sub">{TRIP_INFO.hotel}</span>
            <span className={`booking-value${BOOKINGS.hotelBookingId ? "" : " booking-value--empty"}`}>
              {BOOKINGS.hotelBookingId || "—"}
            </span>
          </div>
          <div className="booking-card">
            <span className="booking-label">🚗 Car booking ID</span>
            <span className="booking-sub">{TRIP_INFO.car}</span>
            <span className={`booking-value${BOOKINGS.carBookingId ? "" : " booking-value--empty"}`}>
              {BOOKINGS.carBookingId || "—"}
            </span>
          </div>
        </div>
      </section>

      <nav className="day-tabs" aria-label="Trip days">
        {DAYS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`day-tab${d.id === activeDay ? " active" : ""}`}
            onClick={() => setActiveDay(d.id)}
          >
            Day {d.id}
          </button>
        ))}
      </nav>

      {day && (
        <section className="panel">
          <h2>{day.date} — {day.title}</h2>
          <span className={`badge ${day.badgeColor}`}>{day.badge}</span>
          <div className="stats">
            <span>🚗 {day.kmDriving} km driving</span>
            <span>🅿️ €{day.parkingCostEur} parking</span>
          </div>
          {route && (
            <a className="btn-link" href={route.url} target="_blank" rel="noopener noreferrer">
              {route.label} →
            </a>
          )}

          <div style={{ marginTop: "1.25rem" }}>
            {day.stops.map((stop) => (
              <article key={stop.id} className="stop">
                <div className="stop-time">{stop.time}</div>
                <div className="stop-icon">{stop.icon}</div>
                <div>
                  <h3>{stop.name}</h3>
                  <p>{stop.note}</p>
                  {stop.tags?.length > 0 && (
                    <div className="tags">
                      {stop.tags.map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  {stop.cost?.eur != null && (
                    <p style={{ margin: 0, color: "var(--accent)" }}>
                      {stop.cost.label}: €{stop.cost.eur}
                    </p>
                  )}
                  {stop.warning && <p className="warning">⚠️ {stop.warning}</p>}
                  {stop.mapsUrl && (
                    <div className="links-row">
                      <a className="btn-link" href={stop.mapsUrl} target="_blank" rel="noopener noreferrer">
                        Open in Maps
                      </a>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {day.auroraSpot && (
            <div className="aurora-box">
              <strong>🌌 {day.auroraSpot.name}</strong>
              <p style={{ margin: "0.35rem 0 0", color: "var(--muted)" }}>{day.auroraSpot.note}</p>
            </div>
          )}
        </section>
      )}

      <section className="panel">
        <h2 className="section-title">Aurora & weather links</h2>
        <div className="links-row">
          {AURORA_LINKS.map((link) => (
            <a key={link.url} className="btn-link" href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Cafés & bakeries</h2>
        <div className="cafe-grid">
          {CAFES.map((cafe) => (
            <div key={cafe.id} className="cafe-card">
              <h3>{cafe.emoji} {cafe.name}</h3>
              <p>{cafe.type} · {cafe.rating}★ ({cafe.reviews} reviews) · {cafe.price}</p>
              <p><strong>Must try:</strong> {cafe.mustTry}</p>
              <p>{cafe.note}</p>
              <p><strong>Best for:</strong> {cafe.bestDay}</p>
              <a className="btn-link" href={cafe.mapsUrl} target="_blank" rel="noopener noreferrer">
                Maps
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Cost estimate — €{totalCost} total</h2>
        <div className="cost-list">
          {COST_SUMMARY.breakdown.map((item) => (
            <div key={item.label} className="cost-row">
              <div>
                <strong>{item.label}</strong>
                <p>{item.note}</p>
              </div>
              <span className="amount">€{item.amount}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
