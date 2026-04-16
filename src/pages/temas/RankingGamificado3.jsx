import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../services/api";


const TAB_MS = 12000;

// ── Paleta Mario ──────────────────────────────────────────────────────────────
const C = {
  sky:      "#5C94FC",
  skyDark:  "#3A6FD8",
  ground:   "#C84B10",
  groundD:  "#8B2500",
  brick:    "#C84B10",
  brickD:   "#8B3000",
  question: "#E8A000",
  questionD:"#B87000",
  pipe:     "#3A9B3A",
  pipeD:    "#206020",
  coin:     "#FFD700",
  coinD:    "#B8960C",
  red:      "#E52521",
  white:    "#FFFFFF",
  black:    "#000000",
  yellow:   "#FBD000",
  brown:    "#8B4513",
  cloud:    "#FFFFFF",
  hill:     "#52A833",
};

// ── Coins animados ────────────────────────────────────────────────────────────
const COINS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 8 + (i % 6) * 16,
  delay: i * 0.7,
  speed: 3 + (i % 3),
}));

// ── Estrelas de fundo ─────────────────────────────────────────────────────────
const BG_ITEMS = [
  { type: "cloud", x: 10, y: 12, scale: 1.2 },
  { type: "cloud", x: 55, y: 8,  scale: 0.9 },
  { type: "cloud", x: 78, y: 15, scale: 1.0 },
  { type: "hill",  x: 2,  y: 82, scale: 1.0 },
  { type: "hill",  x: 65, y: 80, scale: 1.3 },
  { type: "pipe",  x: 88, y: 68, scale: 1.0 },
  { type: "pipe",  x: 0,  y: 68, scale: 0.85 },
];

// ── SVGs Mario-style ──────────────────────────────────────────────────────────

// Mario pixel art (SVG simples estilo 8-bit)
function MarioSprite({ size = 32, jumping = false, color = C.red }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{
      imageRendering: "pixelated",
      transform: jumping ? "scaleX(-1)" : undefined,
    }}>
      {/* Chapéu */}
      <rect x="4" y="1" width="8" height="2" fill={color}/>
      <rect x="3" y="3" width="10" height="1" fill={color}/>
      {/* Rosto */}
      <rect x="3" y="4" width="10" height="5" fill="#FFB347"/>
      {/* Olhos */}
      <rect x="5" y="5" width="2" height="2" fill={C.black}/>
      <rect x="9" y="5" width="2" height="2" fill={C.black}/>
      {/* Bigode */}
      <rect x="4" y="7" width="8" height="1" fill={C.brown}/>
      {/* Roupa */}
      <rect x="4" y="9" width="8" height="4" fill="#1A5CC8"/>
      <rect x="2" y="10" width="3" height="3" fill={color}/>
      <rect x="11" y="10" width="3" height="3" fill={color}/>
      {/* Botões */}
      <rect x="7" y="10" width="2" height="1" fill={C.yellow}/>
      {/* Pés */}
      <rect x="3" y="13" width="4" height="2" fill={C.brown}/>
      <rect x="9" y="13" width="4" height="2" fill={C.brown}/>
    </svg>
  );
}

