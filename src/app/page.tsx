import Image from "next/image";

import { TrackableLink } from "@/components/trackable-link";

const capabilities = [
  ["Authentication", "Secure passwordless sign-in that lets customers access their profile without friction."],
  ["Bookings", "Let customers book any kind of service, then view upcoming and past bookings with live details, statuses, times, and services."],
  ["Orders & receipts", "Give customers a clear view of their order history, items, totals, and receipts."],
  ["Wallet Cards", "Let customers add branded Apple Wallet and Google Wallet cards linked to their profile."],
  ["Analytics", "Understand how customers interact with your site, from visits to sign-ins and actions."],
  ["Membership", "Let customers join, cancel, or upgrade their membership and display status, tiers, and benefits on their profile."],
  ["Guest management", "Invite and manage guests with a simple flow connected to the member profile."],
];

const experiences = [
  {
    title: "Restaurants, Bars and Member's Clubs",
    image: "/images/restaurants-bars.jpeg",
    alt: "A warmly lit restaurant with a green counter and pizza oven",
    href: "https://www.tiquo.co/en/industry/restaurants-bars",
  },
  {
    title: "Spas and Wellness",
    image: "/images/spas-wellness.webp",
    alt: "A calm, light-filled spa treatment room",
    href: "https://www.tiquo.co/en/industry/spas-wellness",
  },
  {
    title: "Hotels and Resorts",
    image: "/images/hotels-resorts.jpeg",
    alt: "A neutral hotel room with a large bed and seating area",
    href: "https://www.tiquo.co/en/industry/hotels-resorts",
  },
  {
    title: "Gyms and Fitness",
    image: "/images/gyms-fitness.webp",
    alt: "A warm-toned fitness studio set for a group class",
    href: "https://www.tiquo.co/en/industry/gyms-fitness",
  },
  {
    title: "Office and Co-Working Spaces",
    image: "/images/office-coworking.webp",
    alt: "A plant-filled co-working lounge with tables and sofas",
    href: "https://www.tiquo.co/en/industry/office-coworking",
  },
  {
    title: "Sports and Activity Venues",
    image: "/images/sports-activity-venues.webp",
    alt: "People training in a modern gym with weights and treadmills",
    href: "https://www.tiquo.co/en/industry/sports-activity-venues",
  },
  {
    title: "Event Spaces and Venues",
    image: "/images/event-spaces-venues.webp",
    alt: "A candlelit event dinner in a glass-roofed atrium",
    href: "https://www.tiquo.co/en/industry/event-spaces-venues",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="home-hero" aria-labelledby="hero-heading">
        <video
          className="home-hero__image"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/images/hero.mp4" type="video/mp4" />
        </video>
        <div className="home-hero__wash" />
        <div className="home-hero__content page-shell">
          <h1 id="hero-heading">
            <span>Tiquo is the</span>
            <span>operating system for</span>
            <span>the service industry</span>
          </h1>
          <div className="hero-bottom">
            <p>
              Bookings, memberships, events, dining, wellness, payments, and customer
              relationships managed through a single hospitality platform.
            </p>
            <div className="hero-actions">
              <TrackableLink
                href="#experiences"
                className="button button--light"
                event="experiences_explored"
                eventName="Experiences Explored"
              >
                Explore Industries
              </TrackableLink>
              <TrackableLink
                href="/profile"
                className="button button--ghost-light"
                event="customer_portal_opened"
                eventName="Customer Portal Opened"
              >
                Member profile
              </TrackableLink>
            </div>
          </div>
        </div>
      </section>

      <section className="manifesto" id="membership">
        <div className="page-shell manifesto__grid">
          <p className="eyebrow">DOM PACKAGE</p>
          <div>
            <h2>This is a demo of the Tiquo DOM Package</h2>
            <p className="manifesto__copy">
              The Tiquo Hosted Package allows you to provide an embedded experience for your
              members directly within your website, integrating analytics, passwordless
              authentication, access to customer profiles, orders, and bookings, Apple Wallet and
              Google Wallet passes, and seamless authentication across Tiquo-powered booking,
              membership, and guest registration iframes.
            </p>
          </div>
        </div>
      </section>

      <section className="experiences" id="experiences" aria-labelledby="experiences-heading">
        <div className="page-shell section-heading">
          <div>
            <p className="eyebrow">An integrated experience</p>
            <h2 id="experiences-heading">Experience the future of hospitality</h2>
          </div>
          <p>
            The Tiquo DOM Package allows you to provide an embedded experience for your members
            directly within your website.
          </p>
        </div>
        <div className="experience-grid page-shell">
          {experiences.map((experience, index) => (
            <article className="experience-card" key={experience.title}>
              <a
                className="experience-card__link"
                href={experience.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${experience.title} — visit Tiquo`}
              >
                <div className="experience-card__image">
                  <Image
                    src={experience.image}
                    alt={experience.alt}
                    fill
                    sizes="(max-width: 800px) 100vw, 33vw"
                  />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="experience-card__body">
                  <h3>{experience.title}</h3>
                </div>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="integration" id="integration" aria-labelledby="integration-heading">
        <div className="page-shell integration__grid">
          <div className="integration__intro">
            <p className="eyebrow">Under the surface</p>
            <h2 id="integration-heading">A real member layer</h2>
            <p>
              The customer experience is built as native React components. The Tiquo DOM
              Package handles identity, session state, analytics, and customer data behind the
              interface.
            </p>
            <a
              className="text-link"
              href="https://docs.tiquo.co/en/docs/api-reference/dom-package/overview"
              target="_blank"
              rel="noreferrer"
            >
              Read the DOM Package docs
            </a>
          </div>
          <div className="capability-list">
            {capabilities.map(([title, copy]) => (
              <article className="capability" key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer__image">
          <Image
            src="/images/strand.jpeg"
            alt="A warm restaurant interior with green counter and pizza oven"
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
          />
        </div>
        <div className="site-footer__content">
          <div>
            <h2>Experience the future of hospitality</h2>
          </div>
          <div className="footer-bottom">
            <span>DOM package example</span>
            <a href="https://www.tiquo.co/" target="_blank" rel="noreferrer">Powered by Tiquo</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
