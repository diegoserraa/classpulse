import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../services/Api";


const MEDAL_C = ["#FFD700", "#C0C0C0", "#CD7F32"];
const MEDAL_G = ["#FFD700cc", "#E8E8E8cc", "#E8A058cc"];

const PARTS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 9,
  speed: Math.random() * 16 + 9,
  size: Math.random() * 2.4 + 0.8,
  color: ["#00f5ff","#7c3aed","#f59e0b","#10b981","#f43f5e","#FFD700"][i % 6],
}));

const TAB_MS = 11000;

const RANK_COLORS = [
  "#FFD700","#C0C0C0","#CD7F32","#00f5ff","#a855f7",
  "#10b981","#f43f5e","#ff6b35","#7c3aed","#f59e0b",
];

// ─── Logo com imagem base64 ou fallback de iniciais ───────────────────────────
function TurmaLogo({ fotoUrl, size = 48, cor = "#00f5ff", fantasia = "" }) {
  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={fantasia}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `${cor}22`, border: `2px solid ${cor}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Orbitron',monospace", fontSize: size * 0.28,
      fontWeight: 900, color: cor,
    }}>
      {fantasia.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ─── Partícula flutuante ──────────────────────────────────────────────────────
function Dot({ p }) {
  return (
    <div style={{
      position: "absolute", left: `${p.x}%`, bottom: "-6px",
      width: p.size, height: p.size, borderRadius: "50%",
      background: p.color, boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
      animation: `rise ${p.speed}s ${p.delay}s infinite linear`,
      opacity: 0, pointerEvents: "none",
    }} />
  );
}

// ─── Bloco do pódio (estrutura 100% original) ─────────────────────────────────
function PodiumBlock({ turma, rank, show }) {
  const isSmallHeight = window.innerHeight < 800;
  const H  = isSmallHeight ? [110, 85, 65]  : [150, 110, 85];
  const SZ = isSmallHeight ? [58, 50, 42]   : [70, 58, 50];
  const FS = [15, 12, 11];
  const mc = MEDAL_C[rank - 1];
  const mg = MEDAL_G[rank - 1];
  const ord = rank === 1 ? 2 : rank === 2 ? 1 : 3;
  const delay = rank === 1 ? 0.05 : rank === 2 ? 0.3 : 0.55;

  return (
    <div style={{
      order: ord,
      display: "flex", flexDirection: "column", alignItems: "center",
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0) scale(1)" : "translateY(70px) scale(0.72)",
      transition: `opacity .85s ease ${delay}s, transform .85s cubic-bezier(.34,1.5,.64,1) ${delay}s`,
    }}>
      {rank === 1 && (
        <div style={{ fontSize: 20, animation: "crownSpin 2.8s ease-in-out infinite", marginBottom: 2 }}>👑</div>
      )}

      <div style={{
        width: SZ[rank - 1], height: SZ[rank - 1], borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${mg}44, ${mc}18)`,
        border: `3px solid ${mc}`,
        boxShadow: `0 0 20px ${mg}, 0 0 40px ${mc}44, inset 0 0 16px ${mc}1a`,
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: `logoFloat${rank} ${rank === 1 ? 2.4 : 3}s ease-in-out infinite`,
        overflow: "hidden", flexShrink: 0, marginBottom: 8,
      }}>
        <TurmaLogo
          fotoUrl={turma.foto_url}
          size={SZ[rank - 1] * 0.92}
          cor={mc}
          fantasia={turma.nome_fantasia}
        />
      </div>

      <div style={{
        fontFamily: "'Orbitron',monospace", fontSize: FS[rank - 1],
        fontWeight: 900, color: "#fff", letterSpacing: 3,
        textShadow: `0 0 12px ${mc}`, marginBottom: 3, textAlign: "center",
      }}>
        {turma.nome_fantasia}
      </div>

      <div style={{
        fontFamily: "'Orbitron',monospace", fontSize: rank === 1 ? 12 : 10,
        fontWeight: 700, color: mc, textShadow: `0 0 10px ${mc}`,
        letterSpacing: 2, marginBottom: 10,
      }}>
        {["1º LUGAR", "2º LUGAR", "3º LUGAR"][rank - 1]}
      </div>

      <div style={{
        width: rank === 1 ? 118 : rank === 2 ? 94 : 80, height: H[rank - 1],
        background: `linear-gradient(180deg,${mc}30 0%,${mc}18 55%,${mc}08 100%)`,
        border: `2px solid ${mc}55`, borderBottom: "none",
        borderRadius: "10px 10px 0 0",
        boxShadow: `0 0 22px ${mc}2a, inset 0 0 22px ${mc}18`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-start",
        paddingTop: 14, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(180deg,${mc}28 0%,transparent 100%)`,
          animation: "shimmerBlock 2.6s ease-in-out infinite",
        }} />
        <span style={{
          fontFamily: "'Orbitron',monospace",
          fontSize: rank === 1 ? 38 : 28, fontWeight: 900,
          color: mc, textShadow: `0 0 22px ${mc}`,
          position: "relative", zIndex: 1,
        }}>
          {["①", "②", "③"][rank - 1]}
        </span>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: "absolute", left: "14%", right: "14%",
            bottom: 20 + i * 16, height: 1,
            background: `linear-gradient(90deg,transparent,${mc}3a,transparent)`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Linha da lista de ranking ────────────────────────────────────────────────
function RankRow({ turma, rank, pct, show, delay }) {
  const isTop = rank <= 3;
  const mc = isTop ? MEDAL_C[rank - 1] : (RANK_COLORS[rank - 1] || "#00f5ff");

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 13,
      padding: "10px 16px", marginBottom: 6, borderRadius: 12,
      background: isTop ? `linear-gradient(90deg,${mc}16,transparent 70%)` : "rgba(255,255,255,0.032)",
      border: `1px solid ${isTop ? mc + "4a" : "rgba(255,255,255,0.06)"}`,
      opacity: show ? 1 : 0,
      transform: show ? "translateX(0)" : "translateX(-46px)",
      transition: `opacity .6s ease ${delay}s, transform .6s cubic-bezier(.34,1.2,.64,1) ${delay}s`,
      overflow: "hidden",
    }}>
      <div style={{
        minWidth: 36, textAlign: "center",
        fontFamily: "'Orbitron',monospace", fontSize: 12,
        fontWeight: 900, color: isTop ? mc : "rgba(255,255,255,0.4)",
        textShadow: isTop ? `0 0 10px ${mc}` : "none", flexShrink: 0,
      }}>
        {isTop ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
      </div>

      <div style={{
        width: 38, height: 38, borderRadius: "50%",
        border: `2px solid ${mc}77`,
        boxShadow: `0 0 10px ${mc}33`,
        background: `radial-gradient(circle,${mc}15,transparent)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", flexShrink: 0,
      }}>
        <TurmaLogo fotoUrl={turma.foto_url} size={34} cor={mc} fantasia={turma.nome_fantasia} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: 5,
        }}>
          <span style={{
            fontFamily: "'Orbitron',monospace", fontSize: 11,
            fontWeight: 700, color: "#fff", letterSpacing: 1.5,
            whiteSpace: "nowrap",
          }}>
            {turma.nome_fantasia}
          </span>
          <span style={{
            fontFamily: "'Orbitron',monospace", fontSize: 13,
            fontWeight: 900, color: mc, textShadow: `0 0 10px ${mc}`,
            letterSpacing: 1,
          }}>
            {parseFloat(pct).toFixed(2)}%
          </span>
        </div>

        <div style={{
          height: 6, borderRadius: 3,
          background: "rgba(255,255,255,0.07)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            width: show ? `${Math.min(parseFloat(pct), 100)}%` : "0%",
            transition: `width 1.4s cubic-bezier(.16,1,.3,1) ${delay + 0.2}s`,
            background: `linear-gradient(90deg,${mc}bb,${mc})`,
            boxShadow: `0 0 8px ${mc}`,
            borderRadius: 3,
          }} />
          <div style={{
            position: "absolute",
            left: show ? `calc(${Math.min(parseFloat(pct), 100)}% - 3px)` : "0%",
            top: "50%", transform: "translateY(-50%)",
            width: 6, height: 6, borderRadius: "50%",
            background: mc, boxShadow: `0 0 8px ${mc}`,
            transition: `left 1.4s cubic-bezier(.16,1,.3,1) ${delay + 0.2}s`,
          }} />
        </div>

        <div style={{
          fontFamily: "'Rajdhani',sans-serif", fontSize: 10,
          color: "rgba(255,255,255,0.25)", letterSpacing: 1, marginTop: 3,
        }}>
          {turma.nome}
        </div>
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function ClassRanking() {
  const [tab,     setTab]     = useState("semanal");
  const [show,    setShow]    = useState(false);
  const [transit, setTransit] = useState(false);
  const [cd,      setCd]      = useState(100);
  const [glitch,  setGlitch]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [dataMap, setDataMap] = useState({ semanal: [], mensal: [] });

  const cdRef     = useRef(100);
  const cdInter   = useRef(null);
  const tabRef    = useRef("semanal");
  const autoRef   = useRef(null);
  const glitchRef = useRef(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resSem, resMen] = await Promise.all([
        apiFetch(`/ranking?tipo=semanal`),
        apiFetch(`/ranking?tipo=mensal`),
      ]);
      if (!resSem.ok || !resMen.ok) throw new Error(`Erro HTTP ${resSem.status}`);
      const [dataSem, dataMen] = await Promise.all([resSem.json(), resMen.json()]);

      const sort = arr =>
        [...arr].sort((a, b) =>
          parseFloat(b.porcentagem_presenca) - parseFloat(a.porcentagem_presenca)
        );

      setDataMap({ semanal: sort(dataSem), mensal: sort(dataMen) });
    } catch (e) {
      setError(e.message || "Falha na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (loading || error) return;

    setTimeout(() => setShow(true), 180);
    resetCd();

    autoRef.current = setInterval(() => {
      const next = tabRef.current === "semanal" ? "mensal" : "semanal";
      doSwitch(next);
    }, TAB_MS);

    glitchRef.current = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 240);
    }, 10000);

    return () => {
      clearInterval(autoRef.current);
      clearInterval(cdInter.current);
      clearInterval(glitchRef.current);
    };
  }, [loading, error]);

  const resetCd = () => {
    clearInterval(cdInter.current);
    cdRef.current = 100;
    setCd(100);
    const step = 100 / (TAB_MS / 150);
    cdInter.current = setInterval(() => {
      cdRef.current -= step;
      if (cdRef.current <= 0) { cdRef.current = 100; setCd(100); }
      else setCd(cdRef.current);
    }, 150);
  };

  const doSwitch = (next) => {
    if (transit) return;
    setGlitch(true);
    setTransit(true);
    setShow(false);
    setTimeout(() => setGlitch(false), 280);
    setTimeout(() => {
      tabRef.current = next;
      setTab(next);
      setTransit(false);
      setShow(true);
      resetCd();
    }, 480);
  };

  const sorted  = dataMap[tab] || [];
  const topTeam = sorted[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        html,body{width:100%;height:100%;overflow:hidden;background:#000;}

        @keyframes rise {
          0%  {transform:translateY(0) scale(1);opacity:0;}
          8%  {opacity:.75;}
          92% {opacity:.45;}
          100%{transform:translateY(-100vh) scale(.35) rotate(360deg);opacity:0;}
        }
        @keyframes crownSpin {
          0%,100%{transform:rotate(-12deg) scale(1);}
          50%    {transform:rotate(12deg) scale(1.28);}
        }
        @keyframes logoFloat1 {
          0%,100%{transform:translateY(0) scale(1);}
          50%    {transform:translateY(-11px) scale(1.04);}
        }
        @keyframes logoFloat2 {
          0%,100%{transform:translateY(0);}
          50%    {transform:translateY(-7px);}
        }
        @keyframes logoFloat3 {
          0%,100%{transform:translateY(0);}
          50%    {transform:translateY(-4px);}
        }
        @keyframes shimmerBlock {
          0%,100%{opacity:.25;}
          50%    {opacity:.7;}
        }
        @keyframes scan {
          0%  {transform:translateY(-100%);opacity:.55;}
          100%{transform:translateY(120vh);opacity:0;}
        }
        @keyframes titlePulse {
          0%,100%{text-shadow:0 0 16px #00f5ff,0 0 32px #00f5ff55;}
          50%    {text-shadow:0 0 24px #7c3aed,0 0 48px #7c3aed88,0 0 80px #7c3aed33;}
        }
        @keyframes glitchShift {
          0%,100%{clip-path:inset(0 0 0 0);transform:none;}
          20%{clip-path:inset(14% 0 66% 0);transform:translateX(-6px);color:#f43f5e;}
          40%{clip-path:inset(62% 0 12% 0);transform:translateX(6px);color:#00f5ff;}
          60%{clip-path:inset(28% 0 52% 0);transform:translateX(-3px);color:#FFD700;}
          80%{clip-path:inset(82% 0 4% 0);transform:translateX(3px);color:#f43f5e;}
        }
        @keyframes borderAura {
          0%,100%{box-shadow:0 0 28px rgba(0,245,255,.12),0 0 56px rgba(124,58,237,.08);}
          50%    {box-shadow:0 0 50px rgba(0,245,255,.3),0 0 100px rgba(124,58,237,.2);}
        }
        @keyframes gridDrift {
          0%  {background-position:0 0;}
          100%{background-position:48px 48px;}
        }
        @keyframes cornerBlink {
          0%,100%{opacity:.32;}
          50%    {opacity:.72;}
        }
        @keyframes spin {
          to{transform:rotate(360deg);}
        }
        button{outline:none;cursor:pointer;}
        ::-webkit-scrollbar{display:none;}
      `}</style>

      <div style={{
        width: "100vw", height: "100vh",
        background: "radial-gradient(ellipse 130% 90% at 50% -5%, #07001a 0%, #000612 45%, #000000 100%)",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column",
        animation: "borderAura 4.5s ease-in-out infinite",
      }}>

        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(0,245,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,.022) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
          animation: "gridDrift 14s linear infinite",
        }} />

        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 80% at 50% 50%,transparent 50%,rgba(0,0,0,.72) 100%)",
        }} />

        <div style={{
          position: "absolute", left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg,transparent,rgba(0,245,255,.5),transparent)",
          animation: "scan 5.5s linear infinite",
          pointerEvents: "none", zIndex: 20,
        }} />

        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 18,
          background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.055) 3px,rgba(0,0,0,.055) 4px)",
        }} />

        {PARTS.map(p => <Dot key={p.id} p={p} />)}

        {[
          { top: 14, left: 14,     borderTop: "2px solid #00f5ff",    borderLeft: "2px solid #00f5ff" },
          { top: 14, right: 14,    borderTop: "2px solid #00f5ff",    borderRight: "2px solid #00f5ff" },
          { bottom: 14, left: 14,  borderBottom: "2px solid #7c3aed", borderLeft: "2px solid #7c3aed" },
          { bottom: 14, right: 14, borderBottom: "2px solid #7c3aed", borderRight: "2px solid #7c3aed" },
        ].map((s, i) => (
          <div key={i} style={{
            position: "absolute", ...s, width: 44, height: 44, borderRadius: 4,
            animation: "cornerBlink 3s ease-in-out infinite",
            animationDelay: `${i * 0.45}s`,
            pointerEvents: "none", zIndex: 22,
          }} />
        ))}

        {/* LOADING */}
        {loading && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 30,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 20,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              border: "3px solid rgba(0,245,255,0.15)",
              borderTop: "3px solid #00f5ff",
              animation: "spin 0.9s linear infinite",
            }} />
            <div style={{
              fontFamily: "'Orbitron',monospace", fontSize: 11,
              color: "#00f5ff", letterSpacing: 5,
              animation: "shimmerBlock 1.2s ease-in-out infinite",
            }}>CARREGANDO...</div>
          </div>
        )}

        {/* ERRO */}
        {!loading && error && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 30,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
          }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: "#f43f5e", letterSpacing: 3 }}>
              ⚠ ERRO AO CARREGAR
            </div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, color: "rgba(255,80,80,0.5)", letterSpacing: 2 }}>
              {error}
            </div>
            <button onClick={fetchAll} style={{
              fontFamily: "'Orbitron',monospace", fontSize: 9, letterSpacing: 3,
              padding: "8px 24px", border: "2px solid #f43f5e44", borderRadius: 6,
              background: "transparent", color: "#f43f5e",
            }}>TENTAR NOVAMENTE</button>
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL */}
        {!loading && !error && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            padding: "16px 26px 12px",
            position: "relative", zIndex: 10,
            maxHeight: "100vh",
          }}>

            {/* Título */}
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <h1 style={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: "clamp(20px,3.6vw,36px)",
                  fontWeight: 900, color: "#fff", letterSpacing: 6,
                  textTransform: "uppercase",
                  animation: glitch ? "glitchShift .24s ease" : "titlePulse 3.5s ease-in-out infinite",
                  userSelect: "none",
                }}>
                  ⚡ RANKING DAS TURMAS ⚡
                </h1>
              </div>
              <div style={{
                fontFamily: "'Rajdhani',sans-serif", fontSize: 10,
                color: "rgba(255,255,255,0.18)", letterSpacing: 5,
                textTransform: "uppercase", marginTop: 2,
              }}>
                FREQUÊNCIA • {tab === "semanal" ? "SEMANA ATUAL" : "MÊS ATUAL"}
              </div>
            </div>

            {/* Tab switcher */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
              {["semanal", "mensal"].map(t => {
                const active = tab === t;
                return (
                  <button key={t} onClick={() => doSwitch(t)} style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 10, fontWeight: 700,
                    letterSpacing: 3, textTransform: "uppercase",
                    padding: "7px 22px",
                    border: `2px solid ${active ? "#00f5ff" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 6,
                    background: active
                      ? "linear-gradient(135deg,rgba(0,245,255,.16),rgba(124,58,237,.1))"
                      : "transparent",
                    color: active ? "#00f5ff" : "rgba(255,255,255,0.28)",
                    boxShadow: active ? "0 0 18px rgba(0,245,255,.28),inset 0 0 10px rgba(0,245,255,.07)" : "none",
                    transition: "all .35s ease",
                    position: "relative", overflow: "hidden",
                  }}>
                    {t === "semanal" ? "📅 SEMANAL" : "📆 MENSAL"}
                    {active && (
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, height: 2,
                        width: `${cd}%`,
                        background: "linear-gradient(90deg,#00f5ff,#7c3aed)",
                        transition: "width .15s linear",
                        boxShadow: "0 0 6px #00f5ff",
                      }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Pódio — idêntico ao original */}
            <div style={{
              display: "flex", justifyContent: "center",
              alignItems: "flex-end", gap: 10, marginBottom: 16,
              opacity: transit ? 0 : 1,
              transform: transit ? "scale(.94)" : "scale(1)",
              transition: "opacity .4s ease, transform .4s ease",
            }}>
              {[sorted[1], sorted[0], sorted[2]].map((t, i) => {
                if (!t) return null;
                const r = i === 0 ? 2 : i === 1 ? 1 : 3;
                return <PodiumBlock key={t.turma_id} turma={t} rank={r} show={show && !transit} />;
              })}
            </div>

            {/* Divisor */}
            <div style={{
              height: 1, marginBottom: 12,
              background: "linear-gradient(90deg,transparent,rgba(0,245,255,.5),rgba(124,58,237,.4),transparent)",
              boxShadow: "0 0 10px rgba(0,245,255,.18)",
            }} />

            {/* Lista completa */}
            <div style={{ flex: 1, overflow: "hidden" }}>
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

            {/* Footer */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", paddingTop: 9,
              borderTop: "1px solid rgba(0,245,255,0.07)",
              marginTop: 5,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#00f5ff", boxShadow: "0 0 8px #00f5ff",
                  animation: "shimmerBlock 1.1s ease-in-out infinite",
                }} />
                <span style={{
                  fontFamily: "'Orbitron',monospace", fontSize: 8,
                  color: "rgba(255,255,255,.18)", letterSpacing: 3,
                }}>AO VIVO</span>
              </div>
              <div style={{
                fontFamily: "'Orbitron',monospace", fontSize: 8,
                color: "rgba(255,255,255,.13)", letterSpacing: 2,
              }}>
                {topTeam?.nome_fantasia} LIDERA • {parseFloat(topTeam?.porcentagem_presenca || 0).toFixed(2)}%
              </div>
              <div style={{
                fontFamily: "'Orbitron',monospace", fontSize: 8,
                color: "rgba(255,255,255,.13)", letterSpacing: 2,
              }}>
                2026 • CLASSPULSE
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
