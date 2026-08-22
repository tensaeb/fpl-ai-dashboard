"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md";
  /** Wrap in a Link to href — default is "/" */
  href?: string;
  /** Render as a plain div with no link */
  noLink?: boolean;
}

export function Logo({ size = "md", href = "/", noLink = false }: LogoProps) {
  const height = size === "sm" ? 28 : 36;

  const inner = (
    <span className="flex items-center gap-2.5">
      <Image
        src="/logo/logo.svg"
        alt="FPL//AI"
        width={height}
        height={height}
        className="h-auto w-auto"
        priority
      />
      {/* <span className={`font-mono ${size === "sm" ? "text-xs" : "text-sm"} font-bold tracking-[0.22em] text-ink`}>
        FPL<span className="text-neon">//</span>AI
      </span> */}
    </span>
  );

  if (noLink) return inner;

  return (
    <Link href={href} className="flex items-center" aria-label="FPL//AI — Home">
      {inner}
    </Link>
  );
}
