"use client";

import { useEffect, useRef } from "react";

const BOOKING_URL = "https://book.tiquo.app/870r7rby-qn3k-dfnm-mr83axe3";
const EMBED_URL = "https://book.tiquo.app/embed/870r7rby-qn3k-dfnm-mr83axe3";

export function TiquoBookingWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widget = widgetRef.current;

    if (!widget) return;

    const script = document.createElement("script");
    script.src = "https://book.tiquo.app/js/widget.js";
    script.dataset.url = EMBED_URL;
    script.dataset.theme = "custom-1783275102516";
    script.dataset.backgroundColor = "0 0% 5%";
    script.dataset.foregroundColor = "0 0% 98%";
    script.dataset.cardColor = "0 0% 8%";
    script.dataset.borderColor = "0 0% 15%";
    script.dataset.mutedColor = "0 0% 15%";

    widget.appendChild(script);

    return () => script.remove();
  }, []);

  return (
    <div className="tiquo-widget booking-widget" ref={widgetRef}>
      <div className="tiquo-widget-fallback booking-widget__fallback">
        <p>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer">
            Book now
          </a>
        </p>
      </div>
    </div>
  );
}
