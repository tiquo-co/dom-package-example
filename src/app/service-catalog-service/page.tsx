import type { Metadata } from "next";
import { EmbeddedBookingExperience } from "@/components/embedded-booking-experience";

export const metadata: Metadata = {
  title: "Service Catalog (service)",
  description: "Browse the Tiquo service catalog and complete your booking.",
};

export default function ServiceCatalogServicePage() {
  return <EmbeddedBookingExperience variant="service" />;
}
