import type { Metadata } from "next";

import { EmbedPlaceholderPage } from "@/components/embed-placeholder-page";
import { TiquoFormWidget } from "@/components/tiquo-form-widget";

export const metadata: Metadata = {
  title: "Customer Feedback Form",
  description: "Share feedback through the Tiquo Example embedded form.",
};

export default function FormPage() {
  return (
    <EmbedPlaceholderPage
      eyebrow="Forms"
      title="Customer feedback"
      description="Share your experience and submit your feedback through the form below."
      frameTitle="Customer Feedback Form"
      className="embed-page--booking"
    >
      <TiquoFormWidget />
    </EmbedPlaceholderPage>
  );
}
