import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { apiFetch } from "../../services/Api";

/* ═══════════════════════════════════════════════════════════════════
   CLASSPULSE — MINECRAFT WORLD RANKING
   Pixel Art × Blocky Universe × School Server Championship
   100% Responsivo: mobile · tablet · desktop · totem TV vertical
   ═══════════════════════════════════════════════════════════════════ */

// ─── Paleta Minecraft ─────────────────────────────────────────────
const MC = {
  grass:       "#5D8A2E",
  grassTop:    "#7CBF3F",
  dirt:        "#8B5E3C",
  dirtDark:    "#6B4423",
  stone:       "#8E8E8E",
  stoneDark:   "#5E5E5E",
  diamond:     "#3FD4CE",
  diamondGlow: "#5FFFFA",
  emerald:     "#17DD62",
  emeraldGlow: "#00FF7A",
  gold:        "#FFD700",
  goldGlow:    "#FFEC6E",
  obsidian:    "#1A0A2E",
  sky:         "#5B88C8",
  skyDark:     "#2B4F8C",
  enchant:     "#9B59B6",
  enchantGlow: "#D35FFF",
  xpGreen:     "#7EC832",
  xpGlow:      "#AAFF44",
  heart:       "#FF3333",
};

// ─── SVG Texturas ────────────────────────────────────────────────
const DIRT_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
  <rect width='16' height='16' fill='${MC.dirt}'/>
  <rect x='0' y='0' width='2' height='2' fill='${MC.dirtDark}' opacity='0.5'/>
  <rect x='6' y='2' width='2' height='2' fill='${MC.dirtDark}' opacity='0.4'/>
  <rect x='12' y='4' width='2' height='2' fill='${MC.dirtDark}' opacity='0.5'/>
  <rect x='2' y='8' width='2' height='2' fill='${MC.dirtDark}' opacity='0.4'/>
  <rect x='10' y='10' width='2' height='2' fill='${MC.dirtDark}' opacity='0.5'/>
  <rect x='4' y='13' width='3' height='2' fill='${MC.dirtDark}' opacity='0.35'/>
  <rect x='8' y='6' width='2' height='2' fill='#B8814E' opacity='0.3'/>
</svg>`;

const STONE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
  <rect width='16' height='16' fill='${MC.stone}'/>
  <rect x='0' y='0' width='3' height='3' fill='${MC.stoneDark}' opacity='0.4'/>
  <rect x='7' y='1' width='2' height='4' fill='${MC.stoneDark}' opacity='0.3'/>
  <rect x='13' y='3' width='3' height='2' fill='${MC.stoneDark}' opacity='0.4'/>
  <rect x='1' y='9' width='4' height='2' fill='${MC.stoneDark}' opacity='0.35'/>
  <rect x='9' y='7' width='3' height='3' fill='${MC.stoneDark}' opacity='0.3'/>
  <rect x='5' y='5' width='2' height='2' fill='#ABABAB' opacity='0.5'/>
</svg>`;

const DIAMOND_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
  <rect width='16' height='16' fill='#2AAFAA'/>
  <rect x='0' y='0' width='2' height='2' fill='#1A8A85' opacity='0.7'/>
  <rect x='5' y='3' width='3' height='2' fill='#5FFFFA' opacity='0.5'/>
  <rect x='12' y='1' width='2' height='3' fill='#1A8A85' opacity='0.7'/>
  <rect x='1' y='8' width='3' height='3' fill='#5FFFFA' opacity='0.5'/>
  <rect x='9' y='6' width='2' height='4' fill='#1A8A85' opacity='0.6'/>
  <rect x='7' y='7' width='2' height='2' fill='#AFFFFF' opacity='0.8'/>
</svg>`;

const OBSIDIAN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
  <rect width='16' height='16' fill='${MC.obsidian}'/>
  <rect x='0' y='0' width='3' height='2' fill='#2D1A4A' opacity='0.8'/>
  <rect x='6' y='4' width='2' height='3' fill='#2D1A4A' opacity='0.6'/>
  <rect x='11' y='2' width='3' height='2' fill='#3A2255' opacity='0.7'/>
  <rect x='2' y='9' width='2' height='4' fill='#2D1A4A' opacity='0.6'/>
  <rect x='8' y='8' width='3' height='3' fill='#9B59B6' opacity='0.2'/>
</svg>`;

const toDataUri = (svg) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const TEXTURES = {
  dirt:     { bg: toDataUri(DIRT_SVG),     size: "32px 32px" },
  stone:    { bg: toDataUri(STONE_SVG),    size: "32px 32px" },
  diamond:  { bg: toDataUri(DIAMOND_SVG),  size: "32px 32px" },
  obsidian: { bg: toDataUri(OBSIDIAN_SVG), size: "32px 32px" },
};

