import type { Metadata } from "next";

import { MemberPortal } from "@/components/member-portal";

export const metadata: Metadata = {
  title: "Member Profile",
  description: "A native Next.js customer portal powered by the Tiquo DOM Package.",
};

export default function ProfilePage() {
  return <MemberPortal />;
}