// Bloco ? amarelo
function QuestionBlock({ size = 32, broken = false, shaking = false }) {
  if (broken) {
    return (
      <div style={{ width: size, height: size, position: "relative" }}>
        {[
          { x: 0,    y: 0,    r: "-30deg", tx: -8, ty: -12 },
          { x: "50%",y: 0,    r: "20deg",  tx: 6,  ty: -14 },
          { x: 0,    y: "50%",r: "15deg",  tx: -10,ty: 8   },
          { x: "50%",y: "50%",r: "-25deg", tx: 8,  ty: 10  },
        ].map((piece, i) => (
          <div key={i} style={{
            position: "absolute", left: piece.x, top: piece.y,
            width: size * 0.42, height: size * 0.42,
            background: `linear-gradient(135deg, ${C.brick}, ${C.brickD})`,
            border: `2px solid ${C.brickD}`,
            borderRadius: 2,
            animation: `breakPiece${i + 1} 0.6s ease-out forwards`,
          }}/>
        ))}
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size,
      background: `linear-gradient(145deg, ${C.question}, ${C.questionD})`,
      border: `3px solid ${C.black}`,
      borderRadius: 4,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `inset -3px -3px 0 ${C.questionD}, inset 3px 3px 0 #FFD060`,
      animation: shaking ? "blockShake 0.4s ease-in-out" : undefined,
      position: "relative",
    }}>
      <span style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: size * 0.38, color: C.white,
        textShadow: `1px 1px 0 ${C.black}`,
        fontWeight: 900,
      }}>?</span>
    </div>
  );
}

// Cloud pixel
function Cloud({ scale = 1 }) {
  const s = scale;
  return (
    <svg width={80 * s} height={40 * s} viewBox="0 0 80 40">
      <rect x="20" y="20" width="40" height="20" fill="white"/>
      <rect x="10" y="10" width="20" height="30" fill="white"/>
      <rect x="50" y="10" width="20" height="30" fill="white"/>
      <rect x="15" y="5"  width="50" height="15" fill="white"/>
      <rect x="25" y="0"  width="30" height="10" fill="white"/>
    </svg>
  );
}

// Hill pixel
function Hill({ scale = 1 }) {
  return (
    <svg width={100 * scale} height={50 * scale} viewBox="0 0 100 50">
      <ellipse cx="50" cy="50" rx="50" ry="40" fill={C.hill}/>
      <ellipse cx="50" cy="50" rx="42" ry="34" fill="#5DBB3F"/>
    </svg>
  );
}

// Pipe SVG
function Pipe({ scale = 1 }) {
  return (
    <svg width={40 * scale} height={70 * scale} viewBox="0 0 40 70">
      <rect x="0"  y="0"  width="40" height="10" fill={C.pipeD}/>
      <rect x="4"  y="10" width="32" height="60" fill={C.pipe}/>
      <rect x="0"  y="0"  width="4"  height="10" fill={C.pipeD}/>
      <rect x="36" y="0"  width="4"  height="10" fill="#2D7A2D"/>
      <rect x="8"  y="10" width="4"  height="60" fill="#4DBC4D"/>
    </svg>
  );
}

// Coin SVG
function CoinSVG({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <ellipse cx="10" cy="10" rx="9" ry="9" fill={C.coin}/>
      <ellipse cx="10" cy="10" rx="6" ry="6" fill={C.coinD}/>
      <ellipse cx="10" cy="10" rx="3" ry="3" fill={C.coin}/>
    </svg>
  );
}