// ─── CSS Global ───────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
  ::-webkit-scrollbar { width: 6px; background: #1a0a2e; }
  ::-webkit-scrollbar-thumb { background: ${MC.enchant}; }

  @keyframes floatY {
    0%,100% { transform: translateY(0) rotate(-1deg); }
    50%     { transform: translateY(-10px) rotate(1deg); }
  }
  @keyframes floatYSm {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-6px); }
  }
  @keyframes enchantGlow {
    0%,100% { box-shadow: 0 0 14px ${MC.enchant}, 0 0 28px ${MC.enchantGlow}44, inset 0 0 10px ${MC.enchant}33; }
    50%     { box-shadow: 0 0 26px ${MC.enchant}, 0 0 54px ${MC.enchantGlow}66, inset 0 0 18px ${MC.enchant}55; }
  }
  @keyframes goldGlow {
    0%,100% { box-shadow: 0 0 12px ${MC.gold}, 0 0 28px ${MC.goldGlow}55, inset 0 0 8px ${MC.gold}33; }
    50%     { box-shadow: 0 0 24px ${MC.gold}, 0 0 52px ${MC.goldGlow}88, inset 0 0 16px ${MC.gold}55; }
  }
  @keyframes diamondGlow {
    0%,100% { box-shadow: 0 0 12px ${MC.diamond}, 0 0 24px ${MC.diamondGlow}55; }
    50%     { box-shadow: 0 0 22px ${MC.diamond}, 0 0 46px ${MC.diamondGlow}88; }
  }
  @keyframes emeraldGlow {
    0%,100% { box-shadow: 0 0 10px ${MC.emerald}, 0 0 20px ${MC.emeraldGlow}44; }
    50%     { box-shadow: 0 0 20px ${MC.emerald}, 0 0 40px ${MC.emeraldGlow}77; }
  }
  @keyframes xpFill { from { width: 0%; } }
  @keyframes slideInLeft {
    from { transform: translateX(-70px); opacity: 0; filter: blur(3px); }
    to   { transform: translateX(0);     opacity: 1; filter: blur(0); }
  }
  @keyframes slideInRight {
    from { transform: translateX(70px);  opacity: 0; filter: blur(3px); }
    to   { transform: translateX(0);     opacity: 1; filter: blur(0); }
  }
  @keyframes particleFall {
    0%   { transform: translateY(-16px) rotate(0deg) scale(1); opacity: 1; }
    80%  { opacity: 0.6; }
    100% { transform: translateY(105vh) rotate(720deg) scale(0.25); opacity: 0; }
  }
  @keyframes pixelFlicker {
    0%,93%,97%,100% { opacity: 1; }
    94%,96%         { opacity: 0.7; }
  }
  @keyframes titleDrop {
    0%   { transform: translateY(-50px) scaleY(1.25); opacity: 0; letter-spacing: 12px; }
    55%  { transform: translateY(5px) scaleY(0.97);   opacity: 1; }
    75%  { transform: translateY(-2px) scaleY(1.01); }
    100% { transform: translateY(0) scaleY(1);         opacity: 1; }
  }
  @keyframes scanline {
    0%   { top: -3px; }
    100% { top: 100%; }
  }
  @keyframes liveBlip {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: 0.2; transform: scale(0.7); }
  }
  @keyframes heartbeat {
    0%,100% { transform: scale(1); }
    14%     { transform: scale(1.15); }
    28%     { transform: scale(1); }
    42%     { transform: scale(1.08); }
    56%     { transform: scale(1); }
  }
  @keyframes enchantScroll {
    from { background-position: 0 0; }
    to   { background-position: 0 64px; }
  }
  @keyframes podiumIn {
    0%   { transform: translateY(-55px) scale(0.85); opacity: 0; }
    55%  { transform: translateY(5px) scale(1.02);   opacity: 1; }
    75%  { transform: translateY(-2px) scale(0.99); }
    100% { transform: translateY(0) scale(1);         opacity: 1; }
  }
  @keyframes groundGlow {
    0%,100% { opacity: 0.6; }
    50%     { opacity: 1; }
  }
  @keyframes titleShimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes spinLoad {
    to { transform: rotate(360deg); }
  }

  .mc-row {
    transition: transform .12s steps(2), filter .14s ease, box-shadow .14s ease;
    image-rendering: pixelated;
  }
  .mc-row:hover {
    transform: translateX(5px) !important;
    filter: brightness(1.2) !important;
    box-shadow: -3px 0 0 0 currentColor !important;
  }
  button { outline: none; cursor: pointer; }
