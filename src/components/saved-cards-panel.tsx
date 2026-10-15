"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TiquoPaymentMethod } from "@tiquo/dom-package";

import { useTiquo } from "@/components/tiquo-provider";

const BRAND_NAMES: Record<string, string> = {
  amex: "American Express",
  diners: "Diners Club",
  discover: "Discover",
  jcb: "JCB",
  mastercard: "Mastercard",
  unionpay: "UnionPay",
  visa: "Visa",
};

function brandName(method: TiquoPaymentMethod) {
  if (method.kind === "direct_debit") return method.bankName || "Direct Debit";
  const brand = method.brand?.toLowerCase();
  return (brand && BRAND_NAMES[brand]) || method.brand || "Card";
}

function methodTitle(method: TiquoPaymentMethod) {
  if (method.label) return method.label;
  return method.last4 ? `${brandName(method)} ending in ${method.last4}` : brandName(method);
}

function expiryText(method: TiquoPaymentMethod) {
  if (!method.expMonth || !method.expYear) return null;
  return `${String(method.expMonth).padStart(2, "0")}/${String(method.expYear).slice(-2)}`;
}

// A card still works until its expiry month is over.
function isExpired(method: TiquoPaymentMethod) {
  if (!method.expMonth || !method.expYear) return false;
  const now = new Date();
  return (
    method.expYear < now.getFullYear() ||
    (method.expYear === now.getFullYear() && method.expMonth < now.getMonth() + 1)
  );
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function CardIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1.5" />
      <path d="M1.75 6.25h12.5M4.5 10h2" />
    </svg>
  );
}

