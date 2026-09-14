import type { Metadata } from "next";
import { EmbeddedBookingExperience } from "@/components/embedded-booking-experience";

export const metadata: Metadata = {
  title: "Service Catalog (calendar)",
  description: "Browse the Tiquo service catalog and complete your booking.",
};

export default function ServiceCatalogCalendarPage() {
  return <EmbeddedBookingExperience variant="calendar" />;
}