`;

// ─── Hook: viewport-aware design tokens ──────────────────────────
/*
  Modos:
    totem   → TV vertical (height ≥ 700 && width ≤ 560)
    mobile  → width < 480
    tablet  → width < 900
    desktop → todo o resto

  Cada modo expõe tokens que todos os componentes consomem
  diretamente — sem clamp() espalhado.
*/
function useViewport() {
  const [tokens, setTokens] = useState(computeTokens());

  function computeTokens() {
    if (typeof window === "undefined") return desktopTokens();
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isTotem   = h >= 700 && w <= 560;
    const isMobile  = w < 480;
    const isTablet  = w < 900;

    if (isTotem)  return totemTokens(w, h);
    if (isMobile) return mobileTokens(w);
    if (isTablet) return tabletTokens(w);
    return desktopTokens();
  }

  useLayoutEffect(() => {
    const cb = () => setTokens(computeTokens());
    cb();
    window.addEventListener("resize", cb);
    return () => window.removeEventListener("resize", cb);
  }, []);

  return tokens;
}

// ─── Token sets por contexto ──────────────────────────────────────
function totemTokens(w, h) {
  // Totem TV vertical: tudo comprimido verticalmente, maior em pixel
  // Usa escala proporcional à largura real do totem
  const scale = Math.min(w / 480, 1);
  return {
    mode: "totem",
    scale,
    outerPad: `${Math.round(6 * scale)}px ${Math.round(10 * scale)}px`,
    maxW: "100%",
    overflow: "hidden",
    // Header
    serverFontSize: Math.round(10 * scale),
    titleFontSize:  Math.round(17 * scale),
    subtitleFontSize: Math.round(13 * scale),
    grassH: Math.round(12 * scale),
    // Tabs
    tabFontSize: Math.round(7 * scale),
    tabPadV: Math.round(7 * scale),
    tabPadH: Math.round(16 * scale),
    tabGap: Math.round(8 * scale),
    tabMb: Math.round(10 * scale),
    // Podium
    podiumGap: Math.round(5 * scale),
    podiumMb: Math.round(8 * scale),
    podW0: Math.round(148 * scale),
    podW12: Math.round(124 * scale),
    avSize0: Math.round(74 * scale),
    avSize12: Math.round(62 * scale),
    nameFontSize0: Math.round(8 * scale),
    nameFontSize12: Math.round(7 * scale),
    pctFontSize0: Math.round(20 * scale),
    pctFontSize12: Math.round(16 * scale),
    badgeFontSize0: Math.round(7 * scale),
    badgeFontSize12: Math.round(6 * scale),
    badgePad0: `${Math.round(4 * scale)}px ${Math.round(12 * scale)}px`,
    badgePad12: `${Math.round(3 * scale)}px ${Math.round(10 * scale)}px`,
    podPad0: `${Math.round(12 * scale)}px ${Math.round(10 * scale)}px ${Math.round(10 * scale)}px`,
    podPad12: `${Math.round(9 * scale)}px ${Math.round(8 * scale)}px ${Math.round(8 * scale)}px`,
    podGap: Math.round(7 * scale),
    baseH: Math.round(12 * scale),
    xpBarH0: Math.round(9 * scale),
    // Rows
    rowPad: `${Math.round(4 * scale)}px ${Math.round(10 * scale)}px ${Math.round(4 * scale)}px ${Math.round(6 * scale)}px`,
    rowGap: Math.round(7 * scale),
    rowMb: Math.round(3 * scale),
    medalSize0: Math.round(34 * scale),
    medalSize4: Math.round(28 * scale),
    rowAv0: Math.round(40 * scale),
    rowAv4: Math.round(34 * scale),
    rowNameFs0: Math.round(7 * scale),
    rowNameFs4: Math.round(6 * scale),
    rowPctFs0: Math.round(19 * scale),
    rowPctFs4: Math.round(15 * scale),
    rowXpH: Math.round(6 * scale),
    rowSubFs: Math.round(10 * scale),
    // Footer
    footerPtop: Math.round(5 * scale),
    footerMtop: Math.round(4 * scale),
    liveFs: Math.round(5 * scale),
    leaderFs: Math.round(13 * scale),
    brandFs: Math.round(5 * scale),
  };
}

function mobileTokens(w) {
  return {
    mode: "mobile",
    scale: 1,
    outerPad: "8px 10px 10px",
    maxW: "100%",
    overflow: "auto",
    serverFontSize: 10,
    titleFontSize: 13,
    subtitleFontSize: 11,
    grassH: 10,
    tabFontSize: 7,
    tabPadV: 7,
    tabPadH: 14,
    tabGap: 6,
    tabMb: 10,
    podiumGap: 5,
    podiumMb: 10,
    podW0: 130,
    podW12: 108,
    avSize0: 66,
    avSize12: 54,
    nameFontSize0: 8,
    nameFontSize12: 7,
    pctFontSize0: 18,
    pctFontSize12: 14,
    badgeFontSize0: 6,
    badgeFontSize12: 5,
    badgePad0: "4px 10px",
    badgePad12: "3px 8px",
    podPad0: "12px 10px 10px",
    podPad12: "8px 8px 8px",
    podGap: 7,
    baseH: 12,
    xpBarH0: 9,
    rowPad: "4px 8px 4px 5px",
    rowGap: 6,
    rowMb: 3,
    medalSize0: 32,
    medalSize4: 26,
    rowAv0: 38,
    rowAv4: 32,
    rowNameFs0: 7,
    rowNameFs4: 6,
    rowPctFs0: 18,
    rowPctFs4: 14,
    rowXpH: 6,
    rowSubFs: 10,
    footerPtop: 6,
    footerMtop: 4,
    liveFs: 5,
    leaderFs: 12,
    brandFs: 5,
  };
}

function tabletTokens(w) {
  return {
    mode: "tablet",
    scale: 1,
    outerPad: "10px 16px 12px",
    maxW: "720px",
    overflow: "auto",
    serverFontSize: 11,
    titleFontSize: 18,
    subtitleFontSize: 13,
    grassH: 13,
    tabFontSize: 8,
    tabPadV: 8,
    tabPadH: 18,
    tabGap: 10,
    tabMb: 12,
    podiumGap: 8,
    podiumMb: 12,
    podW0: 168,
    podW12: 140,
    avSize0: 80,
    avSize12: 66,
    nameFontSize0: 9,
    nameFontSize12: 8,
    pctFontSize0: 22,
    pctFontSize12: 18,
    badgeFontSize0: 7,
    badgeFontSize12: 6,
    badgePad0: "5px 14px",
    badgePad12: "4px 12px",
    podPad0: "14px 12px 12px",
    podPad12: "10px 10px 10px",
    podGap: 8,
    baseH: 14,
    xpBarH0: 10,
    rowPad: "5px 12px 5px 7px",
    rowGap: 8,
    rowMb: 4,
    medalSize0: 38,
    medalSize4: 30,
    rowAv0: 46,
    rowAv4: 38,
    rowNameFs0: 8,
    rowNameFs4: 7,
    rowPctFs0: 22,
    rowPctFs4: 17,
    rowXpH: 7,
    rowSubFs: 11,
    footerPtop: 7,
    footerMtop: 5,
    liveFs: 6,
    leaderFs: 14,
    brandFs: 6,
  };
}

function desktopTokens() {
  return {
    mode: "desktop",
    scale: 1,
    outerPad: "14px 24px 14px",
    maxW: "900px",
    overflow: "auto",
    serverFontSize: 13,
    titleFontSize: 24,
    subtitleFontSize: 15,
    grassH: 16,
    tabFontSize: 9,
    tabPadV: 10,
    tabPadH: 22,
    tabGap: 12,
    tabMb: 16,
    podiumGap: 12,
    podiumMb: 14,
    podW0: 198,
    podW12: 168,
    avSize0: 96,
    avSize12: 80,
    nameFontSize0: 11,
    nameFontSize12: 9,
    pctFontSize0: 28,
    pctFontSize12: 22,
    badgeFontSize0: 9,
    badgeFontSize12: 7,
    badgePad0: "6px 18px",
    badgePad12: "5px 14px",
    podPad0: "18px 14px 14px",
    podPad12: "13px 11px 11px",
    podGap: 10,
    baseH: 18,
    xpBarH0: 12,
    rowPad: "6px 14px 6px 8px",
    rowGap: 10,
    rowMb: 4,
    medalSize0: 44,
    medalSize4: 36,
    rowAv0: 52,
    rowAv4: 44,
    rowNameFs0: 10,
    rowNameFs4: 8,
    rowPctFs0: 26,
    rowPctFs4: 20,
    rowXpH: 8,
    rowSubFs: 12,
    footerPtop: 8,
    footerMtop: 6,
    liveFs: 7,
    leaderFs: 16,
    brandFs: 7,
  };
}

// ─── Partículas ───────────────────────────────────────────────────
const PARTICLE_TYPES = [
  { char: "◆", color: MC.diamond },
  { char: "◆", color: MC.emerald },
  { char: "◆", color: MC.gold },
  { char: "▪", color: MC.enchantGlow },
  { char: "✦", color: MC.xpGreen },
];

const PARTICLES = Array.from({ length: 22 }, (_, i) => {
  const t = PARTICLE_TYPES[i % PARTICLE_TYPES.length];
  return {
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 14,
    dur: 7 + Math.random() * 10,
    size: 7 + Math.random() * 9,
    ...t,
  };
});

function Particle({ p }) {
  return (
    <div style={{
      position: "fixed", left: `${p.x}%`, top: "-16px",
      fontSize: p.size, color: p.color,
      textShadow: `0 0 6px ${p.color}`,
      animation: `particleFall ${p.dur}s ${p.delay}s infinite linear`,
      pointerEvents: "none", zIndex: 1, opacity: 0,
    }}>{p.char}</div>
  );
}

// ─── Grass stripe ─────────────────────────────────────────────────
function GrassStripe({ h = 14 }) {
  return (
    <div style={{
      width: "100%", height: h,
      background: `linear-gradient(180deg, ${MC.grassTop} 0%, ${MC.grass} 55%, ${MC.dirt} 100%)`,
      imageRendering: "pixelated",
      position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      {Array.from({ length: 36 }, (_, i) => (
        <div key={i} style={{
          position: "absolute", left: `${i * 2.8}%`, top: 0,
          width: 3, height: i % 3 === 0 ? Math.round(h * 0.6) : i % 2 === 0 ? Math.round(h * 0.45) : Math.round(h * 0.75),
          background: MC.grassTop, opacity: 0.55,
        }} />
      ))}
    </div>
  );
}

// ─── XP Bar ───────────────────────────────────────────────────────
function XpBar({ pct, color = MC.xpGreen, glow = MC.xpGlow, delay = 0, h = 9 }) {
  const val = Math.min(parseFloat(pct) || 0, 100);
  return (
    <div style={{
      width: "100%", height: h,
      background: "#000",
      border: "2px solid rgba(0,0,0,0.8)",
      outline: "1px solid rgba(255,255,255,0.07)",
      imageRendering: "pixelated",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, width: `${val}%`,
        background: `linear-gradient(90deg, ${color}AA, ${color}, ${glow})`,
        boxShadow: `0 0 5px ${glow}`,
        animation: `xpFill 1.4s cubic-bezier(.16,1,.3,1) ${delay}s both`,
      }} />
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} style={{
          position: "absolute", left: `${(i + 1) * 5}%`,
          top: 0, bottom: 0, width: 1,
          background: "rgba(0,0,0,0.22)",
        }} />
      ))}
    </div>
  );
}

// ─── Rank medal ───────────────────────────────────────────────────
function RankMedal({ rank, size = 44 }) {
  const medals = {
    1: { bg: `linear-gradient(135deg, ${MC.gold}, #FFE066)`, border: MC.goldGlow,    icon: "🏆", label: "1º" },
    2: { bg: `linear-gradient(135deg, ${MC.diamond}, #8FFFFF)`, border: MC.diamondGlow, icon: "💎", label: "2º" },
    3: { bg: `linear-gradient(135deg, ${MC.emerald}, #50FF9A)`, border: MC.emeraldGlow, icon: "🔮", label: "3º" },
  };
  const m = medals[rank];

  if (!m) return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundImage: TEXTURES.stone.bg, backgroundSize: TEXTURES.stone.size,
      border: "2px solid rgba(0,0,0,0.6)", imageRendering: "pixelated",
    }}>
      <span style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: Math.max(6, Math.round(size * 0.2)),
        color: "#CCC", textShadow: "1px 1px 0 #000", lineHeight: 1,
      }}>{rank}</span>
    </div>
  );

  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: m.bg,
      border: `2px solid ${m.border}`,
      boxShadow: `0 0 10px ${m.border}88`,
      imageRendering: "pixelated", gap: 1,
    }}>
      <span style={{ fontSize: Math.round(size * 0.38), lineHeight: 1 }}>{m.icon}</span>
      <span style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: Math.max(5, Math.round(size * 0.17)),
        color: "#000", lineHeight: 1,
      }}>{m.label}</span>
    </div>
  );
}

