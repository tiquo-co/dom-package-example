"use client";

import { useEffect, useRef, useState } from "react";

const MEMBERSHIP_URL =
  "https://book.tiquo.app/embed/membership/s97aqwppsarpcphrmxxj0ev3gd8ayr20";

const memberships = [
  {
    number: "01",
    name: "Social",
    price: "£35",
    cadence: "per month",
    description:
      "A relaxed way into the club, with member pricing and a lively calendar of social events.",
    benefits: ["Member rates", "Social events", "Priority news"],
    featured: false,
  },
  {
    number: "02",
    name: "All Access",
    price: "£75",
    cadence: "per month",
    description:
      "For regulars who want the full experience, with priority access and more included.",
    benefits: ["All Social benefits", "Priority booking", "Two monthly guest passes"],
    featured: true,
  },
  {
    number: "03",
    name: "Patron",
    price: "£150",
    cadence: "per month",
    description:
      "Our most considered membership, with elevated access and personal touches throughout.",
    benefits: ["All Access benefits", "Concierge support", "Four monthly guest passes"],
    featured: false,
  },
] as const;

type Membership = (typeof memberships)[number];

function MembershipWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widget = widgetRef.current;

    if (!widget) return;

    const script = document.createElement("script");
    script.src = "https://book.tiquo.app/js/widget.js";
    script.dataset.url = MEMBERSHIP_URL;
    script.dataset.title = "Loyalty Plus membership signup";
    widget.appendChild(script);

    return () => script.remove();
  }, []);

  return (
    <div className="tiquo-widget membership-widget" ref={widgetRef}>
      <div className="tiquo-widget-fallback membership-widget__fallback">
        <p>Having trouble loading the signup form?</p>
        <a href={MEMBERSHIP_URL} target="_blank" rel="noopener noreferrer">
          Join this membership
        </a>
      </div>
    </div>
  );
}

export function MembershipOptions() {
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog || !selectedMembership) return;

    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [selectedMembership]);

  const openMembership = (
    membership: Membership,
    trigger: HTMLButtonElement,
  ) => {
    triggerRef.current = trigger;
    setSelectedMembership(membership);
  };

  const closeModal = () => {
    setSelectedMembership(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <main className="membership-page">
      <section className="membership-hero" aria-labelledby="membership-heading">
        <div className="page-shell membership-hero__inner">
          <div className="membership-hero__heading">
            <p className="eyebrow">Belong to something</p>
            <h1 id="membership-heading">
              Find your
              <span>membership.</span>
            </h1>
          </div>
          <p className="membership-hero__intro">
            However you like to spend your time, there is a place for you here. Choose the
            membership that fits your rhythm.
          </p>
        </div>
      </section>

      <section className="membership-list" aria-label="Membership options">
        <div className="page-shell membership-grid">
          {memberships.map((membership) => (
            <article
              className={`membership-card${membership.featured ? " membership-card--featured" : ""}`}
              key={membership.name}
            >
              <div className="membership-card__topline">
                <span>{membership.number}</span>
                {membership.featured ? <span>Most popular</span> : <span>Membership</span>}
              </div>

              <div className="membership-card__body">
                <h2>{membership.name}</h2>
                <p>{membership.description}</p>
              </div>

              <ul className="membership-card__benefits">
                {membership.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>

              <div className="membership-card__footer">
                <p className="membership-card__price">
                  <strong>{membership.price}</strong>
                  <span>{membership.cadence}</span>
                </p>
                <button
                  type="button"
                  onClick={(event) => openMembership(membership, event.currentTarget)}
                >
                  Join
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="membership-note">
        <div className="page-shell membership-note__inner">
          <p className="eyebrow">A better way to belong</p>
          <p>Membership on your terms, with thoughtful benefits that get better over time.</p>
        </div>
      </section>

      <dialog
        className="membership-modal"
        ref={dialogRef}
        aria-labelledby="membership-modal-title"
        onCancel={(event) => {
          event.preventDefault();
          closeModal();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}
      >
        {selectedMembership ? (
          <div className="membership-modal__panel">
            <header className="membership-modal__header">
              <div>
                <p className="eyebrow">Join the club</p>
                <h2 id="membership-modal-title">{selectedMembership.name} membership</h2>
              </div>
              <button type="button" onClick={closeModal} aria-label="Close membership signup">
                <span aria-hidden="true">×</span>
              </button>
            </header>
            <div className="membership-modal__content">
              <MembershipWidget />
            </div>
          </div>
        ) : null}
      </dialog>
    </main>
  );
}
