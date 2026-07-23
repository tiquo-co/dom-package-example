"use client";

import { useEffect, useRef } from "react";

const FORM_URL = "https://portal.tiquo.app/forms/z669c69ybsfb9y31";
const EMBED_URL = "https://portal.tiquo.app/forms/z669c69ybsfb9y31/embed";

export function TiquoFormWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widget = widgetRef.current;

    if (!widget) return;

    const script = document.createElement("script");
    script.src = "https://portal.tiquo.app/js/widget.js";
    script.dataset.url = EMBED_URL;
    script.dataset.title = "Customer Feedback Form";
    script.dataset.backgroundColor = "0 0% 1%";
    script.dataset.foregroundColor = "0 0% 98%";

    widget.appendChild(script);

    return () => script.remove();
  }, []);

  return (
    <div className="tiquo-widget form-widget" ref={widgetRef}>
      <div className="tiquo-widget-fallback form-widget__fallback">
        <p>
          <a href={FORM_URL} target="_blank" rel="noopener noreferrer">
            Customer Feedback Form
          </a>
        </p>
      </div>
    </div>
  );
}