// ─── Avatar pixelado ──────────────────────────────────────────────
function McAvatar({ url, name, size = 72, rank = 0, animate = false }) {
  const initials  = (name || "??").slice(0, 2).toUpperCase();
  const glowAnim  =
    rank === 1 ? "goldGlow 2.5s ease-in-out infinite" :
    rank === 2 ? "diamondGlow 2.8s ease-in-out infinite" :
    rank === 3 ? "emeraldGlow 3s ease-in-out infinite" : "none";
  const borderColor =
    rank === 1 ? MC.gold :
    rank === 2 ? MC.diamond :
    rank === 3 ? MC.emerald : "rgba(255,255,255,0.2)";
  const borderW = Math.max(2, Math.round(size * 0.045));

  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      position: "relative",
      animation: animate ? glowAnim : "none",
    }}>
      <div style={{
        position: "absolute", inset: -borderW,
        border: `${borderW}px solid ${borderColor}`,
        imageRendering: "pixelated", zIndex: 1,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        border: "2px solid rgba(0,0,0,0.8)", zIndex: 2,
      }} />
      {url ? (
        <img src={url} alt={name} style={{
          width: "100%", height: "100%",
          objectFit: "cover", display: "block",
          imageRendering: "pixelated",
        }} />
      ) : (
        <div style={{
          width: "100%", height: "100%",
          backgroundImage: TEXTURES.obsidian.bg,
          backgroundSize: TEXTURES.obsidian.size,
          imageRendering: "pixelated",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: Math.max(8, Math.round(size * 0.21)),
            color: borderColor,
            textShadow: `2px 2px 0 #000, 0 0 8px ${borderColor}`,
          }}>{initials}</span>
        </div>
      )}
      {rank === 1 && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 3,
          background: `repeating-linear-gradient(45deg, transparent 0px, ${MC.enchantGlow}08 2px, transparent 4px)`,
          animation: "enchantScroll 2s linear infinite",
          pointerEvents: "none",
        }} />
      )}
    </div>
  );
}

