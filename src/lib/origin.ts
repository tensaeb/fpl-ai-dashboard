/**
 * Public origin of the deployment. Behind a proxy (Vercel, e2b preview)
 * `new URL(req.url).origin` is the internal address (0.0.0.0), and
 * x-forwarded-proto is unreliable — public hosts are always reached over
 * HTTPS, loopback hosts over HTTP.
 */
export function requestOrigin(req: Request): string {
  if (process.env.PUBLIC_APP_URL) return process.env.PUBLIC_APP_URL.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return new URL(req.url).origin;
  if (/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(host)) return `http://${host}`;
  return `https://${host}`;
}
