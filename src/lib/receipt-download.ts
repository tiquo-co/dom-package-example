import type { TiquoReceipt } from "@tiquo/dom-package";

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function receiptMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(value / 100);
  } catch {
    return `${currency.toUpperCase()} ${(value / 100).toFixed(2)}`;
  }
}

function receiptDate(timestamp: number) {
  const date = new Date(timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function safeImageUrl(value?: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function receiptMarkup(receipt: TiquoReceipt) {
  const { business, customer, order } = receipt;
  const businessName = business.brandName || business.name || "Receipt";
  const logo = safeImageUrl(business.logo);
  const address = [
    business.address,
    [business.city, business.postalCode].filter(Boolean).join(" "),
    business.country,
  ].filter((line): line is string => Boolean(line));
  const paymentDetails = [
    order.paymentMethod,
    [order.cardBrand, order.cardLast4 ? `•••• ${order.cardLast4}` : undefined]
      .filter(Boolean)
      .join(" "),
  ].filter(Boolean);
  const items = order.items
    .map(
      (item) => `
        <tr>
          <td>
            <strong>${escapeHtml(item.name)}</strong>
            ${item.specialInstructions ? `<small>${escapeHtml(item.specialInstructions)}</small>` : ""}
          </td>
          <td>${escapeHtml(item.quantity)}</td>
          <td>${escapeHtml(receiptMoney(item.unitPrice, order.currency))}</td>
          <td>${escapeHtml(receiptMoney(item.total, order.currency))}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Receipt ${escapeHtml(order.orderNumber)}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #f4f2ec; color: #161815; font-family: Arial, sans-serif; }
      .receipt { width: min(760px, calc(100% - 32px)); margin: 32px auto; padding: 48px; background: #fff; }
      header { display: flex; justify-content: space-between; gap: 32px; padding-bottom: 32px; border-bottom: 2px solid #161815; }
      .logo { display: block; max-width: 140px; max-height: 52px; margin-bottom: 18px; object-fit: contain; object-position: left center; }
      .eyebrow { margin: 0 0 8px; color: #706f68; font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
      h1 { margin: 0; font-size: 28px; font-weight: 500; }
      .order-meta { text-align: right; }
      .order-meta strong { display: block; margin-bottom: 8px; font-size: 16px; }
      .order-meta span { display: block; color: #706f68; font-size: 12px; line-height: 1.6; }
      .details { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding: 28px 0; }
      .details p { margin: 0; font-size: 12px; line-height: 1.65; }
      table { width: 100%; border-collapse: collapse; }
      th { padding: 12px 8px; border-bottom: 1px solid #161815; color: #706f68; font-size: 9px; letter-spacing: .12em; text-align: right; text-transform: uppercase; }
      th:first-child, td:first-child { padding-left: 0; text-align: left; }
      td { padding: 18px 8px; border-bottom: 1px solid #dddcd6; font-size: 12px; text-align: right; vertical-align: top; }
      td strong, td small { display: block; }
      td small { margin-top: 5px; color: #706f68; font-size: 10px; }
      .totals { width: min(330px, 100%); margin: 24px 0 0 auto; }
      .totals div { display: flex; justify-content: space-between; gap: 20px; padding: 7px 0; font-size: 12px; }
      .totals .total { margin-top: 8px; padding-top: 14px; border-top: 2px solid #161815; font-size: 17px; font-weight: 700; }
      footer { margin-top: 44px; padding-top: 20px; border-top: 1px solid #dddcd6; color: #706f68; font-size: 10px; line-height: 1.65; }
      @media (max-width: 560px) {
        .receipt { width: 100%; margin: 0; padding: 28px 20px; }
        header { display: block; }
        .order-meta { margin-top: 24px; text-align: left; }
        .details { grid-template-columns: 1fr; gap: 20px; }
      }
      @media print {
        @page { margin: 16mm; }
        body { background: #fff; }
        .receipt { width: 100%; margin: 0; padding: 0; }
      }
    </style>
  </head>
  <body>
    <main class="receipt">
      <header>
        <div>
          ${logo ? `<img class="logo" src="${escapeHtml(logo)}" alt="${escapeHtml(businessName)}" />` : ""}
          <p class="eyebrow">Receipt</p>
          <h1>${escapeHtml(businessName)}</h1>
        </div>
        <div class="order-meta">
          <strong>${escapeHtml(order.orderNumber)}</strong>
          <span>${escapeHtml(receiptDate(order.createdAt))}</span>
          <span>${escapeHtml(order.status.replaceAll("_", " "))}</span>
        </div>
      </header>

      <section class="details">
        <div>
          <p class="eyebrow">From</p>
          <p>
            <strong>${escapeHtml(businessName)}</strong><br />
            ${address.map((line) => escapeHtml(line)).join("<br />")}
            ${business.email ? `<br />${escapeHtml(business.email)}` : ""}
            ${business.phone ? `<br />${escapeHtml(business.phone)}` : ""}
          </p>
        </div>
        <div>
          <p class="eyebrow">For</p>
          <p>
            <strong>${escapeHtml(customer.displayName || "Customer")}</strong>
            ${customer.email ? `<br />${escapeHtml(customer.email)}` : ""}
            <br />${escapeHtml(customer.customerNumber)}
          </p>
        </div>
      </section>

      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>${items}</tbody>
      </table>

      <section class="totals">
        <div><span>Subtotal</span><strong>${escapeHtml(receiptMoney(order.subtotal, order.currency))}</strong></div>
        ${order.discountTotal > 0 ? `<div><span>${escapeHtml(order.discountName || "Discount")}</span><strong>−${escapeHtml(receiptMoney(order.discountTotal, order.currency))}</strong></div>` : ""}
        ${order.serviceChargeAmount ? `<div><span>Service charge</span><strong>${escapeHtml(receiptMoney(order.serviceChargeAmount, order.currency))}</strong></div>` : ""}
        ${order.tipAmount ? `<div><span>Tip</span><strong>${escapeHtml(receiptMoney(order.tipAmount, order.currency))}</strong></div>` : ""}
        <div><span>Tax${order.taxSetting ? ` (${escapeHtml(order.taxSetting)})` : ""}</span><strong>${escapeHtml(receiptMoney(order.taxTotal, order.currency))}</strong></div>
        <div class="total"><span>Total</span><span>${escapeHtml(receiptMoney(order.total, order.currency))}</span></div>
        ${order.refundAmount ? `<div><span>Refunded</span><strong>−${escapeHtml(receiptMoney(order.refundAmount, order.currency))}</strong></div>` : ""}
      </section>

      <footer>
        ${paymentDetails.length ? `Paid via ${escapeHtml(paymentDetails.join(" · "))}<br />` : ""}
        ${business.vatNumber ? `VAT number: ${escapeHtml(business.vatNumber)}<br />` : ""}
        This receipt was generated from your member profile.
      </footer>
    </main>
  </body>
</html>`;
}

export function downloadReceiptFile(receipt: TiquoReceipt) {
  const blob = new Blob([receiptMarkup(receipt)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeOrderNumber = receipt.order.orderNumber.replace(/[^a-z0-9_-]+/gi, "-");

  link.href = url;
  link.download = `receipt-${safeOrderNumber || receipt.order.id}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
