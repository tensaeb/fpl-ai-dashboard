"use client";

import { useEffect } from "react";

/**
 * Cleans up attributes injected by browser extensions (e.g. shopping/coupon
 * extensions that add `bis_skin_checked="1"` to divs) so they don't cause
 * React hydration mismatches.
 */
export function HydrationFix() {
  useEffect(() => {
    const t0 = performance.now();
    const root = document.documentElement;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    const toClean: Element[] = [];
    let node: Element | null;
    while ((node = walker.nextNode() as Element | null)) {
      if (node.hasAttribute("bis_skin_checked")) {
        toClean.push(node);
      }
    }
    for (const el of toClean) {
      el.removeAttribute("bis_skin_checked");
    }
    if (toClean.length > 0) {
      console.log(`[hydration-fix] Removed bis_skin_checked from ${toClean.length} elements in ${(performance.now() - t0).toFixed(1)}ms`);
    }
  }, []);

  return null;
}
