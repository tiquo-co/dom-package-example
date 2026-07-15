import type { Metadata } from "next";

import { EmbedPlaceholderPage } from "@/components/embed-placeholder-page";
import { TiquoBookingWidget } from "@/components/tiquo-booking-widget";

export const metadata: Metadata = {
  title: "Make a Booking",
  description: "Book a Tiquo Example experience.",
};

export default function BookingPage() {
  return (
    <EmbedPlaceholderPage
      eyebrow="Bookings"
      title="Make a booking"
      description="Choose an experience, date, and time through the booking flow below."
      frameTitle="Booking iframe"
      className="embed-page--booking"
    >
      <TiquoBookingWidget />
    </EmbedPlaceholderPage>
  );
}
