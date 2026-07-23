import type { Metadata } from "next";

import { EmbedPlaceholderPage } from "@/components/embed-placeholder-page";
import { TiquoOrderingWidget } from "@/components/tiquo-ordering-widget";

export const metadata: Metadata = {
  title: "Order and Pick Up",
  description: "Order ahead for pick up from Tiquo Example.",
};

export default function OrderPickUpPage() {
  return (
    <EmbedPlaceholderPage
      eyebrow="Order ahead"
      title="Order/Pick Up"
      description="Browse the menu, place an order, and choose a collection time through the ordering flow below."
      frameTitle="Order and pick-up iframe"
      className="embed-page--booking"
    >
      <TiquoOrderingWidget />
    </EmbedPlaceholderPage>
  );
}
