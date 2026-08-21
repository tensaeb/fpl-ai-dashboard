"use client";

import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md";
  /** Wrap in a Link to href — default is "/" */
  href?: string;
  /** Render as a plain div with no link */
  noLink?: boolean;
}

/**
 * Shared FPL//AI logo mark used across all page headers.
 * Renders the ∫ badge + wordmark consistently in one place.
 */
export function Logo({ size = "md", href = "/", noLink = false }: LogoProps) {
  const badge = size === "sm" ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm";
  const wordmark = size === "sm" ? "text-xs" : "text-sm";

  const inner = (
    <span className="flex items-center gap-2.5">
      <span
        className={`flex ${badge} items-center justify-center rounded-md bg-neon font-mono font-bold text-[#032117] shadow-neon`}
      >
        ∫
      </span>
      <span className={`font-mono ${wordmark} font-bold tracking-[0.22em] text-ink`}>
        FPL<span className="text-neon">{"//"}</span>AI
      </span>
    </span>
  );

  if (noLink) return inner;

  return (
    <Link href={href} className="flex items-center" aria-label="FPL//AI — Home">
      {inner}
    </Link>
  );
}
