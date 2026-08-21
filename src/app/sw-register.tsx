"use client";

import { useEffect } from "react";

/**
 * Registers the FPL//AI service worker once on the client.
 * Mounted inside RootLayout — runs on every page, exactly once.
 */
export function SwRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // Check for updates every 60 minutes
        setInterval(() => reg.update(), 60 * 60 * 1000);
      })
      .catch((err) => {
        // Non-fatal — the app works fine without the SW
        console.warn("[sw] Registration failed:", err);
      });
  }, []);

  // Renders nothing — pure side-effect component
  return null;
}
