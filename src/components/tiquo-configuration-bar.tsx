"use client";

import { useTiquo } from "@/components/tiquo-provider";

export function TiquoConfigurationBar() {
  const { status } = useTiquo();

  if (status !== "unconfigured") return null;

  return (
    <div className="tiquo-configuration-bar" role="status">
      <strong>NEXT_PUBLIC_TIQUO_PUBLIC_KEY is not set.</strong>
      <span>Member login is disabled.</span>
    </div>
  );
}
