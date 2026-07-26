"use client";

import type {
  TiquoFlowService,
  TiquoFlowServiceCatalog,
} from "@tiquo/dom-package";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { useTiquo } from "@/components/tiquo-provider";

const BOOKING_CONFIGURATION_ID = "870r7rby-qn3k-dfnm-mr83axe3";

type BookingStage = "catalog" | "details" | "checkout";
type EmbedStatus = "idle" | "loading" | "ready" | "error";

const steps: Array<{ stage: BookingStage; label: string; helper: string }> = [
  { stage: "catalog", label: "Choose", helper: "Find a service" },
  { stage: "details", label: "Review", helper: "Check the details" },
  { stage: "checkout", label: "Book", helper: "Availability & payment" },
];

function getSafeImageUrl(service: TiquoFlowService, imageOverride?: string) {
  const candidate = imageOverride ?? service.image ?? service.images[0];
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
  }
}

function humanise(value?: string) {
  if (!value) return null;
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDuration(service: TiquoFlowService) {
  if (service.duration <= 0) return "Shown at booking";
  const unit = humanise(service.durationType)?.toLowerCase() ?? "minutes";
  const singularUnit = service.duration === 1 ? unit.replace(/s$/, "") : unit;
  return `${service.duration} ${singularUnit}`;
}

function formatServicePrice(service: TiquoFlowService, fallbackCurrency: string) {
  if (service.effectivePrice === 0) return "Free";
  return formatMoney(service.effectivePrice, service.currency ?? fallbackCurrency);
}

function getServiceCategory(
  service: TiquoFlowService,
  categories: TiquoFlowServiceCatalog["categories"],
) {
  return categories.find(
    (category) =>
      service.categoryIds.includes(category.id) || category.serviceIds.includes(service.id),
  );
}

function scrollToExperience(element: HTMLElement | null) {
  if (!element) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

function ServiceArtwork({
  service,
  className = "",
  contextLabel,
  image,
}: Readonly<{
  service: TiquoFlowService;
  className?: string;
  contextLabel?: string;
  image?: string;
}>) {
  const imageUrl = getSafeImageUrl(service, image);
  const artworkLabel = contextLabel ?? service.name;
  const style: CSSProperties | undefined = imageUrl
    ? { backgroundImage: `url(${JSON.stringify(imageUrl)})` }
    : undefined;

  return (
    <div
      className={`booking-embedded__artwork${imageUrl ? " has-image" : ""}${
        className ? ` ${className}` : ""
      }`}
      style={style}
      role={imageUrl ? "img" : undefined}
      aria-label={imageUrl ? `${artworkLabel} service` : undefined}
    >
      {!imageUrl && (
        <>
          <span>{artworkLabel.slice(0, 1).toUpperCase()}</span>
          <small>TIQUO EXPERIENCE</small>
        </>
      )}
    </div>
  );
}

function LoadingCatalog() {
  return (
    <div className="booking-embedded__skeleton-grid" aria-label="Loading services">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="booking-embedded__skeleton-card" key={index} aria-hidden="true">
          <div />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

export function EmbeddedBookingExperience() {
  const { client, status, track } = useTiquo();
  const experienceRef = useRef<HTMLElement>(null);
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const detailRequestRef = useRef(0);

  const [stage, setStage] = useState<BookingStage>("catalog");
  const [catalog, setCatalog] = useState<TiquoFlowServiceCatalog | null>(null);
  const [selectedService, setSelectedService] = useState<TiquoFlowService | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [detailNotice, setDetailNotice] = useState<string | null>(null);
  const [catalogReloadKey, setCatalogReloadKey] = useState(0);
  const [embedReloadKey, setEmbedReloadKey] = useState(0);
  const [embedStatus, setEmbedStatus] = useState<EmbedStatus>("idle");
  const [embedError, setEmbedError] = useState<string | null>(null);

  useEffect(() => {
    if (!client || status === "loading" || status === "unconfigured") return;

    let active = true;

    void client
      .getFlowServices(BOOKING_CONFIGURATION_ID)
      .then((nextCatalog) => {
        if (!active) return;
        setCatalog(nextCatalog);
        setCatalogError(null);
        setIsCatalogLoading(false);
        track("booking_catalog_loaded", "Booking catalog loaded", {
          bookingConfigurationId: BOOKING_CONFIGURATION_ID,
          serviceCount: nextCatalog.services.length,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setIsCatalogLoading(false);
        setCatalogError(
          error instanceof Error
            ? error.message
            : "The service catalog could not be loaded right now.",
        );
      });

    return () => {
      active = false;
    };
  }, [catalogReloadKey, client, status, track]);

  useEffect(() => {
    if (stage !== "checkout" || !client || !selectedService || !embedContainerRef.current) {
      return;
    }

    const container = embedContainerRef.current;
    let active = true;
    let iframe: HTMLIFrameElement | null = null;

    container.replaceChildren();

    void client
      .embedServiceBooking(BOOKING_CONFIGURATION_ID, selectedService.id, container, {
        width: "100%",
        minHeight: "620px",
        autoResize: true,
        onLoad: () => {
          if (active) setEmbedStatus("ready");
        },
        onError: (error) => {
          if (!active) return;
          setEmbedStatus("error");
          setEmbedError(error.message || "The secure booking step could not be loaded.");
        },
      })
      .then((nextIframe) => {
        if (!active) {
          nextIframe.remove();
          return;
        }
        iframe = nextIframe;
      })
      .catch((error: unknown) => {
        if (!active) return;
        setEmbedStatus("error");
        setEmbedError(
          error instanceof Error
            ? error.message
            : "The secure booking step could not be loaded.",
        );
      });

    return () => {
      active = false;
      iframe?.remove();
      container.replaceChildren();
    };
  }, [client, embedReloadKey, selectedService, stage]);

  const categories = useMemo(() => {
    if (!catalog) return [];
    return catalog.categories.filter((category) =>
      catalog.services.some(
        (service) =>
          service.categoryIds.includes(category.id) || category.serviceIds.includes(service.id),
      ),
    );
  }, [catalog]);

  const filteredServices = useMemo(() => {
    if (!catalog) return [];
    const normalisedQuery = query.trim().toLowerCase();

    return catalog.services.filter((service) => {
      const category = categories.find((item) => item.id === activeCategory);
      const serviceCategories = categories.filter(
        (item) =>
          service.categoryIds.includes(item.id) || item.serviceIds.includes(service.id),
      );
      const matchesCategory =
        activeCategory === "all" ||
        service.categoryIds.includes(activeCategory) ||
        Boolean(category?.serviceIds.includes(service.id));
      const matchesQuery =
        !normalisedQuery ||
        [
          service.name,
          service.shortDescription,
          service.description,
          ...service.tags,
          ...serviceCategories.map((item) => item.name),
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalisedQuery));

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, catalog, categories, query]);

  const currency = selectedService?.currency ?? catalog?.currency ?? "GBP";
  const selectedCategory = selectedService
    ? getServiceCategory(selectedService, categories)
    : undefined;
  const stageIndex = steps.findIndex((step) => step.stage === stage);
  const displayedCatalogError =
    status === "unconfigured"
      ? "Add a Tiquo public key to load this booking catalog."
      : catalogError;
  const catalogIsPending = status !== "unconfigured" && isCatalogLoading;

  const moveToStage = useCallback((nextStage: BookingStage) => {
    setStage(nextStage);
    window.requestAnimationFrame(() => scrollToExperience(experienceRef.current));
  }, []);

  const openService = useCallback(
    async (service: TiquoFlowService) => {
      const requestId = ++detailRequestRef.current;
      setSelectedService(service);
      setDetailNotice(null);
      setIsDetailLoading(true);
      moveToStage("details");
      track("booking_service_viewed", "Booking service viewed", {
        bookingConfigurationId: BOOKING_CONFIGURATION_ID,
        serviceId: service.id,
        serviceName: service.name,
      });

      if (!client) {
        setIsDetailLoading(false);
        return;
      }

      try {
        const latestService = await client.getFlowService(
          BOOKING_CONFIGURATION_ID,
          service.id,
        );
        if (requestId !== detailRequestRef.current) return;

        if (!latestService) {
          setSelectedService(null);
          setCatalogError("That service is no longer available for this booking flow.");
          moveToStage("catalog");
          return;
        }

        setSelectedService(latestService);
      } catch {
        if (requestId !== detailRequestRef.current) return;
        setDetailNotice("Live details could not be refreshed. The catalog details are shown.");
      } finally {
        if (requestId === detailRequestRef.current) setIsDetailLoading(false);
      }
    },
    [client, moveToStage, track],
  );

  const beginBooking = useCallback(() => {
    if (!selectedService) return;
    setEmbedStatus("loading");
    setEmbedError(null);
    setEmbedReloadKey((value) => value + 1);
    moveToStage("checkout");
    track("booking_service_checkout_started", "Service checkout started", {
      bookingConfigurationId: BOOKING_CONFIGURATION_ID,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
    });
  }, [moveToStage, selectedService, track]);

  return (
    <main className="booking-embedded">
      <header className="booking-embedded__hero">
        <div className="page-shell booking-embedded__hero-inner">
          <div className="booking-embedded__hero-copy">
            <p className="eyebrow">Service catalog · DOM package</p>
            <h1>
              Booking <em>Embedded</em>
            </h1>
            <p>
              Explore the live service catalog in this custom interface. Tiquo takes over only
              when it is time to choose availability, enter details and pay securely.
            </p>
          </div>
          <div className="booking-embedded__hero-note" aria-label="How this page works">
            <span>01</span>
            <p>Custom discovery</p>
            <span>02</span>
            <p>Locked service handoff</p>
            <span>03</span>
            <p>Secure booking & payment</p>
          </div>
        </div>
      </header>

      <section
        className="booking-embedded__experience"
        ref={experienceRef}
        aria-label="Booking experience"
      >
        <div className="page-shell">
          <ol className="booking-embedded__steps" aria-label="Booking progress">
            {steps.map((step, index) => (
              <li
                className={`${index === stageIndex ? "is-active" : ""}${
                  index < stageIndex ? " is-complete" : ""
                }`}
                aria-current={index === stageIndex ? "step" : undefined}
                key={step.stage}
              >
                <span>{index < stageIndex ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{step.label}</strong>
                  <small>{step.helper}</small>
                </div>
              </li>
            ))}
          </ol>

          {stage === "catalog" && (
            <div className="booking-embedded__catalog">
              <div className="booking-embedded__section-heading">
                <div>
                  <p className="eyebrow">Live availability</p>
                  <h2>{catalog?.flow.name ?? "Choose an experience"}</h2>
                </div>
                {catalog?.flow.description && <p>{catalog.flow.description}</p>}
              </div>

              {catalogIsPending ? (
                <LoadingCatalog />
              ) : displayedCatalogError ? (
                <div className="booking-embedded__state" role="alert">
                  <span>Catalog unavailable</span>
                  <h2>We couldn’t load the services.</h2>
                  <p>{displayedCatalogError}</p>
                  {status !== "unconfigured" && (
                    <button
                      type="button"
                      className="booking-embedded__button booking-embedded__button--dark"
                      onClick={() => {
                        setIsCatalogLoading(true);
                        setCatalogError(null);
                        setCatalogReloadKey((value) => value + 1);
                      }}
                    >
                      Try again <span aria-hidden="true">↗</span>
                    </button>
                  )}
                </div>
              ) : catalog ? (
                <>
                  <div className="booking-embedded__controls">
                    <div className="booking-embedded__categories" aria-label="Service categories">
                      <button
                        type="button"
                        className={activeCategory === "all" ? "is-active" : undefined}
                        aria-pressed={activeCategory === "all"}
                        onClick={() => setActiveCategory("all")}
                      >
                        All <span>{catalog.services.length}</span>
                      </button>
                      {categories.map((category) => (
                        <button
                          type="button"
                          className={activeCategory === category.id ? "is-active" : undefined}
                          aria-pressed={activeCategory === category.id}
                          onClick={() => setActiveCategory(category.id)}
                          key={category.id}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                    <label className="booking-embedded__search">
                      <span className="booking-embedded__sr-only">Search services</span>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="11" cy="11" r="6.5" />
                        <path d="m16 16 4 4" />
                      </svg>
                      <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search experiences"
                      />
                    </label>
                  </div>

                  <div className="booking-embedded__results-line" aria-live="polite">
                    <span>
                      {filteredServices.length} service{filteredServices.length === 1 ? "" : "s"}
                    </span>
                    <small>Fetched from Tiquo</small>
                  </div>

                  {filteredServices.length > 0 ? (
                    <div className="booking-embedded__service-grid">
                      {filteredServices.map((service, index) => {
                        const serviceCategory = getServiceCategory(service, categories);
                        const serviceContext = serviceCategory?.name;

                        return (
                          <article className="booking-embedded__service-card" key={service.id}>
                            <ServiceArtwork
                              service={service}
                              contextLabel={serviceContext}
                              image={serviceCategory?.image}
                            />
                            <div className="booking-embedded__service-card-body">
                              <div className="booking-embedded__badges">
                                {service.isFeatured && (
                                  <span className="is-highlighted">Featured</span>
                                )}
                                {service.tags.slice(0, 2).map((tag) => (
                                  <span key={tag}>{tag}</span>
                                ))}
                              </div>
                              <span className="booking-embedded__service-index">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              {serviceContext && (
                                <span className="booking-embedded__service-context">
                                  {serviceContext}
                                </span>
                              )}
                              <h3>{service.name}</h3>
                              <p>
                                {service.shortDescription ||
                                  service.description ||
                                  serviceCategory?.description ||
                                  "Discover this bookable experience."}
                              </p>
                              <div className="booking-embedded__service-meta">
                                <div>
                                  <small>From</small>
                                  <strong>
                                    {formatServicePrice(
                                      service,
                                      catalog.currency ?? "GBP",
                                    )}
                                  </strong>
                                </div>
                                <div>
                                  <small>Duration</small>
                                  <strong>{formatDuration(service)}</strong>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="booking-embedded__card-action"
                                onClick={() => void openService(service)}
                                aria-label={`View ${serviceContext ? `${serviceContext}: ` : ""}${
                                  service.name
                                }`}
                              >
                                View experience <span aria-hidden="true">↗</span>
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="booking-embedded__empty">
                      <span aria-hidden="true">00</span>
                      <h3>No matching experiences</h3>
                      <p>Try another search or browse all services.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setActiveCategory("all");
                        }}
                      >
                        Reset filters
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}

          {stage === "details" && selectedService && (
            <div className="booking-embedded__details">
              <button
                type="button"
                className="booking-embedded__back"
                onClick={() => moveToStage("catalog")}
              >
                <span aria-hidden="true">←</span> Back to services
              </button>

              <div className="booking-embedded__details-grid">
                <ServiceArtwork
                  service={selectedService}
                  className="booking-embedded__artwork--detail"
                  contextLabel={selectedCategory?.name}
                  image={selectedCategory?.image}
                />
                <div className="booking-embedded__details-copy">
                  <div className="booking-embedded__badges">
                    {selectedCategory && (
                      <span className="is-highlighted">{selectedCategory.name}</span>
                    )}
                    {selectedService.isFeatured && <span>Featured</span>}
                    {selectedService.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <p className="eyebrow">Selected experience</p>
                  <h2>{selectedService.name}</h2>
                  <p className="booking-embedded__details-description">
                    {selectedService.description ||
                      selectedService.shortDescription ||
                      "Everything you need for this experience is confirmed in the next step."}
                  </p>

                  {detailNotice && <p className="booking-embedded__notice">{detailNotice}</p>}

                  <dl className="booking-embedded__facts">
                    <div>
                      <dt>Price</dt>
                      <dd>{formatServicePrice(selectedService, currency)}</dd>
                    </div>
                    <div>
                      <dt>Duration</dt>
                      <dd>{formatDuration(selectedService)}</dd>
                    </div>
                    {selectedService.capacity ? (
                      <div>
                        <dt>Capacity</dt>
                        <dd>Up to {selectedService.capacity}</dd>
                      </div>
                    ) : null}
                    {selectedService.paymentType ? (
                      <div>
                        <dt>Payment</dt>
                        <dd>{humanise(selectedService.paymentType)}</dd>
                      </div>
                    ) : null}
                  </dl>

                  {selectedService.depositRequired && (
                    <p className="booking-embedded__deposit">
                      <span>Deposit</span>
                      {selectedService.depositAmount === undefined
                        ? "A deposit is required to confirm this booking."
                        : `${
                            selectedService.depositType?.toLowerCase().includes("percent")
                              ? `${selectedService.depositAmount}%`
                              : formatMoney(selectedService.depositAmount, currency)
                          } is due when you book.`}
                    </p>
                  )}

                  <button
                    type="button"
                    className="booking-embedded__button booking-embedded__button--acid"
                    onClick={beginBooking}
                    disabled={isDetailLoading}
                  >
                    {isDetailLoading ? "Checking live details…" : "Continue to availability"}
                    {!isDetailLoading && <span aria-hidden="true">↗</span>}
                  </button>
                  <small className="booking-embedded__secure-note">
                    Availability, customer details and payment continue securely with Tiquo.
                  </small>
                </div>
              </div>
            </div>
          )}

          {stage === "checkout" && selectedService && (
            <div className="booking-embedded__checkout">
              <button
                type="button"
                className="booking-embedded__back"
                onClick={() => moveToStage("details")}
              >
                <span aria-hidden="true">←</span> Back to service details
              </button>

              <div className="booking-embedded__checkout-heading">
                <div>
                  <p className="eyebrow">Secure Tiquo handoff</p>
                  <h2>Finish your booking</h2>
                  <p>
                    The service is locked in. Choose your availability, add your details and
                    complete any payment below.
                  </p>
                </div>
                <div className="booking-embedded__checkout-summary">
                  <ServiceArtwork
                    service={selectedService}
                    contextLabel={selectedCategory?.name}
                    image={selectedCategory?.image}
                  />
                  <div>
                    <small>{selectedCategory?.name ?? "Your selection"}</small>
                    <strong>{selectedService.name}</strong>
                    <span>
                      {formatDuration(selectedService)} ·{" "}
                      {formatServicePrice(selectedService, currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="booking-embedded__embed-shell">
                {embedStatus === "loading" && (
                  <div className="booking-embedded__embed-loading" role="status">
                    <span />
                    Connecting to secure booking…
                  </div>
                )}
                {embedStatus === "error" && (
                  <div className="booking-embedded__embed-error" role="alert">
                    <span>Booking unavailable</span>
                    <h3>The secure booking step didn’t load.</h3>
                    <p>{embedError}</p>
                    <button
                      type="button"
                      className="booking-embedded__button booking-embedded__button--dark"
                      onClick={() => {
                        setEmbedStatus("loading");
                        setEmbedError(null);
                        setEmbedReloadKey((value) => value + 1);
                      }}
                    >
                      Try again <span aria-hidden="true">↗</span>
                    </button>
                  </div>
                )}
                <div
                  className="booking-embedded__embed"
                  ref={embedContainerRef}
                  aria-label={`Book ${selectedService.name}`}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