// ─── Podium Card ──────────────────────────────────────────────────
function PodiumCard({ turma, rankIdx, show, D }) {
  const cfgs = [
    {
      texture: "diamond", labelColor: MC.gold,
      label: "🏆 1º LUGAR",
      glowAnim: `${D.mode === "totem" ? "floatYSm" : "floatY"} 3.2s ease-in-out infinite, enchantGlow 2.2s ease-in-out infinite`,
      delay: 0, order: 2, borderColor: MC.gold,
      badgeBg: `linear-gradient(135deg, #7A5500, ${MC.gold})`,
    },
    {
      texture: "stone", labelColor: MC.diamond,
      label: "💎 2º LUGAR",
      glowAnim: `${D.mode === "totem" ? "floatYSm" : "floatY"} 3.8s ease-in-out infinite, diamondGlow 2.6s ease-in-out infinite`,
      delay: 0.14, order: 1, borderColor: MC.diamond,
      badgeBg: `linear-gradient(135deg, #004A48, ${MC.diamond})`,
    },
    {
      texture: "dirt", labelColor: MC.emerald,
      label: "🔮 3º LUGAR",
      glowAnim: `floatYSm 4.2s ease-in-out infinite, emeraldGlow 3s ease-in-out infinite`,
      delay: 0.28, order: 3, borderColor: MC.emerald,
      badgeBg: `linear-gradient(135deg, #004020, ${MC.emerald})`,
    },
  ];

  const c  = cfgs[rankIdx];
  const tx = TEXTURES[c.texture];
  const w  = rankIdx === 0 ? D.podW0 : D.podW12;
  const av = rankIdx === 0 ? D.avSize0 : D.avSize12;

  return (
    <div style={{
      order: c.order,
      display: "flex", flexDirection: "column", alignItems: "center",
      width: w,
      opacity: show ? 1 : 0,
      animation: show ? `podiumIn .7s cubic-bezier(.34,1.3,.64,1) ${c.delay}s both` : "none",
    }}>
      {/* Badge de rank */}
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: rankIdx === 0 ? D.badgeFontSize0 : D.badgeFontSize12,
        color: rankIdx === 0 ? "#1A0A00" : "#000",
        background: c.badgeBg,
        padding: rankIdx === 0 ? D.badgePad0 : D.badgePad12,
        border: `2px solid ${c.borderColor}`,
        boxShadow: `0 0 12px ${c.borderColor}88`,
        marginBottom: Math.round(w * 0.055),
        letterSpacing: 1, imageRendering: "pixelated",
        textShadow: "none", whiteSpace: "nowrap",
      }}>{c.label}</div>

      {/* Card principal */}
      <div style={{
        width: "100%",
        backgroundImage: tx.bg, backgroundSize: tx.size,
        imageRendering: "pixelated",
        border: `3px solid ${c.borderColor}`,
        borderBottom: `3px solid ${c.borderColor}BB`,
        boxShadow: rankIdx === 0
          ? `0 0 0 2px #000, 0 0 28px ${c.borderColor}66, inset 0 0 16px ${c.borderColor}11`
          : `0 0 0 2px #000, 0 0 16px ${c.borderColor}44`,
        animation: c.glowAnim,
        padding: rankIdx === 0 ? D.podPad0 : D.podPad12,
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: D.podGap,
        position: "relative", overflow: "hidden",
      }}>
        {rankIdx === 0 && (
          <div style={{
            position: "absolute", inset: 0,
            background: `repeating-linear-gradient(45deg, transparent 0, ${MC.enchant}07 1px, transparent 2px, transparent 8px)`,
            animation: "enchantScroll 1.8s linear infinite",
            pointerEvents: "none", zIndex: 0,
          }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.44)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <McAvatar url={turma.foto_url} name={turma.nome_fantasia} size={av} rank={rankIdx + 1} animate />
        </div>

        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: rankIdx === 0 ? D.nameFontSize0 : D.nameFontSize12,
          color: c.labelColor,
          textShadow: `2px 2px 0 #000, 0 0 12px ${c.borderColor}`,
          textAlign: "center", lineHeight: 1.5,
          letterSpacing: 0.5, maxWidth: "100%",
          wordBreak: "break-word",
          position: "relative", zIndex: 1,
        }}>{turma.nome_fantasia}</div>

        <div style={{
          fontFamily: "'VT323', monospace",
          fontSize: rankIdx === 0 ? D.pctFontSize0 : D.pctFontSize12,
          color: c.labelColor,
          textShadow: `2px 2px 0 #000, 0 0 8px ${c.borderColor}`,
          lineHeight: 1, position: "relative", zIndex: 1, letterSpacing: 2,
        }}>
          {parseFloat(turma.porcentagem_presenca).toFixed(2)}%
        </div>

        <div style={{ width: "90%", position: "relative", zIndex: 1 }}>
          <XpBar
            pct={turma.porcentagem_presenca}
            color={rankIdx === 0 ? MC.gold : rankIdx === 1 ? MC.diamond : MC.emerald}
            glow={rankIdx === 0 ? MC.goldGlow : rankIdx === 1 ? MC.diamondGlow : MC.emeraldGlow}
            delay={c.delay + 0.45}
            h={D.xpBarH0}
          />
        </div>
      </div>

      {/* Base obsidiana */}
      <div style={{
        width: "100%", height: D.baseH,
        backgroundImage: TEXTURES.obsidian.bg,
        backgroundSize: TEXTURES.obsidian.size,
        imageRendering: "pixelated",
        border: `2px solid ${c.borderColor}44`,
        borderTop: "none",
        boxShadow: "0 3px 0 rgba(0,0,0,0.6)",
      }} />

      {/* Glow de chão embaixo do pódio */}
      <div style={{
        width: "70%", height: 6, marginTop: 2,
        background: `radial-gradient(ellipse, ${c.borderColor}55, transparent 70%)`,
        filter: "blur(4px)",
        animation: "groundGlow 2s ease-in-out infinite",
        animationDelay: `${c.delay}s`,
      }} />
    </div>
  );
}

