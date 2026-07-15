"use client";

import Link from "next/link";

import { useTiquo } from "@/components/tiquo-provider";

type TrackableLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  event: string;
  eventName: string;
};

export function TrackableLink({
  href,
  children,
  className,
  event,
  eventName,
}: TrackableLinkProps) {
  const { track } = useTiquo();

  return (
    <Link href={href} className={className} onClick={() => track(event, eventName, { href })}>
      {children}
    </Link>
  );
}