// ── TurmaLogo ─────────────────────────────────────────────────────────────────
function TurmaLogo({ fotoUrl, size, fantasia, isFirst }) {
  const bg = isFirst
    ? `linear-gradient(135deg, ${C.question}, ${C.questionD})`
    : `linear-gradient(135deg, ${C.brick}, ${C.brickD})`;
  if (fotoUrl) {
    return (
      <img src={fotoUrl} alt={fantasia} style={{
        width: size, height: size, borderRadius: "50%",
        objectFit: "cover", display: "block",
        border: `3px solid ${isFirst ? C.coin : C.black}`,
      }}/>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, border: `3px solid ${C.black}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Press Start 2P', monospace",
      fontSize: size * 0.22, color: C.white,
      textShadow: `1px 1px 0 ${C.black}`,
    }}>
      {fantasia.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── Pódio Mario ───────────────────────────────────────────────────────────────
function MarioPodium({ sorted, show, transit }) {
  const [phase, setPhase] = useState("idle"); // idle → jump → hit → broken → coins
  const [coinPos, setCoinPos] = useState([]);

  useEffect(() => {
    if (!show || transit) { setPhase("idle"); return; }
    const t1 = setTimeout(() => setPhase("jump"), 800);
    const t2 = setTimeout(() => setPhase("hit"),  1600);
    const t3 = setTimeout(() => {
      setPhase("broken");
      setCoinPos([
        { id: 0, x: -20, vy: -80 },
        { id: 1, x: 0,   vy: -100 },
        { id: 2, x: 20,  vy: -80 },
      ]);
    }, 2000);
    const t4 = setTimeout(() => setPhase("coins"), 2100);
    const t5 = setTimeout(() => {
      setPhase("idle");
      setCoinPos([]);
    }, 3200);
    return () => [t1,t2,t3,t4,t5].forEach(clearTimeout);
  }, [show, transit, sorted[0]?.turma_id]);

  const isSmall = window.innerHeight < 800;
  const H   = isSmall ? [90, 68, 52]  : [130, 96, 74];
  const SZ  = isSmall ? [52, 44, 38]  : [68, 56, 46];
  const MSZ = isSmall ? 22 : 28;

  const podiumColors = [
    { face: C.question,  side: C.questionD, top: "#FFD060" },
    { face: "#AAAAAA",   side: "#666666",   top: "#CCCCCC" },
    { face: C.brick,     side: C.brickD,    top: "#E86030" },
  ];

  // Posição do mario: 1=centro, 2=esquerda, 3=direita
  const marioX = [1, 0, 2]; // índice visual → posição no array [2º,1º,3º]

  return (
    <div style={{
      display: "flex", justifyContent: "center",
      alignItems: "flex-end", gap: 8,
      opacity: transit ? 0 : 1,
      transform: transit ? "scale(.92) translateY(16px)" : "scale(1)",
      transition: "opacity .4s, transform .4s",
      position: "relative",
    }}>
      {[sorted[1], sorted[0], sorted[2]].map((t, vi) => {
        if (!t) return null;
        const rank = vi === 0 ? 2 : vi === 1 ? 1 : 3;
        const pc = podiumColors[rank - 1];
        const delay = rank === 1 ? 0.05 : rank === 2 ? 0.3 : 0.55;
        const isFirst = rank === 1;

        return (
          <div key={t.turma_id} style={{
            order: rank === 1 ? 2 : rank === 2 ? 1 : 3,
            display: "flex", flexDirection: "column", alignItems: "center",
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(60px) scale(0.7)",
            transition: `opacity .7s ease ${delay}s, transform .7s cubic-bezier(.34,1.6,.64,1) ${delay}s`,
            position: "relative",
          }}>

            {/* ── SEQUÊNCIA MARIO 1º LUGAR ── */}
            {isFirst && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                position: "relative",
              }}>
                {/* Bloco ? ou quebrado + coins */}
                <div style={{
                  position: "relative",
                  marginBottom: 4,
                  animation: phase === "hit" ? "blockHit 0.2s ease-out" : undefined,
                }}>
                  {phase !== "broken" && phase !== "coins" ? (
                    <QuestionBlock size={isSmall ? 28 : 36} shaking={phase === "hit"}/>
                  ) : (
                    <QuestionBlock size={isSmall ? 28 : 36} broken />
                  )}

                  {/* Coins saindo */}
                  {(phase === "broken" || phase === "coins") && coinPos.map(cp => (
                    <div key={cp.id} style={{
                      position: "absolute",
                      top: "50%", left: "50%",
                      animation: `coinFly 0.8s ease-out forwards`,
                      animationDelay: `${cp.id * 0.06}s`,
                      zIndex: 20,
                    }}>
                      <CoinSVG size={14}/>
                    </div>
                  ))}
                </div>

                {/* Mario pulando */}
                <div style={{
                  animation:
                    phase === "jump" ? "marioJump 0.8s cubic-bezier(.34,1.5,.64,1)" :
                    phase === "hit"  ? "marioJumpHit 0.4s ease-out" :
                    "marioIdle 1.6s ease-in-out infinite",
                  transformOrigin: "bottom center",
                }}>
                  <MarioSprite size={MSZ} jumping={phase === "jump" || phase === "hit"} color={C.red}/>
                </div>
              </div>
            )}

            {/* Medalha / coroa */}
            {!isFirst && (
              <div style={{
                fontSize: isSmall ? 18 : 22,
                marginBottom: 4,
                animation: "floatUpDown 2s ease-in-out infinite",
                animationDelay: `${rank * 0.3}s`,
              }}>
                {rank === 2 ? "🥈" : "🥉"}
              </div>
            )}

            {/* Avatar */}
            <div style={{ marginBottom: 6 }}>
              <TurmaLogo
                fotoUrl={t.foto_url} size={SZ[rank - 1]}
                fantasia={t.nome_fantasia} isFirst={isFirst}
              />
            </div>

            {/* Nome */}
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: isSmall ? 6 : 7,
              color: C.white,
              textShadow: `1px 1px 0 ${C.black}, -1px -1px 0 ${C.black}`,
              textAlign: "center", marginBottom: 3,
              maxWidth: 110,
              lineHeight: 1.6,
            }}>
              {t.nome_fantasia}
            </div>

            {/* % em moeda */}
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              background: C.black, border: `2px solid ${C.coin}`,
              borderRadius: 4, padding: "3px 8px",
              marginBottom: 8,
            }}>
              <CoinSVG size={12}/>
              <span style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: isSmall ? 7 : 8,
                color: C.coin,
              }}>
                {parseFloat(t.porcentagem_presenca).toFixed(2)}%
              </span>
            </div>

            {/* Bloco do pódio estilo tijolo Mario */}
            <div style={{
              width: rank === 1 ? 112 : rank === 2 ? 88 : 74,
              height: H[rank - 1],
              position: "relative",
              flexShrink: 0,
            }}>
              {/* Face frontal */}
              <div style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(180deg, ${pc.top} 0%, ${pc.face} 20%, ${pc.face} 100%)`,
                border: `3px solid ${C.black}`,
                borderRadius: "4px 4px 0 0",
              }}/>
              {/* Grade de tijolos */}
              {Array.from({ length: Math.floor(H[rank-1] / 18) }).map((_, row) =>
                Array.from({ length: 3 }).map((_, col) => (
                  <div key={`${row}-${col}`} style={{
                    position: "absolute",
                    top: 8 + row * 18,
                    left: col % 2 === (row % 2) ? 4 : 20,
                    width: 28, height: 14,
                    border: `1.5px solid ${pc.side}`,
                    borderRadius: 2,
                    opacity: 0.4,
                  }}/>
                ))
              )}
              {/* Número */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: rank === 1 ? 32 : 24,
                  color: C.white,
                  textShadow: `2px 2px 0 ${C.black}, -1px -1px 0 ${C.black}`,
                }}>
                  {rank}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Linha do ranking ──────────────────────────────────────────────────────────
