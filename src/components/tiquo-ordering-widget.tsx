"use client";

import { useEffect, useRef } from "react";

const ORDER_URL =
  "https://order.tiquo.app/order/order-pickup/org_3G5thXA2GA64nPMVo0podqUP9BT/px7c87pw6940dkwq5f7x9bm9bh89zybx";
const EMBED_URL =
  "https://order.tiquo.app/embed/order/order-pickup/org_3G5thXA2GA64nPMVo0podqUP9BT/px7c87pw6940dkwq5f7x9bm9bh89zybx";

export function TiquoOrderingWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widget = widgetRef.current;

    if (!widget) return;

    const script = document.createElement("script");
    script.src = "https://order.tiquo.app/js/widget.js";
    script.dataset.url = EMBED_URL;
    script.dataset.title = "Tiquo Order & Pick Up";

    widget.appendChild(script);

    return () => script.remove();
  }, []);

  return (
    <div className="tiquo-widget ordering-widget" ref={widgetRef}>
      <div className="tiquo-widget-fallback ordering-widget__fallback">
        <p>
          <a href={ORDER_URL} target="_blank" rel="noopener noreferrer">
            Order &amp; Pick Up
          </a>
        </p>
      </div>
    </div>
  );
}
