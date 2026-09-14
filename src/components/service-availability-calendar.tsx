"use client";

import type { TiquoFlowAvailability } from "@tiquo/dom-package";
import { useEffect, useState } from "react";
import { useTiquo } from "@/components/tiquo-provider";

export type CalendarSelection = { date: string; serviceIds: string[] };

function dateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function addDays(date: string, amount: number) {
  const result = new Date(`${date}T12:00:00`);
  result.setDate(result.getDate() + amount);
  return dateString(result);
}
function label(date: string, options: Intl.DateTimeFormatOptions) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", options);
}

type Props = {
  bookingConfigId: string;
  selection: CalendarSelection | null;
  onSelect: (selection: CalendarSelection | null) => void;
};

export function ServiceAvailabilityCalendar(props: Props) {
  const [today] = useState(() => dateString(new Date()));
  const [dateFrom, setDateFrom] = useState(today);
  const [partySize, setPartySize] = useState(1);
  const [retry, setRetry] = useState(0);
  const dateTo = addDays(dateFrom, 6);

  return (
    <section className="service-calendar" aria-label="Service availability calendar">
      <div className="service-calendar__heading">
        <div><p className="eyebrow">Availability</p><h3>Choose a date</h3><p>See which services are available for your party.</p></div>
        <label className="service-calendar__guests">Your party
          <span className="service-calendar__guest-input"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg><input aria-label="Number of guests" type="number" min="1" max="1000" step="1" value={partySize} onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isInteger(value) && value >= 1 && value <= 1000) {
              props.onSelect(null);
              setPartySize(value);
            }
          }} /><span>guests</span></span>
        </label>
      </div>
      <div className="service-calendar__navigation">
        <button type="button" aria-label="Previous week" disabled={dateFrom <= today} onClick={() => { props.onSelect(null); setDateFrom(addDays(dateFrom, -7)); }}>←</button>
        <strong>{label(dateFrom, { day: "numeric", month: "short", year: "numeric" })} – {label(dateTo, { day: "numeric", month: "short", year: "numeric" })}</strong>
        <button type="button" aria-label="Next week" onClick={() => { props.onSelect(null); setDateFrom(addDays(dateFrom, 7)); }}>→</button>
      </div>
      <AvailabilityWeek key={`${dateFrom}-${partySize}-${retry}`} {...props} dateFrom={dateFrom} dateTo={dateTo} partySize={partySize} onRetry={() => { props.onSelect(null); setRetry((value) => value + 1); }} />
    </section>
  );
}

function AvailabilityWeek({ bookingConfigId, selection, onSelect, dateFrom, dateTo, partySize, onRetry }: Props & { dateFrom: string; dateTo: string; partySize: number; onRetry: () => void }) {
  const { client, status } = useTiquo();
  const [result, setResult] = useState<TiquoFlowAvailability | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client || status === "loading" || status === "unconfigured") return;
    let active = true;
    void client.getFlowAvailability(bookingConfigId, { dateFrom, dateTo, partySize }).then((data) => {
      if (active) setResult(data);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Availability could not be loaded.");
    });
    return () => { active = false; };
  }, [client, status, bookingConfigId, dateFrom, dateTo, partySize]);

  if (status === "unconfigured") return <p role="status">Add a Tiquo public key to view availability.</p>;
  if (error) return <div role="alert"><p>{error}</p><button type="button" onClick={onRetry}>Try again</button></div>;
  if (!result) return <div role="status" className="service-calendar__loading"><span>Checking availability…</span><div className="service-calendar__days" aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <div className="service-calendar__skeleton" key={index} />)}</div></div>;

  return <>
    {result.partial && <div role="status" className="booking-embedded__notice">Some services could not be checked. Availability may be incomplete. <button type="button" onClick={onRetry}>Retry availability</button></div>}
    <div className="service-calendar__days">
      {result.days.map((day) => <button type="button" key={day.date} disabled={!day.isAvailable} aria-pressed={selection?.date === day.date} aria-label={`${label(day.date, { weekday: "long", day: "numeric", month: "long" })}: ${day.isAvailable ? `${day.serviceIds.length} services available` : result.partial ? "Availability unconfirmed" : "Unavailable"}`} onClick={() => onSelect({ date: day.date, serviceIds: day.serviceIds })}>
        <span>{label(day.date, { weekday: "short" })}</span><strong>{label(day.date, { day: "numeric" })}</strong><small>{day.isAvailable ? `${day.serviceIds.length} available` : result.partial ? "Unconfirmed" : "Unavailable"}</small>
      </button>)}
    </div>
    {!result.days.some((day) => day.isAvailable) && <p role="status">{result.partial ? "No confirmed availability yet. Retry or try another week." : "No availability for this party size this week. Try another week or change the number of guests."}</p>}
    {!selection && <p className="service-calendar__selection" role="status">Select an available date to browse services.</p>}
  </>;
}
