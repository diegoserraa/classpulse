import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../services/Api";

const TAB_MS = 11000;

// ── Confetes ──────────────────────────────────────────────────────────────────
const CONFETTI = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 8,
  speed: Math.random() * 6 + 4,
  size: Math.random() * 10 + 5,
  rotate: Math.random() * 360,
  shape: i % 3,
  color: [
    "#FF6B6B","#FFE66D","#4ECDC4","#A8E6CF","#FF8B94",
    "#FFA07A","#98D8C8","#F7DC6F","#BB8FCE","#85C1E9",
    "#F1948A","#82E0AA","#F8C471","#AED6F1","#FAD7A0",
  ][i % 15],
}));

// ── Estrelas de fundo ─────────────────────────────────────────────────────────
const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 16 + 8,
  delay: Math.random() * 3,
  speed: Math.random() * 1.5 + 1,
  emoji: ["⭐","🌟","✨","💫"][i % 4],
}));

// Cores vibrantes por posição
const RANK_PALETTE = [
  { bg: "linear-gradient(135deg,#FFD700,#FF8C00)", text: "#7B3F00", glow: "#FFD700" },
  { bg: "linear-gradient(135deg,#E0E0E0,#A9A9A9)", text: "#3D3D3D", glow: "#C0C0C0" },
  { bg: "linear-gradient(135deg,#CD7F32,#8B4513)", text: "#FFF3E0", glow: "#CD7F32" },
  { bg: "linear-gradient(135deg,#FF6B9D,#C44569)", text: "#fff",    glow: "#FF6B9D" },
  { bg: "linear-gradient(135deg,#4ECDC4,#1A535C)", text: "#fff",    glow: "#4ECDC4" },
  { bg: "linear-gradient(135deg,#A8E063,#56AB2F)", text: "#fff",    glow: "#A8E063" },
  { bg: "linear-gradient(135deg,#FDA7DF,#D980FA)", text: "#fff",    glow: "#FDA7DF" },
  { bg: "linear-gradient(135deg,#FFC312,#C4E538)", text: "#fff",    glow: "#FFC312" },
];

const MEDAL_EMOJI = ["🥇","🥈","🥉"];
const CROWN_EMOJI = ["👑","🎖️","🏅"];
const RANK_BG = [
  "linear-gradient(135deg,#fff9e6,#fff3cc)",
  "linear-gradient(135deg,#f5f5f5,#e8e8e8)",
  "linear-gradient(135deg,#fff3e8,#ffe0c8)",
];

