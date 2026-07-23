import type { Metadata } from "next";

import { MembershipOptions } from "@/components/membership-options";

export const metadata: Metadata = {
  title: "Membership",
  description: "Choose the membership that suits you and join through Tiquo.",
};

export default function MembershipPage() {
  return <MembershipOptions />;
}