function RankRow({ turma, rank, pct, show, delay }) {
  const isTop3 = rank <= 3;
  const rowColors = [
    { bg: "#FFF9C4", border: C.coin,    bar: `linear-gradient(90deg,${C.question},${C.coin})` },
    { bg: "#F5F5F5", border: "#AAAAAA", bar: "linear-gradient(90deg,#AAAAAA,#DDDDDD)" },
    { bg: "#FFF0E0", border: C.brick,   bar: `linear-gradient(90deg,${C.brick},#E86030)` },
  ];
  const rowC = isTop3 ? rowColors[rank - 1] : null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px", marginBottom: 5, borderRadius: 6,
      background: isTop3 ? rowC.bg : "rgba(255,255,255,0.85)",
      border: `2px solid ${isTop3 ? rowC.border : C.black}`,
      boxShadow: `3px 3px 0 ${isTop3 ? rowC.border : C.black}`,
      opacity: show ? 1 : 0,
      transform: show ? "translateX(0)" : "translateX(-40px)",
      transition: `opacity .5s ease ${delay}s, transform .5s cubic-bezier(.34,1.4,.64,1) ${delay}s`,
    }}>
      {/* Rank badge */}
      <div style={{
        minWidth: 36, height: 36, borderRadius: 4,
        background: isTop3
          ? `linear-gradient(135deg, ${rowC.border}, ${C.black})`
          : `linear-gradient(135deg, ${C.brick}, ${C.brickD})`,
        border: `2px solid ${C.black}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: `2px 2px 0 ${C.black}`,
      }}>
        {isTop3 ? (
          <span style={{ fontSize: 18 }}>
            {["🥇","🥈","🥉"][rank - 1]}
          </span>
        ) : (
          <span style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 9, color: C.coin,
            textShadow: `1px 1px 0 ${C.black}`,
          }}>#{rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: `2px solid ${C.black}`,
        overflow: "hidden", flexShrink: 0,
        boxShadow: `2px 2px 0 ${C.black}`,
      }}>
        <TurmaLogo fotoUrl={turma.foto_url} size={32} fantasia={turma.nome_fantasia} isFirst={rank === 1}/>
      </div>

      {/* Info + barra */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 5,
        }}>
          <span style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 7, color: C.black,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            maxWidth: 160,
            lineHeight: 1.5,
          }}>
            {turma.nome_fantasia}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0, marginLeft: 6 }}>
            <CoinSVG size={11}/>
            <span style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 8, color: isTop3 ? C.questionD : C.black,
            }}>
              {parseFloat(pct).toFixed(2)}%
            </span>
          </div>
        </div>
        {/* Barra */}
        <div style={{
          height: 8, borderRadius: 2,
          background: "rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: show ? `${Math.min(parseFloat(pct), 100)}%` : "0%",
            transition: `width 1.2s cubic-bezier(.16,1,.3,1) ${delay + 0.15}s`,
            background: isTop3 ? rowC.bar : `linear-gradient(90deg,${C.pipe},${C.hill})`,
            borderRadius: 2,
          }}/>
        </div>
      </div>
    </div>
  );
}

// ── Ground tiles ──────────────────────────────────────────────────────────────
function GroundBar() {
  const tiles = 20;
  return (
    <div style={{
      display: "flex", width: "100%",
      borderTop: `3px solid ${C.black}`,
      flexShrink: 0,
    }}>
      {Array.from({ length: tiles }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 14,
          background: i % 2 === 0 ? C.ground : C.groundD,
          borderRight: `1px solid ${C.black}`,
        }}/>
      ))}
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function MarioRanking() {
  const [tab,     setTab]     = useState("semanal");
  const [show,    setShow]    = useState(false);
  const [transit, setTransit] = useState(false);
  const [cd,      setCd]      = useState(100);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [dataMap, setDataMap] = useState({ semanal: [], mensal: [] });
  const [score,   setScore]   = useState(0);

  const cdRef   = useRef(100);
  const cdInter = useRef(null);
  const tabRef  = useRef("semanal");
  const autoRef = useRef(null);

  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const [r1, r2] = await Promise.all([
        apiFetch(`/ranking?tipo=semanal`),
        apiFetch(`/ranking?tipo=mensal`),
      ]);
      if (!r1.ok || !r2.ok) throw new Error(`HTTP ${r1.status}`);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      const sort = arr =>
        [...arr].sort((a,b) => parseFloat(b.porcentagem_presenca) - parseFloat(a.porcentagem_presenca));
      setDataMap({ semanal: sort(d1), mensal: sort(d2) });
      setScore(prev => prev + 100);
    } catch (e) {
      setError(e.message || "Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (loading || error) return;
    setTimeout(() => setShow(true), 300);
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
    const step = 100 / (TAB_MS / 100);
    cdInter.current = setInterval(() => {
      cdRef.current -= step;
      if (cdRef.current <= 0) { cdRef.current = 100; setCd(100); setScore(p => p + 50); }
      else setCd(cdRef.current);
    }, 100);
  };

  const doSwitch = (next) => {
    if (transit) return;
    setTransit(true); setShow(false);
    setTimeout(() => {
      tabRef.current = next;
      setTab(next);
      setTransit(false);
      setShow(true);
      resetCd();
      setScore(p => p + 200);
    }, 450);
  };

  const sorted  = dataMap[tab] || [];
  const topTeam = sorted[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        *,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }
        html,body { width:100%; height:100%; overflow:hidden; }

        /* Mario jump */
        @keyframes marioIdle {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-3px); }
        }
        @keyframes marioJump {
          0%   { transform: translateY(0) scaleX(1); }
          30%  { transform: translateY(-52px) scaleX(-1); }
          60%  { transform: translateY(-72px) scaleX(-1); }
          85%  { transform: translateY(-52px) scaleX(-1); }
          100% { transform: translateY(0) scaleX(1); }
        }
        @keyframes marioJumpHit {
          0%   { transform: translateY(-52px); }
          50%  { transform: translateY(-60px); }
          100% { transform: translateY(0); }
        }

        /* Bloco tremendo ao ser atingido */
        @keyframes blockHit {
          0%   { transform: translateY(0); }
          25%  { transform: translateY(-10px); }
          75%  { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        @keyframes blockShake {
          0%,100% { transform: translateX(0); }
          25%     { transform: translateX(-4px) translateY(-4px); }
          75%     { transform: translateX(4px)  translateY(-4px); }
        }

        /* Pedaços do bloco voando */
        @keyframes breakPiece1 {
          0%   { transform: translate(0,0) rotate(0deg); opacity:1; }
          100% { transform: translate(-28px,-32px) rotate(-180deg); opacity:0; }
        }
        @keyframes breakPiece2 {
          0%   { transform: translate(0,0) rotate(0deg); opacity:1; }
          100% { transform: translate(28px,-36px) rotate(160deg); opacity:0; }
        }
        @keyframes breakPiece3 {
          0%   { transform: translate(0,0) rotate(0deg); opacity:1; }
          100% { transform: translate(-24px, 20px) rotate(-120deg); opacity:0; }
        }
        @keyframes breakPiece4 {
          0%   { transform: translate(0,0) rotate(0deg); opacity:1; }
          100% { transform: translate(24px, 18px) rotate(140deg); opacity:0; }
        }

        /* Coin saindo do bloco */
        @keyframes coinFly {
          0%   { transform: translate(-7px,-7px) scale(0); opacity:1; }
          40%  { transform: translate(-7px,-44px) scale(1.4); opacity:1; }
          100% { transform: translate(-7px,-60px) scale(0.6); opacity:0; }
        }

        /* Coin flutuando no topo */
        @keyframes coinFloat {
          0%,100% { transform: translateY(0) scaleX(1); }
          25%     { transform: translateY(-6px) scaleX(0.6); }
          50%     { transform: translateY(-10px) scaleX(0.3); }
          75%     { transform: translateY(-6px) scaleX(0.6); }
        }

        /* Nuvem se movendo */
        @keyframes cloudDrift {
          0%   { transform: translateX(0); }
          100% { transform: translateX(110vw); }
        }

        /* Título piscando estilo Mario */
        @keyframes titleFlash {
          0%,49%  { color: ${C.white}; }
          50%,100%{ color: ${C.yellow}; }
        }

        @keyframes floatUpDown {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-5px); }
        }

        @keyframes scoreUp {
          0%   { transform: translateY(0); opacity:1; }
          100% { transform: translateY(-20px); opacity:0; }
        }

        @keyframes groundScroll {
          0%   { background-position: 0 0; }
          100% { background-position: -80px 0; }
        }

        button { outline:none; cursor:pointer; }
        ::-webkit-scrollbar { display:none; }
      `}</style>

      <div style={{
        width: "100vw", height: "100vh",
        background: C.sky,
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column",
        fontFamily: "'Press Start 2P', monospace",
        imageRendering: "pixelated",
      }}>

        {/* Nuvens de fundo */}
        {BG_ITEMS.filter(b => b.type === "cloud").map((b, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${b.x}%`, top: `${b.y}%`,
            opacity: 0.85,
            animation: `cloudDrift ${28 + i * 6}s ${i * 4}s linear infinite`,
            pointerEvents: "none", zIndex: 1,
          }}>
            <Cloud scale={b.scale}/>
          </div>
        ))}

        {/* Morros */}
        {BG_ITEMS.filter(b => b.type === "hill").map((b, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${b.x}%`, bottom: "6%",
            pointerEvents: "none", zIndex: 1, opacity: 0.7,
          }}>
            <Hill scale={b.scale}/>
          </div>
        ))}

        {/* Canos */}
        {BG_ITEMS.filter(b => b.type === "pipe").map((b, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${b.x}%`, bottom: "4%",
            pointerEvents: "none", zIndex: 2,
          }}>
            <Pipe scale={b.scale}/>
          </div>
        ))}

        {/* Moedas flutuando no topo */}
        {COINS.map(c => (
          <div key={c.id} style={{
            position: "absolute",
            left: `${c.x}%`, top: "4%",
            animation: `coinFloat ${c.speed}s ${c.delay}s ease-in-out infinite`,
            zIndex: 3, pointerEvents: "none",
          }}>
            <CoinSVG size={16}/>
          </div>
        ))}

        {/* HUD topo — estilo NES */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          padding: "6px 16px 4px",
          background: "rgba(0,0,0,0.55)",
          zIndex: 30, flexShrink: 0,
        }}>
          <div style={{ fontSize: 8, color: C.white, lineHeight: 1.8 }}>
            <div style={{ color: "#FBD000" }}>MARIO</div>
            <div>{String(score).padStart(6, "0")}</div>
          </div>
          <div style={{ fontSize: 8, color: C.white, lineHeight: 1.8, textAlign: "center" }}>
            <div style={{ color: "#FBD000" }}>TURMA</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
              <CoinSVG size={10}/> × {sorted.length}
            </div>
          </div>
          <div style={{ fontSize: 8, color: C.white, lineHeight: 1.8, textAlign: "right" }}>
            <div style={{ color: "#FBD000" }}>TEMPO</div>
            <div style={{ color: Math.round(cd / 10) < 20 ? "#FF4040" : C.white }}>
              {String(Math.max(0, Math.round(cd / 10))).padStart(3, "0")}
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 50,
            background: C.black,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 24,
          }}>
            <div style={{ fontSize: 48 }}>
              <MarioSprite size={64} color={C.red}/>
            </div>
            <div style={{
              fontSize: 11, color: C.white, letterSpacing: 2,
              animation: "titleFlash 0.8s step-end infinite",
            }}>CARREGANDO...</div>
            <div style={{ fontSize: 8, color: C.coin }}>
              © 2026 CLASSPULSE
            </div>
          </div>
        )}

        {/* ERRO */}
        {!loading && error && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 50,
            background: C.black,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 20,
          }}>
            <div style={{ fontSize: 10, color: "#FF4040", letterSpacing: 2 }}>GAME OVER</div>
            <div style={{ fontSize: 7, color: C.white }}>{error}</div>
            <button onClick={fetchAll} style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 9, padding: "10px 24px",
              background: C.question, color: C.black,
              border: `3px solid ${C.black}`,
              borderRadius: 4,
              boxShadow: `4px 4px 0 ${C.black}`,
            }}>CONTINUAR?</button>
          </div>
        )}

        {/* CONTEÚDO */}
        {!loading && !error && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            padding: "10px 16px 0",
            position: "relative", zIndex: 10,
            overflow: "hidden",
          }}>

            {/* Título */}
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <div style={{
                display: "inline-block",
                background: C.red,
                border: `3px solid ${C.black}`,
                borderRadius: 6,
                padding: "6px 20px",
                boxShadow: `4px 4px 0 ${C.black}`,
              }}>
                <h1 style={{
                  fontSize: "clamp(10px, 2.2vw, 18px)",
                  color: C.white,
                  textShadow: `2px 2px 0 ${C.black}`,
                  letterSpacing: 2,
                  animation: "titleFlash 1.4s step-end infinite",
                }}>
                  ★ RANKING DAS TURMAS ★
                </h1>
              </div>
              <div style={{
                fontSize: 7, color: C.white,
                textShadow: `1px 1px 0 ${C.black}`,
                letterSpacing: 2, marginTop: 5,
              }}>
                PRESENÇA • {tab === "semanal" ? "ESTA SEMANA" : "ESTE MES"}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 12 }}>
              {["semanal","mensal"].map(t => {
                const active = tab === t;
                return (
                  <button key={t} onClick={() => doSwitch(t)} style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 8, letterSpacing: 1,
                    padding: "7px 18px",
                    background: active ? C.question : C.brick,
                    color: active ? C.black : C.white,
                    border: `3px solid ${C.black}`,
                    borderRadius: 4,
                    boxShadow: active ? `4px 4px 0 ${C.black}` : `2px 2px 0 ${C.black}`,
                    transform: active ? "translateY(-2px)" : "none",
                    transition: "all .15s",
                    position: "relative", overflow: "hidden",
                  }}>
                    {t === "semanal" ? "SEMANAL" : "MENSAL"}
                    {active && (
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, height: 3,
                        width: `${cd}%`,
                        background: C.red,
                        transition: "width .1s linear",
                      }}/>
                    )}
                  </button>
                );
              })}
            </div>

            {/* PÓDIO */}
            <MarioPodium sorted={sorted} show={show} transit={transit}/>

            {/* Ground do pódio */}
            <GroundBar/>

            {/* Divisor moedas */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 6, padding: "6px 0 8px",
              background: "rgba(0,0,0,0.35)",
            }}>
              {[...Array(7)].map((_, i) => (
                <div key={i} style={{ animation: `coinFloat ${1.2 + i * 0.15}s ${i * 0.1}s ease-in-out infinite` }}>
                  <CoinSVG size={14}/>
                </div>
              ))}
              <span style={{ fontSize: 7, color: C.coin, margin: "0 6px", letterSpacing: 2 }}>
                PLACAR COMPLETO
              </span>
              {[...Array(7)].map((_, i) => (
                <div key={i} style={{ animation: `coinFloat ${1.2 + i * 0.15}s ${i * 0.1}s ease-in-out infinite` }}>
                  <CoinSVG size={14}/>
                </div>
              ))}
            </div>

            {/* Lista */}
            <div style={{ flex: 1, overflow: "hidden", padding: "4px 0" }}>
              {sorted.map((t, i) => (
                <RankRow
                  key={t.turma_id}
                  turma={t}
                  rank={i + 1}
                  pct={t.porcentagem_presenca}
                  show={show && !transit}
                  delay={0.055 * i}
                />
              ))}
            </div>

            {/* Footer ground */}
            <div style={{ marginTop: "auto" }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "4px 8px",
                background: "rgba(0,0,0,0.5)",
                fontSize: 7, color: C.coin,
              }}>
                <span>★ {topTeam?.nome_fantasia}</span>
                <span>LIDER: {parseFloat(topTeam?.porcentagem_presenca || 0).toFixed(2)}%</span>
                <span>2025 ★</span>
              </div>
              <GroundBar/>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