// ─── Rank Row ─────────────────────────────────────────────────────
function RankRow({ turma, rank, show, delay, D }) {
  const isTop3 = rank <= 3;
  const isTop5 = rank <= 5;
  const color =
    rank === 1 ? MC.gold : rank === 2 ? MC.diamond :
    rank === 3 ? MC.emerald : isTop5 ? MC.enchantGlow : "rgba(255,255,255,0.65)";

  const rowTx  = isTop3 ? TEXTURES.obsidian : null;
  const altDir = rank % 2 === 0 ? "slideInRight" : "slideInLeft";
  const medSz  = isTop3 ? D.medalSize0 : D.medalSize4;
  const avSz   = isTop3 ? D.rowAv0 : D.rowAv4;

  return (
    <div className="mc-row" style={{
      display: "flex", alignItems: "center",
      gap: D.rowGap,
      padding: D.rowPad,
      backgroundImage: rowTx ? rowTx.bg : undefined,
      backgroundSize:  rowTx ? rowTx.size : undefined,
      background:      rowTx ? undefined : isTop5 ? "rgba(0,20,10,0.7)" : "rgba(0,0,0,0.55)",
      imageRendering: "pixelated",
      border: `2px solid ${color}33`,
      borderLeft: `4px solid ${color}`,
      marginBottom: D.rowMb,
      position: "relative", overflow: "hidden",
      opacity: show ? 1 : 0,
      transform: show ? "translateX(0)" : altDir === "slideInLeft" ? "translateX(-70px)" : "translateX(70px)",
      transition: `opacity .42s ease ${delay}s, transform .42s cubic-bezier(.34,1.2,.64,1) ${delay}s`,
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <RankMedal rank={rank} size={medSz} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <McAvatar
          url={turma.foto_url} name={turma.nome_fantasia}
          size={avSz} rank={isTop3 ? rank : 0}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: isTop3 ? D.rowNameFs0 : D.rowNameFs4,
          color,
          textShadow: `2px 2px 0 #000, 0 0 7px ${color}88`,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          marginBottom: Math.max(3, D.rowXpH - 1),
          lineHeight: 1.2, letterSpacing: 0.3,
        }}>{turma.nome_fantasia}</div>

        <XpBar
          pct={turma.porcentagem_presenca}
          color={rank === 1 ? MC.gold : rank === 2 ? MC.diamond : rank === 3 ? MC.emerald : isTop5 ? MC.enchant : MC.xpGreen}
          glow={rank === 1 ? MC.goldGlow : rank === 2 ? MC.diamondGlow : rank === 3 ? MC.emeraldGlow : isTop5 ? MC.enchantGlow : MC.xpGlow}
          delay={delay + 0.18}
          h={D.rowXpH}
        />

        {D.mode !== "mobile" && (
          <div style={{
            fontFamily: "'VT323', monospace",
            fontSize: D.rowSubFs,
            color: "rgba(255,255,255,0.22)",
            letterSpacing: 2, marginTop: 2,
          }}>{turma.nome}</div>
        )}
      </div>

      <div style={{
        fontFamily: "'VT323', monospace",
        fontSize: isTop3 ? D.rowPctFs0 : D.rowPctFs4,
        color,
        textShadow: `2px 2px 0 #000, 0 0 8px ${color}`,
        flexShrink: 0, lineHeight: 1,
        minWidth: Math.round((isTop3 ? D.rowPctFs0 : D.rowPctFs4) * 2.6),
        textAlign: "right", position: "relative", zIndex: 1, letterSpacing: 1,
      }}>
        {(parseFloat(turma.porcentagem_presenca) || 0).toFixed(2)}
        <span style={{ fontSize: "0.58em", color: "rgba(255,255,255,0.38)" }}>%</span>
      </div>
    </div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────
function McTab({ label, active, onClick, cd, D }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: "'Press Start 2P', monospace",
      fontSize: D.tabFontSize,
      letterSpacing: 1,
      padding: `${D.tabPadV}px ${D.tabPadH}px`,
      backgroundImage: active ? TEXTURES.diamond.bg : TEXTURES.stone.bg,
      backgroundSize:  active ? TEXTURES.diamond.size : TEXTURES.stone.size,
      imageRendering: "pixelated",
      border:       `3px solid ${active ? MC.diamond : "rgba(0,0,0,0.6)"}`,
      borderBottom: `3px solid ${active ? MC.diamondGlow : "rgba(0,0,0,0.8)"}`,
      boxShadow: active ? `0 0 18px ${MC.diamond}66, 0 4px 0 #000` : "0 4px 0 #000",
      color:      active ? "#000" : "rgba(255,255,255,0.45)",
      textShadow: active ? "none" : "1px 1px 0 #000",
      position: "relative", overflow: "hidden",
      transition: "box-shadow .2s ease",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: active ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.45)",
        pointerEvents: "none",
      }} />
      <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
      {active && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, height: 3,
          background: `linear-gradient(90deg, ${MC.xpGreen}, ${MC.gold})`,
          boxShadow: `0 0 6px ${MC.xpGlow}`,
          width: `${cd}%`, transition: "width .15s linear",
        }} />
      )}
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────
const TAB_MS = 12000;

