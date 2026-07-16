"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/components/brand-mark";
import { useTiquo } from "@/components/tiquo-provider";

const navigation = [
  { href: "/#experiences", label: "Industries" },
  { href: "/#integration", label: "Features" },
  { href: "/booking", label: "Make a booking" },
  { href: "/order-pick-up", label: "Order/Pick Up" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { status } = useTiquo();
  const isUnconfigured = status === "unconfigured";

  return (
    <header
      className={`site-header${isUnconfigured ? " site-header--with-configuration-bar" : ""}`}
    >
      <div className="site-header__inner">
        <Link href="/" className="site-header__brand">
          <BrandMark />
        </Link>
        <nav aria-label="Primary navigation" className="site-nav">
          {navigation.map((item) => (
            <Link
              href={item.href}
              className={pathname === item.href ? "is-current" : undefined}
              aria-current={pathname === item.href ? "page" : undefined}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/profile"
          className={`account-link${pathname === "/profile" ? " is-current" : ""}`}
        >
          {status === "signed-in" ? "Profile" : "Join"}
        </Link>
      </div>
    </header>
  );
}
