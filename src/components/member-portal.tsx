"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { BrandMark } from "@/components/brand-mark";
import { useTiquo } from "@/components/tiquo-provider";
import { downloadReceiptFile } from "@/lib/receipt-download";

type PortalTab = "overview" | "bookings" | "orders";

function SidebarIcon({ tab }: Readonly<{ tab: PortalTab }>) {
  if (tab === "overview") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
        <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
        <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
        <rect x="14" y="14" width="6.5" height="6.5" rx="1" />
      </svg>
    );
  }

  if (tab === "bookings") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 3v3M17 3v3M4 9h16" />
        <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
        <path d="M8 13h3M13 13h3M8 17h3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 8.5h11l1 12h-13l1-12Z" />
      <path d="M9 9V6.5a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2.5v7M5.25 7 8 9.75 10.75 7M3 12.5h10" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m10.75 2.75 2.5 2.5M3 13l.75-3.25 7.5-7.5 2.5 2.5-7.5 7.5L3 13Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m3.5 3.5 9 9M12.5 3.5l-9 9" />
    </svg>
  );
}

type PortalBooking = {
  id: string;
  service: string;
  category: string;
  date: Date;
  startTime: string;
  duration: number;
  status: string;
  bookingNumber: string;
  walletUrl?: string;
};

type PortalOrder = {
  id: string;
  number: string;
  date: Date;
  status: string;
  total: number;
  items: string;
  receiptAvailable: boolean;
};

type ProfileFormState = {
  firstName: string;
  lastName: string;
  phone: string;
};

type CustomerWithMembershipDates = NonNullable<
  ReturnType<typeof useTiquo>["session"]
>["customer"] & {
  createdAt?: number;
  firstActiveAt?: number;
  _creationTime?: number;
};

const emptyProfileForm: ProfileFormState = {
  firstName: "",
  lastName: "",
  phone: "",
};

function asDate(timestamp: number) {
  return new Date(timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp);
}

function earliestDate(...timestamps: Array<number | undefined>) {
  const validTimestamps = timestamps
    .filter((timestamp): timestamp is number =>
      typeof timestamp === "number" && Number.isFinite(timestamp) && timestamp > 0,
    )
    .map((timestamp) => asDate(timestamp).getTime());

  return validTimestamps.length > 0 ? new Date(Math.min(...validTimestamps)) : null;
}

function money(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    value / 100,
  );
}

function friendlyDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function memberSinceDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function AuthenticationPanel() {
  const { sendOTP, verifyOTP } = useTiquo();
  const [phase, setPhase] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await sendOTP(email.trim());
      setPhase("code");
    } catch (nextError) {
      setError(errorMessage(nextError));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await verifyOTP(email.trim(), code.trim());
    } catch (nextError) {
      setError(errorMessage(nextError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-page__visual">
        <Image
          src="/images/event-space.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 720px) 1px, 50vw"
          className="auth-page__visual-image"
        />
        <p>All your visits.<br />One profile.</p>
      </div>
      <div className="auth-page__panel">
        <div className="auth-form-wrap">
          <h1>{phase === "email" ? "Welcome back." : "Check your inbox."}</h1>
          {phase === "email" ? (
            <>
              <form onSubmit={handleSend} className="auth-form">
                <label htmlFor="member-email">Email address</label>
                <input
                  id="member-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="button button--dark" disabled={busy}>
                  {busy ? "Sending…" : "Send my sign-in code"}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="auth-intro">
                A code was sent to <strong>{email}</strong>. It expires shortly.
              </p>
              <form onSubmit={handleVerify} className="auth-form">
                <label htmlFor="member-code">Six-digit code</label>
                <input
                  id="member-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="otp-input"
                  required
                  autoFocus
                />
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="button button--dark" disabled={busy || code.length !== 6}>
                  {busy ? "Checking…" : "Open my profile"}
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => { setPhase("email"); setCode(""); setError(null); }}
                >
                  Use a different email
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export function MemberPortal() {
  const { client, session, status, logout, refreshSession, track } = useTiquo();
  const [tab, setTab] = useState<PortalTab>("overview");
  const [bookings, setBookings] = useState<PortalBooking[]>([]);
  const [orders, setOrders] = useState<PortalOrder[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [receiptLoadingIds, setReceiptLoadingIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "signed-in" || !client) return;

    let active = true;

    void Promise.resolve()
      .then(() => {
        if (!active) return Promise.reject(new Error("cancelled"));
        setDataLoading(true);
        setDataError(null);
        return Promise.all([
          client.getUpcomingBookings({ limit: 20 }),
          client.getOrders({ limit: 20 }),
        ]);
      })
      .then(([bookingResult, orderResult]) => {
        if (!active) return;
        setBookings(
          bookingResult.bookings.map((booking) => ({
            id: booking.id,
            service: booking.serviceName || "Tiquo Example booking",
            category: booking.serviceCategoryName || "Experience",
            date: asDate(booking.date),
            startTime: booking.startTime,
            duration: booking.duration,
            status: booking.status,
            bookingNumber: booking.bookingNumber,
            walletUrl:
              booking.ticketing.appleWalletTicketUrl ||
              booking.ticketing.googleWalletTicketUrl ||
              booking.ticketing.walletTicketUrl,
          })),
        );
        setOrders(
          orderResult.orders.map((order) => ({
            id: order.id,
            number: order.orderNumber,
            date: asDate(order.createdAt),
            status: order.status,
            total: order.total,
            items: `${order.items[0]?.name || "Order"}${
              order.items.length > 1 ? ` · ${order.items.length} items` : ""
            }`,
            receiptAvailable:
              order.status === "completed" ||
              order.status === "refunded" ||
              ["paid", "partial", "refunded", "partially_refunded"].includes(
                order.paymentStatus,
              ),
          })),
        );
      })
      .catch((nextError) => {
        if (active) setDataError(errorMessage(nextError));
      })
      .finally(() => {
        if (active) setDataLoading(false);
      });

    return () => {
      active = false;
    };
  }, [client, status]);

  useEffect(() => {
    if (!profileModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !profileSaving) {
        setProfileModalOpen(false);
        setProfilePhotoFile(null);
        setProfilePhotoPreview(null);
        setProfileError(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileModalOpen, profileSaving]);

  useEffect(() => {
    if (!profilePhotoPreview?.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(profilePhotoPreview);
  }, [profilePhotoPreview]);

  if (status === "unconfigured") {
    return (
      <main className="portal-unconfigured">
        <p role="alert">The Tiquo Website SDK Public Key needs to be set</p>
      </main>
    );
  }

  if (status === "loading") {
    return (
      <main className="portal-loading" aria-live="polite">
        <BrandMark />
        <span />
        <p>Opening your profile…</p>
      </main>
    );
  }

  if (status === "signed-out") return <AuthenticationPanel />;

  const visibleBookings = bookings;
  const visibleOrders = orders;
  const firstName = session?.customer?.firstName || session?.customer?.displayName || "there";
  const displayName =
    session?.customer?.displayName ||
    [session?.customer?.firstName, session?.customer?.lastName].filter(Boolean).join(" ") ||
    session?.user.email ||
    "Tiquo Example member";
  const totalSpent = session?.customer?.totalSpent;
  const customerWithMembershipDates = session?.customer as CustomerWithMembershipDates | null;
  const memberSince = earliestDate(
    customerWithMembershipDates?.firstActiveAt,
    customerWithMembershipDates?._creationTime,
    customerWithMembershipDates?.createdAt,
  );
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const profilePhoto = session?.customer?.profilePhoto?.trim() || null;

  const nextBooking = visibleBookings[0];

  function selectTab(nextTab: PortalTab) {
    setTab(nextTab);
    track("portal_section_viewed", "Portal Section Viewed", { section: nextTab });
  }

  function openProfileEditor() {
    const customer = session?.customer;

    setProfileForm({
      firstName: customer?.firstName || "",
      lastName: customer?.lastName || "",
      phone:
        customer?.phone ||
        customer?.phones?.find((phone) => phone.isPrimary)?.number ||
        customer?.phones?.[0]?.number ||
        "",
    });
    setProfilePhotoFile(null);
    setProfilePhotoPreview(customer?.profilePhoto || null);
    setProfileError(null);
    setProfileModalOpen(true);
  }

  function closeProfileEditor() {
    if (profileSaving) return;
    setProfileModalOpen(false);
    setProfilePhotoFile(null);
    setProfilePhotoPreview(null);
    setProfileError(null);
  }

  function handleProfilePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    setProfilePhotoFile(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
    setProfileError(null);
  }

  async function handleProfileSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;

    setProfileSaving(true);
    setProfileError(null);
    try {
      await client.updateProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone.trim(),
        ...(profilePhotoFile ? { profilePhoto: profilePhotoFile } : {}),
      });
      await refreshSession();
      track("profile_updated", "Profile Updated", {
        profilePhotoUpdated: Boolean(profilePhotoFile),
      });
      setProfileModalOpen(false);
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
    } catch (nextError) {
      setProfileError(errorMessage(nextError));
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleReceiptDownload(order: PortalOrder) {
    if (!client || !order.receiptAvailable) return;

    setReceiptLoadingIds((current) => new Set(current).add(order.id));
    setReceiptError(null);
    try {
      const receipt = await client.getReceipt(order.id);
      downloadReceiptFile(receipt);
      track("receipt_downloaded", "Receipt Downloaded", {
        orderId: order.id,
        orderNumber: order.number,
      });
    } catch (nextError) {
      setReceiptError(errorMessage(nextError));
    } finally {
      setReceiptLoadingIds((current) => {
        const next = new Set(current);
        next.delete(order.id);
        return next;
      });
    }
  }

  return (
    <main className="member-page">
      <div className="member-shell">
        <aside className="member-sidebar">
          <nav aria-label="Member profile sections">
            {(["overview", "bookings", "orders"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={tab === item ? "is-active" : ""}
                onClick={() => selectTab(item)}
                aria-current={tab === item ? "page" : undefined}
              >
                <span className="member-sidebar__icon">
                  <SidebarIcon tab={item} />
                </span>
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </nav>
          <div className="member-sidebar__bottom">
            <a href="mailto:hello@tiquo.co">Need help?</a>
            <button type="button" onClick={() => void logout()}>Sign out</button>
          </div>
        </aside>

        <section className="member-content">
          <header className="member-content__header">
            <div>
              {tab === "overview" && <p>Your profile, at a glance</p>}
              <h1>{tab === "overview" ? <>Good afternoon,<br /><em>{firstName}.</em></> : tab}</h1>
            </div>
            <div className="member-identity">
              <span className="member-identity__avatar">
                {profilePhoto ? (
                  <>
                    {/* Profile images are user-provided and may use any Tiquo storage host. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profilePhoto} alt={`${displayName} profile`} />
                  </>
                ) : (
                  initials
                )}
              </span>
              <span>
                <strong>{displayName}</strong>
                <small>{session?.user.email}</small>
                {session?.customer?.phone && <small>{session.customer.phone}</small>}
              </span>
              <button
                type="button"
                className="member-identity__edit"
                onClick={openProfileEditor}
                aria-label="Edit profile"
              >
                <EditIcon />
              </button>
            </div>
          </header>

          {dataError && <p className="data-error" role="alert">{dataError}</p>}

          {tab === "overview" && (
            <div className="overview-grid">
              <section className="next-visit" aria-labelledby="next-visit-heading">
                <div className="panel-heading">
                  <span>Up next</span>
                  <button type="button" onClick={() => selectTab("bookings")}>All bookings</button>
                </div>
                {dataLoading ? (
                  <div className="panel-skeleton" />
                ) : nextBooking ? (
                  <div className="next-visit__main">
                    <time dateTime={nextBooking.date.toISOString()} className="date-orb">
                      <strong>{nextBooking.date.getDate()}</strong>
                      <span>{nextBooking.date.toLocaleDateString("en-GB", { month: "short" })}</span>
                    </time>
                    <div>
                      <span>{nextBooking.category}</span>
                      <h2 id="next-visit-heading">{nextBooking.service}</h2>
                      <p>{nextBooking.startTime} · {nextBooking.duration} min · Tiquo Example</p>
                    </div>
                    <span className="booking-status">{nextBooking.status}</span>
                  </div>
                ) : (
                  <div className="empty-state"><h2 id="next-visit-heading">Nothing booked yet.</h2><p>Your next visit will appear here.</p></div>
                )}
              </section>

              <section className="member-stat stat--paper">
                <span>Total spend</span>
                <strong>{totalSpent === undefined ? "—" : money(totalSpent)}</strong>
              </section>
              <section className="member-stat stat--dark">
                <span>Member since</span>
                <strong>{memberSince ? memberSinceDate(memberSince) : "—"}</strong>
              </section>

              <section className="recent-orders">
                <div className="panel-heading">
                  <span>Recent orders</span>
                  <button type="button" onClick={() => selectTab("orders")}>View all</button>
                </div>
                <div className="orders-mini-list">
                  {visibleOrders.slice(0, 3).map((order) => (
                    <div key={order.id}>
                      <span>{order.number}</span>
                      <span>{order.items}</span>
                      <time dateTime={order.date.toISOString()}>{friendlyDate(order.date)}</time>
                      <strong>{money(order.total)}</strong>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {tab === "bookings" && (
            <section className="list-view" aria-labelledby="bookings-heading">
              <div className="list-view__heading">
                <h2 id="bookings-heading">Upcoming visits</h2>
                <span>{visibleBookings.length} bookings</span>
              </div>
              {visibleBookings.map((booking) => (
                <article className="booking-row" key={booking.id}>
                  <time dateTime={booking.date.toISOString()}>
                    <strong>{booking.date.getDate()}</strong>
                    <span>{booking.date.toLocaleDateString("en-GB", { month: "short" })}</span>
                  </time>
                  <div>
                    <span>{booking.category} · {booking.bookingNumber}</span>
                    <h3>{booking.service}</h3>
                    <p>{friendlyDate(booking.date)} · {booking.startTime} · {booking.duration} min</p>
                  </div>
                  <span className="booking-status">{booking.status}</span>
                  {booking.walletUrl ? <a href={booking.walletUrl}>Add to wallet</a> : <span className="wallet-placeholder">Wallet ready</span>}
                </article>
              ))}
            </section>
          )}

          {tab === "orders" && (
            <section className="list-view" aria-labelledby="orders-heading">
              <div className="list-view__heading">
                <h2 id="orders-heading">Order history</h2>
                <span>{visibleOrders.length} orders</span>
              </div>
              {receiptError && (
                <p className="receipt-error" role="alert">{receiptError}</p>
              )}
              <div className="orders-table" role="table" aria-label="Order history">
                <div className="orders-table__head" role="row">
                  <span>Order</span><span>Details</span><span>Date</span><span>Status</span><span>Total</span><span>Receipt</span>
                </div>
                {visibleOrders.map((order) => {
                  const isReceiptLoading = receiptLoadingIds.has(order.id);

                  return (
                    <div className="orders-table__row" role="row" key={order.id}>
                      <strong>{order.number}</strong>
                      <span>{order.items}</span>
                      <time dateTime={order.date.toISOString()}>{friendlyDate(order.date)}</time>
                      <span className="order-status">{order.status}</span>
                      <strong className="order-total">{money(order.total)}</strong>
                      {order.receiptAvailable ? (
                        <button
                          type="button"
                          className="receipt-download"
                          onClick={() => void handleReceiptDownload(order)}
                          disabled={isReceiptLoading}
                          aria-busy={isReceiptLoading}
                          aria-label={`${isReceiptLoading ? "Processing" : "Download"} receipt for order ${order.number}`}
                        >
                          {!isReceiptLoading && <DownloadIcon />}
                          {isReceiptLoading ? "Processing…" : "Receipt"}
                        </button>
                      ) : (
                        <span className="receipt-unavailable">Not available</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </section>
      </div>

      {profileModalOpen && (
        <div
          className="profile-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeProfileEditor();
          }}
        >
          <section
            className="profile-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-editor-title"
          >
            <header className="profile-modal__header">
              <div>
                <span>Member profile</span>
                <h2 id="profile-editor-title">Edit your details</h2>
              </div>
              <button
                type="button"
                onClick={closeProfileEditor}
                disabled={profileSaving}
                aria-label="Close profile editor"
              >
                <CloseIcon />
              </button>
            </header>

            <form className="profile-editor" onSubmit={handleProfileSave}>
              <div className="profile-editor__photo-row">
                <span className="member-identity__avatar profile-editor__avatar">
                  {profilePhotoPreview ? (
                    <>
                      {/* Profile images are user-provided and may use any Tiquo storage host. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={profilePhotoPreview} alt="Profile photo preview" />
                    </>
                  ) : (
                    initials
                  )}
                </span>
                <div>
                  <strong>Profile photo</strong>
                  <p>Choose a clear square image for the best result.</p>
                  <label className="profile-editor__upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      disabled={profileSaving}
                    />
                    {profilePhotoFile ? "Choose another" : "Upload photo"}
                  </label>
                  {profilePhotoFile && <small>{profilePhotoFile.name}</small>}
                </div>
              </div>

              <div className="profile-editor__fields">
                <label>
                  <span>First name</span>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    autoComplete="given-name"
                    disabled={profileSaving}
                    autoFocus
                  />
                </label>
                <label>
                  <span>Last name</span>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    autoComplete="family-name"
                    disabled={profileSaving}
                  />
                </label>
                <label>
                  <span>Email address</span>
                  <input type="email" value={session?.user.email || ""} readOnly />
                </label>
                <label>
                  <span>Phone number</span>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    autoComplete="tel"
                    placeholder="+44 7700 900000"
                    disabled={profileSaving}
                  />
                </label>
              </div>

              {profileError && (
                <p className="profile-editor__error" role="alert">{profileError}</p>
              )}

              <div className="profile-editor__actions">
                <button type="button" onClick={closeProfileEditor} disabled={profileSaving}>
                  Cancel
                </button>
                <button type="submit" disabled={profileSaving}>
                  {profileSaving ? "Saving…" : "Save profile"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