export default function MinecraftRanking() {
  const [tab,     setTab]     = useState("semanal");
  const [show,    setShow]    = useState(false);
  const [transit, setTransit] = useState(false);
  const [cd,      setCd]      = useState(100);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [dataMap, setDataMap] = useState({ semanal: [], mensal: [] });

  const cdRef   = useRef(100);
  const cdInter = useRef(null);
  const tabRef  = useRef("semanal");
  const autoRef = useRef(null);

  // Design tokens responsivos
  const D = useViewport();

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [rS, rM] = await Promise.all([
        apiFetch("/ranking?tipo=semanal"),
        apiFetch("/ranking?tipo=mensal"),
      ]);
      if (!rS.ok || !rM.ok) throw new Error("Erro ao carregar dados");
      const [dS, dM] = await Promise.all([rS.json(), rM.json()]);
      const sort = arr =>
        [...arr].sort((a, b) =>
          parseFloat(b.porcentagem_presenca) - parseFloat(a.porcentagem_presenca));
      setDataMap({ semanal: sort(dS), mensal: sort(dM) });
    } catch (e) {
      setError(e.message || "Conexão falhou.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (loading || error) return;
    setTimeout(() => setShow(true), 350);
    resetCd();
    autoRef.current = setInterval(() => {
      doSwitch(tabRef.current === "semanal" ? "mensal" : "semanal");
    }, TAB_MS);
    return () => { clearInterval(autoRef.current); clearInterval(cdInter.current); };
  }, [loading, error]);

  const resetCd = () => {
    clearInterval(cdInter.current);
    cdRef.current = 100; setCd(100);
    const step = 100 / (TAB_MS / 150);
    cdInter.current = setInterval(() => {
      cdRef.current -= step;
      if (cdRef.current <= 0) { cdRef.current = 100; setCd(100); }
      else setCd(cdRef.current);
    }, 150);
  };

  const doSwitch = (next) => {
    if (transit) return;
    setTransit(true); setShow(false);
    setTimeout(() => {
      tabRef.current = next; setTab(next);
      setTransit(false); setShow(true);
      resetCd();
    }, 480);
  };

  const sorted  = dataMap[tab] || [];
  const topTeam = sorted[0];
  const isTotem = D.mode === "totem";

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* Partículas */}
      {PARTICLES.map(p => <Particle key={p.id} p={p} />)}

      {/* Wrapper raiz — 100vh sem scroll em totem, scrollável em mobile */}
      <div style={{
        width: "100%",
        height: "100vh",
        overflow: D.overflow,
        background: `radial-gradient(ellipse 130% 70% at 50% -10%,
          ${MC.skyDark} 0%, #1A0A2E 35%, #0D051A 65%, #000 100%)`,
        display: "flex", flexDirection: "column",
        position: "relative",
      }}>

        {/* Scan beam */}
        <div style={{
          position: "fixed", left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${MC.xpGreen}44, transparent)`,
          animation: "scanline 7s linear infinite",
          pointerEvents: "none", zIndex: 5,
        }} />

        {/* Corner blocks */}
        {[{ top: 0, left: 0 }, { top: 0, right: 0 }, { bottom: 0, left: 0 }, { bottom: 0, right: 0 }].map((pos, i) => (
          <div key={i} style={{ position: "fixed", ...pos, zIndex: 20, pointerEvents: "none" }}>
            <div style={{
              width: 20, height: 20,
              backgroundImage: TEXTURES.obsidian.bg,
              backgroundSize: TEXTURES.obsidian.size,
              imageRendering: "pixelated",
              border: "2px solid rgba(0,0,0,0.6)",
            }} />
          </div>
        ))}

        {/* ── LOADING ── */}
        {loading && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 100,
            backgroundImage: TEXTURES.obsidian.bg,
            backgroundSize: TEXTURES.obsidian.size,
            imageRendering: "pixelated",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 20,
          }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} />
            <div style={{
              position: "relative", zIndex: 1,
              fontFamily: "'Press Start 2P', monospace",
              fontSize: D.titleFontSize,
              color: MC.xpGreen,
              textShadow: `4px 4px 0 #000, 0 0 18px ${MC.xpGlow}`,
              letterSpacing: 2,
              animation: "pixelFlicker 4s ease-in-out infinite",
              textAlign: "center",
            }}>CLASSPULSE</div>
            <div style={{
              position: "relative", zIndex: 1,
              fontFamily: "'VT323', monospace", fontSize: D.subtitleFontSize + 4,
              color: "rgba(255,255,255,0.4)", letterSpacing: 5,
            }}>CARREGANDO MUNDO...</div>
            <div style={{
              position: "relative", zIndex: 1,
              width: 260, height: 16, background: "#000",
              border: "3px solid rgba(255,255,255,0.2)",
              imageRendering: "pixelated", overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: "65%",
                background: `linear-gradient(90deg, ${MC.xpGreen}, ${MC.xpGlow})`,
                animation: "pixelFlicker .8s ease-in-out infinite",
              }} />
            </div>
            <div style={{
              position: "relative", zIndex: 1,
              display: "flex", gap: 14, fontSize: D.titleFontSize,
            }}>
              {["⛏️","💎","🗡️","🏹","🧱"].map((e, i) => (
                <span key={i} style={{
                  animation: `floatY ${1.4 + i * 0.25}s ${i * 0.2}s ease-in-out infinite`,
                  display: "inline-block",
                }}>{e}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {!loading && error && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.95)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 18,
          }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: D.titleFontSize + 6,
              color: MC.heart,
              textShadow: `4px 4px 0 #000, 0 0 22px ${MC.heart}`,
              letterSpacing: 2, textAlign: "center",
            }}>VOCÊ MORREU</div>
            <div style={{ fontSize: 42 }}>💀</div>
            <div style={{
              fontFamily: "'VT323', monospace", fontSize: D.subtitleFontSize + 4,
              color: "rgba(255,100,100,0.5)", letterSpacing: 4,
            }}>{error}</div>
            <button onClick={fetchAll} style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: D.tabFontSize + 1, letterSpacing: 2,
              padding: "12px 28px",
              background: MC.grassTop,
              border: `3px solid ${MC.xpGreen}`,
              boxShadow: `0 0 18px ${MC.xpGlow}, 0 4px 0 #000`,
              color: "#000", imageRendering: "pixelated",
            }}>[ RENASCER ]</button>
          </div>
        )}

        {/* ── MAIN ── */}
        {!loading && !error && (
          <div style={{
            flex: 1,
            padding: D.outerPad,
            display: "flex", flexDirection: "column",
            maxWidth: D.maxW, margin: "0 auto", width: "100%",
            position: "relative", zIndex: 10,
            ...(isTotem ? { height: "100vh", overflow: "hidden" } : {}),
          }}>

            {/* ── HEADER ── */}
            <div style={{ textAlign: "center", marginBottom: isTotem ? 6 : 10, flexShrink: 0 }}>
              {/* HUD de servidor — melhoria: agora com ponto pulsante */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "'VT323', monospace",
                fontSize: D.serverFontSize,
                color: "rgba(255,255,255,0.25)",
                letterSpacing: 6, marginBottom: isTotem ? 3 : 5,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: MC.xpGreen,
                  boxShadow: `0 0 6px ${MC.xpGlow}`,
                  animation: "liveBlip 1.4s ease-in-out infinite",
                  flexShrink: 0,
                }} />
                SERVIDOR: CLASSPULSE
              </div>

              {/* Título com gradiente animado */}
              <h1 style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: D.titleFontSize,
                background: `linear-gradient(270deg,
                  ${MC.gold}, ${MC.xpGreen}, ${MC.diamond},
                  ${MC.gold}, ${MC.xpGreen})`,
                backgroundSize: "300% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: isTotem ? 1 : 2,
                lineHeight: 1.35,
                filter: `drop-shadow(3px 3px 0 #000)`,
                animation: "titleDrop .8s cubic-bezier(.34,1.3,.64,1) both, titleShimmer 6s linear infinite, pixelFlicker 14s ease-in-out infinite",
                userSelect: "none",
              }}>
                ⛏ RANKING DAS TURMAS ⛏
              </h1>

              <div style={{ marginTop: isTotem ? 4 : 7 }}>
                <GrassStripe h={D.grassH} />
              </div>

              <div style={{
                fontFamily: "'VT323', monospace",
                fontSize: D.subtitleFontSize,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: isTotem ? 3 : 6,
                marginTop: isTotem ? 4 : 6,
              }}>
                {tab === "semanal" ? "— MISSÃO SEMANAL —" : "— CONQUISTA MENSAL —"}
              </div>
            </div>

            {/* ── TABS ── */}
            <div style={{
              display: "flex", justifyContent: "center",
              gap: D.tabGap, marginBottom: D.tabMb, flexShrink: 0,
            }}>
              <McTab label="⚔ SEMANAL" active={tab === "semanal"} onClick={() => doSwitch("semanal")} cd={tab === "semanal" ? cd : 100} D={D} />
              <McTab label="🏰 MENSAL"  active={tab === "mensal"}  onClick={() => doSwitch("mensal")}  cd={tab === "mensal"  ? cd : 100} D={D} />
            </div>

            {/* ── PÓDIO ── */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: D.podiumGap,
              marginBottom: D.podiumMb,
              flexShrink: 0,
              flexWrap: D.mode === "mobile" ? "wrap" : "nowrap",
              opacity:   transit ? 0 : 1,
              transform: transit ? "scale(.93)" : "scale(1)",
              transition: "opacity .35s ease, transform .35s ease",
            }}>
              {[
                { data: sorted[1], rankIdx: 1 },
                { data: sorted[0], rankIdx: 0 },
                { data: sorted[2], rankIdx: 2 },
              ].map(({ data, rankIdx }) =>
                data ? (
                  <PodiumCard
                    key={data.turma_id}
                    turma={data}
                    rankIdx={rankIdx}
                    show={show && !transit}
                    D={D}
                  />
                ) : null
              )}
            </div>

            {/* ── Grass divider ── */}
            <div style={{ flexShrink: 0, marginBottom: isTotem ? 5 : 8 }}>
              <GrassStripe h={D.grassH} />
            </div>

            {/* ── LISTA ── */}
            <div style={{
              flex: 1,
              overflow: "hidden",
              opacity:   transit ? 0 : 1,
              transition: "opacity .35s ease",
            }}>
              {sorted.map((t, i) => (
                <RankRow
                  key={t.turma_id}
                  turma={t}
                  rank={i + 1}
                  show={show && !transit}
                  delay={0.045 * i}
                  D={D}
                />
              ))}
            </div>

            {/* ── FOOTER ── */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: D.footerPtop,
              marginTop: D.footerMtop,
              flexShrink: 0,
              borderTop: `2px solid ${MC.grass}33`,
            }}>
              {/* Live */}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{
                  width: 7, height: 7,
                  background: MC.xpGreen,
                  boxShadow: `0 0 7px ${MC.xpGlow}`,
                  animation: "liveBlip 1s ease-in-out infinite",
                  imageRendering: "pixelated",
                }} />
                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: D.liveFs,
                  color: `${MC.xpGreen}88`, letterSpacing: 2,
                }}>AO VIVO</span>
              </div>

              {/* Líder */}
              <div style={{
                fontFamily: "'VT323', monospace",
                fontSize: D.leaderFs,
                color: `${MC.gold}BB`,
                letterSpacing: 2,
                textShadow: "1px 1px 0 #000",
                animation: "heartbeat 4s ease-in-out infinite",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                maxWidth: D.mode === "mobile" ? "50%" : "60%",
                textAlign: "center",
              }}>
                👑 {topTeam?.nome_fantasia} • {parseFloat(topTeam?.porcentagem_presenca || 0).toFixed(2)}%
              </div>

              {/* Branding */}
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: D.brandFs,
                color: "rgba(255,255,255,0.14)",
                letterSpacing: 2,
              }}>CLASSPULSE</div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
