import type { Metadata } from "next";

import { EmbedPlaceholderPage } from "@/components/embed-placeholder-page";

export const metadata: Metadata = {
  title: "Membership",
  description: "Explore membership options through the Tiquo Example embedded experience.",
};

export default function MembershipPage() {
  return (
    <EmbedPlaceholderPage
      eyebrow="Memberships"
      title="Membership"
      description="Explore membership options and join through the embedded flow below."
      frameTitle="Membership iframe"
    />
  );
}