// ── Logo da turma ─────────────────────────────────────────────────────────────
function TurmaLogo({ fotoUrl, size = 48, fantasia = "", idx = 0 }) {
  const p = RANK_PALETTE[idx % RANK_PALETTE.length];
  if (fotoUrl) {
    return (
      <img src={fotoUrl} alt={fantasia}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: p.bg, color: p.text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Fredoka One',cursive",
      fontSize: size * 0.32, fontWeight: 900,
    }}>
      {fantasia.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── Confete SVG caindo ────────────────────────────────────────────────────────
function Confetto({ c }) {
  const shapes = [
    <rect key="r" width={c.size} height={c.size * 0.5} rx="2" fill={c.color} />,
    <circle key="c" cx={c.size / 2} cy={c.size / 2} r={c.size / 2} fill={c.color} />,
    <polygon key="t"
      points={`${c.size/2},0 ${c.size},${c.size} 0,${c.size}`}
      fill={c.color} />,
  ];
  return (
    <div style={{
      position: "absolute", left: `${c.x}%`, top: "-20px",
      animation: `confettiFall ${c.speed}s ${c.delay}s infinite linear`,
      pointerEvents: "none", zIndex: 5,
      transform: `rotate(${c.rotate}deg)`,
    }}>
      <svg width={c.size} height={c.size}>{shapes[c.shape]}</svg>
    </div>
  );
}

// ── Estrela pulsante de fundo ─────────────────────────────────────────────────
function Star({ s }) {
  return (
    <div style={{
      position: "absolute",
      left: `${s.x}%`, top: `${s.y}%`,
      fontSize: s.size,
      animation: `starPulse ${s.speed}s ${s.delay}s ease-in-out infinite`,
      pointerEvents: "none", zIndex: 1, userSelect: "none",
      opacity: 0.18,
    }}>
      {s.emoji}
    </div>
  );
}

// ── Bloco do pódio ────────────────────────────────────────────────────────────
function PodiumBlock({ turma, rank, show, idx }) {
  const isSmall = window.innerHeight < 800;
  const H  = isSmall ? [100, 75, 58] : [140, 100, 78];
  const SZ = isSmall ? [60, 50, 42]  : [76, 62, 52];

  const colors = [
    { main: "#FFD700", light: "#FFF9C4", dark: "#B8860B", shadow: "#FFD70066" },
    { main: "#C0C0C0", light: "#F5F5F5", dark: "#808080", shadow: "#C0C0C066" },
    { main: "#CD7F32", light: "#FFEFD5", dark: "#8B4513", shadow: "#CD7F3266" },
  ];
  const c = colors[rank - 1];
  const ord = rank === 1 ? 2 : rank === 2 ? 1 : 3;
  const delay = rank === 1 ? 0.1 : rank === 2 ? 0.35 : 0.6;
  const bounceAnim = ["podiumBounce1","podiumBounce2","podiumBounce3"][rank - 1];

  return (
    <div style={{
      order: ord,
      display: "flex", flexDirection: "column", alignItems: "center",
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0) scale(1)" : "translateY(60px) scale(0.7)",
      transition: `opacity .7s ease ${delay}s, transform .7s cubic-bezier(.34,1.6,.64,1) ${delay}s`,
    }}>
      {/* Emoji coroa */}
      <div style={{
        fontSize: rank === 1 ? 28 : 22,
        animation: `${bounceAnim} ${rank === 1 ? 1.8 : 2.4}s ease-in-out infinite`,
        marginBottom: 4, filter: `drop-shadow(0 4px 8px ${c.shadow})`,
      }}>
        {CROWN_EMOJI[rank - 1]}
      </div>

      {/* Avatar */}
      <div style={{
        width: SZ[rank - 1], height: SZ[rank - 1], borderRadius: "50%",
        border: `4px solid ${c.main}`,
        boxShadow: `0 0 0 4px ${c.light}, 0 8px 24px ${c.shadow}, 0 0 40px ${c.shadow}`,
        overflow: "hidden", flexShrink: 0, marginBottom: 10,
        background: c.light,
        animation: `avatarWiggle ${rank === 1 ? 2.2 : 3}s ease-in-out infinite`,
      }}>
        <TurmaLogo fotoUrl={turma.foto_url} size={SZ[rank - 1]} fantasia={turma.nome_fantasia} idx={rank - 1} />
      </div>

      {/* Nome */}
      <div style={{
        fontFamily: "'Fredoka One',cursive",
        fontSize: rank === 1 ? 16 : 13,
        color: c.dark,
        letterSpacing: 1,
        textAlign: "center",
        marginBottom: 2,
        textShadow: `0 2px 8px ${c.shadow}`,
        maxWidth: rank === 1 ? 130 : 100,
      }}>
        {turma.nome_fantasia}
      </div>

      {/* Porcentagem */}
      <div style={{
        fontFamily: "'Fredoka One',cursive",
        fontSize: rank === 1 ? 20 : 15,
        color: c.dark,
        marginBottom: 8,
        background: c.light,
        padding: "2px 12px", borderRadius: 20,
        border: `2px solid ${c.main}`,
        boxShadow: `0 2px 8px ${c.shadow}`,
      }}>
        {parseFloat(turma.porcentagem_presenca).toFixed(2)}%
      </div>

      {/* Bloco físico */}
      <div style={{
        width: rank === 1 ? 120 : rank === 2 ? 96 : 80,
        height: H[rank - 1],
        background: `linear-gradient(180deg, ${c.main} 0%, ${c.dark} 100%)`,
        borderRadius: "16px 16px 0 0",
        boxShadow: `0 -4px 20px ${c.shadow}, inset 0 2px 8px rgba(255,255,255,0.4)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Brilho interno */}
        <div style={{
          position: "absolute", top: 0, left: "15%", right: "15%",
          height: "40%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.4), transparent)",
          borderRadius: "0 0 50% 50%",
        }} />
        <span style={{
          fontFamily: "'Fredoka One',cursive",
          fontSize: rank === 1 ? 42 : 30,
          color: "rgba(255,255,255,0.9)",
          textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          position: "relative", zIndex: 1,
        }}>
          {["①","②","③"][rank - 1]}
        </span>
      </div>
    </div>
  );
}

// ── Linha do ranking ──────────────────────────────────────────────────────────
function RankRow({ turma, rank, pct, show, delay }) {
  const isTop3 = rank <= 3;
  const p = RANK_PALETTE[(rank - 1) % RANK_PALETTE.length];
  const rowBg = isTop3 ? RANK_BG[rank - 1] : "rgba(255,255,255,0.7)";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px", marginBottom: 7, borderRadius: 16,
      background: rowBg,
      border: isTop3 ? `2px solid ${p.glow}55` : "2px solid rgba(0,0,0,0.06)",
      boxShadow: isTop3
        ? `0 4px 16px ${p.glow}22, inset 0 1px 0 rgba(255,255,255,0.8)`
        : "0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
      opacity: show ? 1 : 0,
      transform: show ? "translateX(0) scale(1)" : "translateX(-50px) scale(0.95)",
      transition: `opacity .5s ease ${delay}s, transform .5s cubic-bezier(.34,1.4,.64,1) ${delay}s`,
    }}>
      {/* Badge de rank */}
      <div style={{
        minWidth: 40, height: 40, borderRadius: 12,
        background: isTop3 ? p.bg : "linear-gradient(135deg,#f0f0f0,#ddd)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: isTop3 ? `0 4px 12px ${p.glow}44` : "0 2px 6px rgba(0,0,0,0.1)",
        fontSize: isTop3 ? 20 : 14,
        fontFamily: "'Fredoka One',cursive",
        color: isTop3 ? p.text : "#666",
        fontWeight: 900,
      }}>
        {isTop3 ? MEDAL_EMOJI[rank - 1] : `#${rank}`}
      </div>

      {/* Avatar */}
      <div style={{
        width: 42, height: 42, borderRadius: "50%",
        border: `3px solid ${isTop3 ? p.glow : "#ddd"}`,
        overflow: "hidden", flexShrink: 0,
        boxShadow: isTop3 ? `0 0 12px ${p.glow}44` : "none",
      }}>
        <TurmaLogo fotoUrl={turma.foto_url} size={38} fantasia={turma.nome_fantasia} idx={rank - 1} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 5,
        }}>
          <span style={{
            fontFamily: "'Fredoka One',cursive",
            fontSize: 14, color: "#333",
            letterSpacing: 0.5, whiteSpace: "nowrap",
          }}>
            {turma.nome_fantasia}
          </span>
          <span style={{
            fontFamily: "'Fredoka One',cursive",
            fontSize: 15, color: isTop3 ? p.glow : "#555",
            fontWeight: 900,
            background: isTop3 ? `${p.glow}18` : "transparent",
            padding: "1px 8px", borderRadius: 8,
          }}>
            {parseFloat(pct).toFixed(2)}%
          </span>
        </div>

        {/* Barra */}
        <div style={{
          height: 8, borderRadius: 4,
          background: "rgba(0,0,0,0.08)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            width: show ? `${Math.min(parseFloat(pct), 100)}%` : "0%",
            transition: `width 1.2s cubic-bezier(.16,1,.3,1) ${delay + 0.15}s`,
            background: isTop3 ? p.bg : "linear-gradient(90deg,#a0a0a0,#d0d0d0)",
            borderRadius: 4,
            boxShadow: isTop3 ? `0 0 8px ${p.glow}66` : "none",
          }} />
          {/* Bolinha no fim da barra */}
          <div style={{
            position: "absolute",
            left: show ? `calc(${Math.min(parseFloat(pct), 100)}% - 6px)` : "0%",
            top: "50%", transform: "translateY(-50%)",
            width: 8, height: 8, borderRadius: "50%",
            background: isTop3 ? p.glow : "#aaa",
            boxShadow: isTop3 ? `0 0 6px ${p.glow}` : "none",
            transition: `left 1.2s cubic-bezier(.16,1,.3,1) ${delay + 0.15}s`,
          }} />
        </div>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function FestivalRanking() {
  const [tab,     setTab]     = useState("semanal");
  const [show,    setShow]    = useState(false);
  const [transit, setTransit] = useState(false);
  const [cd,      setCd]      = useState(100);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [dataMap, setDataMap] = useState({ semanal: [], mensal: [] });
  const [bounce,  setBounce]  = useState(false);

  const cdRef     = useRef(100);
  const cdInter   = useRef(null);
  const tabRef    = useRef("semanal");
  const autoRef   = useRef(null);

  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const [r1, r2] = await Promise.all([
        apiFetch(`/ranking?tipo=semanal`),
        apiFetch(`/ranking?tipo=mensal`),
      ]);
      if (!r1.ok || !r2.ok) throw new Error(`Erro HTTP ${r1.status}`);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      const sort = arr =>
        [...arr].sort((a, b) => parseFloat(b.porcentagem_presenca) - parseFloat(a.porcentagem_presenca));
      setDataMap({ semanal: sort(d1), mensal: sort(d2) });
    } catch (e) {
      setError(e.message || "Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (loading || error) return;
    setTimeout(() => setShow(true), 200);
    resetCd();

    autoRef.current = setInterval(() => {
      const next = tabRef.current === "semanal" ? "mensal" : "semanal";
      doSwitch(next);
    }, TAB_MS);

    return () => {
      clearInterval(autoRef.current);
      clearInterval(cdInter.current);
    };
  }, [loading, error]);

  const resetCd = () => {
    clearInterval(cdInter.current);
    cdRef.current = 100; setCd(100);
    const step = 100 / (TAB_MS / 120);
    cdInter.current = setInterval(() => {
      cdRef.current -= step;
      if (cdRef.current <= 0) { cdRef.current = 100; setCd(100); }
      else setCd(cdRef.current);
    }, 120);
  };

  const doSwitch = (next) => {
    if (transit) return;
    setTransit(true); setShow(false);
    setBounce(true);
    setTimeout(() => setBounce(false), 400);
    setTimeout(() => {
      tabRef.current = next;
      setTab(next);
      setTransit(false);
      setShow(true);
      resetCd();
    }, 450);
  };

  const sorted  = dataMap[tab] || [];
  const topTeam = sorted[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;800;900&display=swap');
        *,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }
        html,body { width:100%; height:100%; overflow:hidden; }

        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          80%  { opacity: 0.8; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes starPulse {
          0%,100% { transform: scale(1) rotate(0deg);   opacity: 0.15; }
          50%     { transform: scale(1.4) rotate(20deg); opacity: 0.35; }
        }
        @keyframes titleBounce {
          0%,100% { transform: translateY(0) scale(1); }
          25%     { transform: translateY(-6px) scale(1.02); }
          75%     { transform: translateY(2px) scale(0.99); }
        }
        @keyframes podiumBounce1 {
          0%,100% { transform: translateY(0) scale(1); }
          50%     { transform: translateY(-12px) scale(1.08); }
        }
        @keyframes podiumBounce2 {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-7px); }
        }
        @keyframes podiumBounce3 {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-5px); }
        }
        @keyframes avatarWiggle {
          0%,100% { transform: rotate(0deg); }
          20%     { transform: rotate(-4deg) scale(1.05); }
          40%     { transform: rotate(4deg) scale(1.05); }
          60%     { transform: rotate(-2deg); }
          80%     { transform: rotate(2deg); }
        }
        @keyframes rainbowBg {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatUp {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-10px); }
        }
        @keyframes tabPop {
          0%  { transform: scale(1); }
          40% { transform: scale(1.08); }
          100%{ transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes loadPulse {
          0%,100% { transform: scale(1); opacity:1; }
          50%     { transform: scale(1.15); opacity:0.7; }
        }
        @keyframes shimmerCard {
          0%,100% { box-shadow: 0 8px 32px rgba(255,182,193,0.3), 0 0 0 3px rgba(255,255,255,0.5); }
          50%     { box-shadow: 0 16px 48px rgba(255,182,193,0.5), 0 0 0 4px rgba(255,255,255,0.8); }
        }
        button { outline: none; cursor: pointer; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{
        width: "100vw", height: "100vh",
        background: "linear-gradient(-45deg, #FFE0F0, #FFF4E0, #E0F8FF, #E8FFE0, #F0E0FF, #FFE8E0)",
        backgroundSize: "400% 400%",
        animation: "rainbowBg 12s ease infinite",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>

        {/* Estrelas de fundo */}
        {STARS.map(s => <Star key={s.id} s={s} />)}

        {/* Confetes */}
        {CONFETTI.map(c => <Confetto key={c.id} c={c} />)}

        {/* LOADING */}
        {loading && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 50,
            background: "rgba(255,255,255,0.85)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 20,
          }}>
            <div style={{ fontSize: 64, animation: "loadPulse 0.8s ease-in-out infinite" }}>🎉</div>
            <div style={{
              fontFamily: "'Fredoka One',cursive", fontSize: 22,
              color: "#FF6B9D", letterSpacing: 2,
            }}>Carregando ranking...</div>
          </div>
        )}

        {/* ERRO */}
        {!loading && error && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 50,
            background: "rgba(255,255,255,0.9)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
          }}>
            <div style={{ fontSize: 56 }}>😢</div>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: "#FF6B6B" }}>
              Ops! Algo deu errado
            </div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: "#999" }}>{error}</div>
            <button onClick={fetchAll} style={{
              fontFamily: "'Fredoka One',cursive", fontSize: 16,
              padding: "10px 32px", borderRadius: 50,
              border: "none",
              background: "linear-gradient(135deg,#FF6B9D,#C44569)",
              color: "#fff", letterSpacing: 1,
              boxShadow: "0 4px 16px rgba(196,69,105,0.4)",
            }}>Tentar novamente</button>
          </div>
        )}

        {/* CONTEÚDO */}
        {!loading && !error && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            padding: "14px 20px 10px",
            position: "relative", zIndex: 10,
            maxHeight: "100vh",
          }}>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
                borderRadius: 24, padding: "8px 28px",
                border: "2px solid rgba(255,255,255,0.9)",
                boxShadow: "0 4px 24px rgba(255,107,157,0.2), inset 0 1px 0 rgba(255,255,255,0.9)",
                animation: bounce ? "tabPop .4s ease" : "shimmerCard 3s ease-in-out infinite",
              }}>
                <h1 style={{
                  fontFamily: "'Fredoka One',cursive",
                  fontSize: "clamp(22px,4vw,40px)",
                  background: "linear-gradient(135deg,#FF6B6B,#FFD700,#4ECDC4,#A855F7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: 2,
                  animation: "titleBounce 2.5s ease-in-out infinite",
                  display: "inline-block",
                }}>
                  🏆 RANKING DAS TURMAS 🏆
                </h1>
              </div>
              <div style={{
                fontFamily: "'Nunito',sans-serif", fontSize: 11, fontWeight: 800,
                color: "rgba(0,0,0,0.35)", letterSpacing: 3,
                textTransform: "uppercase", marginTop: 6,
              }}>
                📊 Frequência • {tab === "semanal" ? "Esta semana" : "Este mês"}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 14 }}>
              {["semanal","mensal"].map(t => {
                const active = tab === t;
                return (
                  <button key={t} onClick={() => doSwitch(t)} style={{
                    fontFamily: "'Fredoka One',cursive",
                    fontSize: 13, letterSpacing: 1,
                    padding: "8px 24px", borderRadius: 50,
                    border: active ? "none" : "2px solid rgba(0,0,0,0.1)",
                    background: active
                      ? "linear-gradient(135deg,#FF6B9D,#C44569)"
                      : "rgba(255,255,255,0.7)",
                    color: active ? "#fff" : "#999",
                    boxShadow: active
                      ? "0 4px 16px rgba(196,69,105,0.4), inset 0 1px 0 rgba(255,255,255,0.3)"
                      : "0 2px 8px rgba(0,0,0,0.08)",
                    transform: active ? "scale(1.05)" : "scale(1)",
                    transition: "all .3s cubic-bezier(.34,1.5,.64,1)",
                    position: "relative", overflow: "hidden",
                  }}>
                    {t === "semanal" ? "📅 Semanal" : "📆 Mensal"}
                    {active && (
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, height: 3,
                        width: `${cd}%`,
                        background: "rgba(255,255,255,0.6)",
                        transition: "width .12s linear",
                        borderRadius: 2,
                      }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Pódio */}
            <div style={{
              display: "flex", justifyContent: "center",
              alignItems: "flex-end", gap: 12, marginBottom: 14,
              opacity: transit ? 0 : 1,
              transform: transit ? "scale(.9) translateY(20px)" : "scale(1) translateY(0)",
              transition: "opacity .4s ease, transform .4s ease",
            }}>
              {[sorted[1], sorted[0], sorted[2]].map((t, i) => {
                if (!t) return null;
                const r = i === 0 ? 2 : i === 1 ? 1 : 3;
                return (
                  <PodiumBlock key={t.turma_id} turma={t} rank={r}
                    show={show && !transit} idx={r - 1} />
                );
              })}
            </div>

            {/* Divisor */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
            }}>
              <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg,transparent,#FFB3C6)", borderRadius: 1 }} />
              <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, animation: "floatUp 2s ease-in-out infinite" }}>🎊</span>
              <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg,#FFB3C6,transparent)", borderRadius: 1 }} />
            </div>

            {/* Lista */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              {sorted.map((t, i) => (
                <RankRow
                  key={t.turma_id}
                  turma={t}
                  rank={i + 1}
                  pct={t.porcentagem_presenca}
                  show={show && !transit}
                  delay={0.05 * i}
                />
              ))}
            </div>

            {/* Footer */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              paddingTop: 8, marginTop: 4,
              borderTop: "2px dashed rgba(255,107,157,0.2)",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.7)", borderRadius: 20,
                padding: "3px 10px", fontSize: 11,
                fontFamily: "'Nunito',sans-serif", fontWeight: 800,
                color: "#FF6B9D",
              }}>
                <span style={{ animation: "loadPulse 1s ease-in-out infinite", display: "inline-block" }}>🔴</span>
                Ao vivo
              </div>
              <div style={{
                fontFamily: "'Fredoka One',cursive", fontSize: 11,
                color: "rgba(0,0,0,0.3)", letterSpacing: 1,
              }}>
                🏅 {topTeam?.nome_fantasia} lidera com {parseFloat(topTeam?.porcentagem_presenca || 0).toFixed(2)}%
              </div>
              <div style={{
                fontFamily: "'Nunito',sans-serif", fontSize: 10,
                fontWeight: 800, color: "rgba(0,0,0,0.25)",
              }}>
                2025 • EDU 🎓
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