export function SavedCardsPanel() {
  const { client, track } = useTiquo();
  const [methods, setMethods] = useState<TiquoPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(null);
  const [addingCard, setAddingCard] = useState(false);
  const cardFormRef = useRef<HTMLDivElement>(null);

  const loadMethods = useCallback(async () => {
    if (!client) return;
    try {
      const result = await client.getPaymentMethods();
      setMethods(result.paymentMethods);
      setError(null);
    } catch (nextError) {
      setError(errorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void Promise.resolve().then(loadMethods);
  }, [loadMethods]);

  // Card numbers are entered in Tiquo's Stripe form inside the iframe; this
  // page only ever receives the saved card's display details and pm_ ID.
  useEffect(() => {
    const container = cardFormRef.current;
    if (!addingCard || !client || !container) return;

    let active = true;
    let iframe: HTMLIFrameElement | null = null;

    client
      .embedCardForm(container, {
        minHeight: "360px",
        onSaved: (card) => {
          track("saved_card_added", "Saved Card Added", { brand: card.brand });
          setNotice(`${methodTitle(card)} was saved.`);
          void loadMethods();
        },
      })
      .then((frame) => {
        if (active) iframe = frame;
        else frame.remove();
      })
      .catch((nextError) => {
        if (active) setError(errorMessage(nextError));
      });

    return () => {
      active = false;
      iframe?.remove();
    };
  }, [addingCard, client, loadMethods, track]);

  async function handleMakeDefault(method: TiquoPaymentMethod) {
    if (!client) return;
    setBusyId(method.id);
    setError(null);
    setNotice(null);
    try {
      const { preservedMembershipCount } = await client.setDefaultPaymentMethod(method.id);
      track("default_card_changed", "Default Card Changed", { brand: method.brand });
      setNotice(
        preservedMembershipCount > 0
          ? `${methodTitle(method)} is now your default. ${preservedMembershipCount} active ${
              preservedMembershipCount === 1 ? "membership keeps" : "memberships keep"
            } its current card.`
          : `${methodTitle(method)} is now your default.`,
      );
      await loadMethods();
    } catch (nextError) {
      setError(errorMessage(nextError));
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(method: TiquoPaymentMethod) {
    if (!client) return;
    setBusyId(method.id);
    setError(null);
    setNotice(null);
    try {
      await client.removePaymentMethod(method.id);
      track("saved_card_removed", "Saved Card Removed", { brand: method.brand });
      setNotice(`${methodTitle(method)} was removed.`);
      await loadMethods();
    } catch (nextError) {
      setError(errorMessage(nextError));
    } finally {
      setBusyId(null);
      setConfirmingRemoveId(null);
    }
  }

  const isLastMethod = methods.length === 1;

  return (
    <section className="list-view saved-cards" aria-labelledby="cards-heading">
      <div className="list-view__heading">
        <h2 id="cards-heading">Saved cards</h2>
        {!loading && (
          <span>
            {methods.length} {methods.length === 1 ? "card" : "cards"}
          </span>
        )}
      </div>
      <p className="saved-cards__intro">
        Cards are saved securely by Tiquo. Your card number never reaches this site.
      </p>

      {error && <p className="receipt-error" role="alert">{error}</p>}
      {notice && <p className="saved-cards__notice" role="status">{notice}</p>}

      {loading ? (
        <div className="panel-skeleton" />
      ) : methods.length === 0 ? (
        <div className="empty-state saved-cards__empty">
          <h2>No saved cards yet.</h2>
          <p>Save a card to check out faster next time.</p>
        </div>
      ) : (
        <div className="saved-cards__list">
          {methods.map((method) => {
            const expired = isExpired(method);
            const expiry = expiryText(method);
            const busy = busyId === method.id;
            const confirming = confirmingRemoveId === method.id;

            return (
              <article
                className={`saved-card-row${method.isDefault ? " is-default" : ""}`}
                key={method.id}
                aria-busy={busy}
              >
                <div className="saved-card-visual" aria-hidden="true">
                  <span>{brandName(method)}</span>
                  <strong>•••• {method.last4 || "····"}</strong>
                </div>
                <div className="saved-card-row__details">
                  <span>
                    {method.kind === "direct_debit" ? "Direct Debit" : "Card"}
                    {method.cardUseType ? ` · ${method.cardUseType}` : ""}
                  </span>
                  <h3>{methodTitle(method)}</h3>
                  {expiry && (
                    <p className={expired ? "is-expired" : undefined}>
                      {expired ? `Expired ${expiry}` : `Expires ${expiry}`}
                    </p>
                  )}
                </div>
                {method.isDefault ? (
                  <span className="booking-status">Default</span>
                ) : (
                  <span />
                )}
                <div className="saved-card-row__actions">
                  {confirming ? (
                    <>
                      <button
                        type="button"
                        className="receipt-download saved-card-row__danger"
                        onClick={() => void handleRemove(method)}
                        disabled={busy}
                      >
                        {busy ? "Removing…" : "Confirm remove"}
                      </button>
                      <button
                        type="button"
                        className="saved-card-row__link"
                        onClick={() => setConfirmingRemoveId(null)}
                        disabled={busy}
                      >
                        Keep
                      </button>
                    </>
                  ) : (
                    <>
                      {!method.isDefault && !expired && (
                        <button
                          type="button"
                          className="receipt-download"
                          onClick={() => void handleMakeDefault(method)}
                          disabled={busyId !== null}
                        >
                          {busy ? "Saving…" : "Make default"}
                        </button>
                      )}
                      <button
                        type="button"
                        className="saved-card-row__link"
                        onClick={() => setConfirmingRemoveId(method.id)}
                        disabled={busyId !== null || isLastMethod}
                        title={isLastMethod ? "Your last saved card can't be removed." : undefined}
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {addingCard ? (
        <div className="saved-cards__add">
          <div className="panel-heading">
            <span>Add a card</span>
            <button type="button" onClick={() => setAddingCard(false)}>Done</button>
          </div>
          <div className="saved-cards__form" ref={cardFormRef} />
        </div>
      ) : (
        <button
          type="button"
          className="saved-cards__add-button"
          onClick={() => {
            setNotice(null);
            setAddingCard(true);
          }}
          disabled={loading}
        >
          <CardIcon />
          Add a card
        </button>
      )}
    </section>
  );
}
