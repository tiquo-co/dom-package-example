import type { Metadata } from "next";

import { EmbeddedBookingExperience } from "@/components/embedded-booking-experience";

export const metadata: Metadata = {
  title: "Service Catalog (service)",
  description:
    "Browse services in a custom interface, then complete availability and payment in Tiquo's embedded booking journey.",
};

export default function BookingEmbeddedPage() {
  return <EmbeddedBookingExperience calendarFirst />;
}
