import type { Metadata } from "next";

import { EmbedPlaceholderPage } from "@/components/embed-placeholder-page";

export const metadata: Metadata = {
  title: "Form",
  description: "Complete a form through the Tiquo Example embedded experience.",
};

export default function FormPage() {
  return (
    <EmbedPlaceholderPage
      eyebrow="Forms"
      title="Form"
      description="Complete and submit the form through the embedded flow below."
      frameTitle="Form iframe"
    />
  );
}
