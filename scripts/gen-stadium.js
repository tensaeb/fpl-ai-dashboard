// One-off generator for the landing/dashboard backdrop placeholder.
// Produces a dark, stadium-toned background (grass-tinted base with a
// low cyan rim glow and faint pitch-line scribbles) as public/images/stadium.jpg.
const sharp = require("sharp");

const W = 1600;
const H = 900;

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="72%" cy="22%" r="60%">
      <stop offset="0%" stop-color="#0a5c2e" stop-opacity="0.9"/>
      <stop offset="45%" stop-color="#07173a" stop-opacity="0.85"/>
      <stop offset="75%" stop-color="#05040c" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#030209"/>
    </radialGradient>
    <linearGradient id="pitch" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#020409"/>
      <stop offset="100%" stop-color="#0a1a10"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#pitch)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)" opacity="0.6"/>
  <!-- faint seam lines across the pitch -->
  <g stroke="#17b06b" stroke-opacity="0.10" fill="none" stroke-width="2">
    ${Array.from({length: 16}, (_, i) => `<line x1="0" y1="${H * 0.35 + i * 22}" x2="${W}" y2="${H * 0.35 + i * 22}"/>`).join("")}
    ${Array.from({length: 9}, (_, i) => `<line x1="${(i + 1) * W / 10}" y1="${H * 0.35}" x2="${(i + 1) * W / 10}" y2="${H}" stroke-opacity="0.06"/>`).join("")}
  </g>
  <!-- two floodlight pools -->
  <radialGradient id="f1" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#d8fff0" stop-opacity="0.28"/>
    <stop offset="100%" stop-color="#d8fff0" stop-opacity="0"/>
  </radialGradient>
  <circle cx="${W * 0.25}" cy="${H * 0.78}" r="210" fill="url(#f1)"/>
  <circle cx="${W * 0.72}" cy="${H * 0.80}" r="230" fill="url(#f1)"/>
</svg>`;

sharp(Buffer.from(svg), { density: 144 })
  .resize(W, H)
  .modulate({ brightness: 0.72, saturation: 0.9 })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/images/stadium.jpg")
  .then(() => console.log("wrote public/images/stadium.jpg"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });