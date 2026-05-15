import { useState } from "react";
import { useDashboard } from "../hooks/UseDashboard";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════
   CLASSPULSE DASHBOARD — Grid Master
   12-col CSS Grid · 100vh exact · 1366×768 optimised · SaaS UI
   ═══════════════════════════════════════════════════════════════ */

// ─── Design Tokens ────────────────────────────────────────────────
const T = {
  bg:         "#F0F4F8",
  surface:    "#FFFFFF",
  border:     "#E5EAF0",
  navy:       "#1A2540",
  navyHover:  "#243055",
  text:       "#0F172A",
  textMid:    "#475569",
  textLow:    "#94A3B8",
  blue:       "#3B82F6",
  blueBg:     "#EFF6FF",
  amber:      "#F59E0B",
  amberBg:    "#FFFBEB",
  red:        "#EF4444",
  redBg:      "#FEF2F2",
  purple:     "#8B5CF6",
  purpleBg:   "#F5F3FF",
  green:      "#10B981",
  greenDark:  "#059669",
  goldText:   "#D97706",
  goldBg:     "#FEF9C3",
  silverText: "#64748B",
  silverBg:   "#F8FAFC",
  bronzeText: "#92400E",
  bronzeBg:   "#FFF7ED",
  // action buttons
  g1: "#059669", g2: "#3B82F6", g3: "#1A2540", g4: "#D97706",
  // spacing scale
  s1:  4,  s2:  8,  s3: 12,  s4: 16, s5: 20, s6: 24,
};

// ─── CSS ──────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; height: 100%; overflow-x: hidden; overflow-y: auto;background: ${T.bg}; }
body { font-family: 'Inter', sans-serif; color: ${T.text}; -webkit-font-smoothing: antialiased; }
button { font-family: 'Inter', sans-serif; cursor: pointer; border: none; }
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }

/* ── Animations ─────────────────────────────────────────────── */
@keyframes up  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
@keyframes sk  { from { background-position:-600px 0 } to { background-position:600px 0 } }
@keyframes ld  { from { stroke-dashoffset:3000 } to { stroke-dashoffset:0 } }

/* ── Utilities ──────────────────────────────────────────────── */
.card {
  background: ${T.surface};
  border: 1px solid ${T.border};
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.04);
  transition: box-shadow .2s, transform .18s;
}
.card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.09); transform: translateY(-1px); }

.fu { animation: up .35s ease both; }

.sk {
  background: linear-gradient(90deg,#E2E8F0 25%,#EEF2F7 50%,#E2E8F0 75%);
  background-size: 600px 100%;
  animation: sk 1.4s ease-in-out infinite;
  border-radius: 6px;
}

/* ── Root layout — pure CSS Grid ────────────────────────────── */
.dash {
  display: grid;
  grid-template-rows: auto auto 1fr auto auto auto;
  gap: 10px;
  height: 90vh;
  padding: 16px 24px 14px;

}

/* ── KPI grid ───────────────────────────────────────────────── */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

/* ── Mid row: chart + ranking ───────────────────────────────── */
.mid-row {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 10px;
  min-height: 0;
}
.chart-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.chart-body {
  flex: 1;
  min-height: 0;
  position: relative;
}
.rank-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.rank-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* ── Action buttons ─────────────────────────────────────────── */
.act-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.act-btn {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 11px 10px;
  border-radius: 10px;
  font-size: 13px; font-weight: 600; color: #fff;
  transition: filter .18s, transform .15s;
}
.act-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
.act-btn:active { transform: none; }

/* ── Footer bar ─────────────────────────────────────────────── */
.foot { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.foot-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: ${T.textMid}; }

/* ── Tabs ────────────────────────────────────────────────────── */
.tab-group { display: flex; }
.tab {
  padding: 4px 14px; background: transparent; font-size: 12.5px; font-weight: 500;
  color: ${T.textLow}; border-bottom: 2.5px solid transparent;
  transition: color .15s, border-color .15s;
}
.tab.on { color: ${T.blue}; border-bottom-color: ${T.blue}; font-weight: 600; }

/* ── Chart-type toggle ──────────────────────────────────────── */
.ct-group { display: flex; gap: 5px; }
.ct {
  padding: 4px 11px; border: 1px solid ${T.border}; border-radius: 7px;
  font-size: 11.5px; font-weight: 500; color: ${T.textMid};
  background: ${T.surface}; transition: all .15s;
}
.ct.on { background: ${T.navy}; color: #fff; border-color: ${T.navy}; }

/* ── Alert rows ─────────────────────────────────────────────── */
.al-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 12px; border-radius: 8px; transition: background .14s; cursor: pointer;
}
.al-row:hover { background: ${T.bg}; }

/* ── Ranking rows ────────────────────────────────────────────── */
.rk-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 10px; transition: background .14s;
}
.rk-row:hover { background: ${T.bg}; }

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 960px) {
  .kpi-row  { grid-template-columns: repeat(2, 1fr); }
  .mid-row  { grid-template-columns: 1fr; }
  .act-row  { grid-template-columns: repeat(2, 1fr); }
  .dash     { overflow-y: auto; height: auto; }
}
@media (max-width: 540px) {
  .kpi-row  { grid-template-columns: 1fr; }
  .act-row  { grid-template-columns: 1fr; }
  .dash     { padding: 12px 14px 10px; }
}
`;

// ─── Skeleton ─────────────────────────────────────────────────────
const Sk = ({ w = "100%", h = 12, r = 6, mb = 0 }) => (
  <div className="sk" style={{ width: w, height: h, borderRadius: r, marginBottom: mb }} />
);

// ─── KPI Card ─────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, bg, col, loading, d = 0 }) {
  return (
    <div className="card fu" style={{ padding: "14px 16px", animationDelay: `${d}s` }}>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Sk w={40} h={40} r={11} />
          <div style={{ flex: 1 }}><Sk w="55%" h={10} mb={6} /><Sk w="45%" h={20} /></div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
            background: bg, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 18,
          }}>{icon}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: T.textMid, fontWeight: 500, marginBottom: 3, whiteSpace: "nowrap" }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: col, letterSpacing: "-0.5px", lineHeight: 1 }}>{value}</div>
            {sub && <div style={{ fontSize: 10.5, color: T.textLow, marginTop: 3 }}>{sub}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Line Chart (SVG, fills parent) ───────────────────────────────
function LineChart({ data, multi = false }) {

  const [hov, setHov] = useState(null);

  if (!data?.length) return null;

  const VW = 620;
  const VH = 200;

  const P = {
    t: 14,
    r: 16,
    b: 28,
    l: 42,
  };

  const iW = VW - P.l - P.r;
  const iH = VH - P.t - P.b;

  const cores = [
    "#3B82F6",
    "#10B981",
    "#EF4444",
    "#F59E0B",
    "#8B5CF6",
    "#06B6D4",
  ];

  // =========================================================
  // 🔥 MULTI LINHA (SEMANAL)
  // =========================================================

  if (multi) {

    const semanas = [
      ...new Set(
        data.flatMap((t) =>
          t.dados.map((d) => d.semana)
        )
      )
    ];

    const todosValores = data.flatMap((t) =>
      t.dados.map((d) =>
        Number(
          d.presenca_media ??
          d.presenca ??
          0
        )
      )
    );

    const mn = Math.max(
      0,
      Math.floor(Math.min(...todosValores) / 10) * 10 - 10
    );

    const mx = Math.min(
      100,
      Math.ceil(Math.max(...todosValores) / 10) * 10 + 5
    );

    const rng = mx - mn || 1;

    const tx = (i) =>
      P.l + (
        i / Math.max(semanas.length - 1, 1)
      ) * iW;

    const ty = (v) =>
      P.t + iH - (
        ((v - mn) / rng) * iH
      );

    const ySteps = [];

    for (let v = mn; v <= mx; v += 10) {
      ySteps.push(v);
    }

    return (
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="none"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      >

        {/* GRID */}

        {ySteps.map((v) => {

          const y = ty(v);

          return (
            <g key={v}>

              <line
                x1={P.l}
                y1={y}
                x2={VW - P.r}
                y2={y}
                stroke="rgba(0,0,0,0.05)"
                strokeDasharray="4 3"
              />

              <text
                x={P.l - 6}
                y={y + 3}
                textAnchor="end"
                fontSize={9}
                fill="#94A3B8"
              >
                {v}%
              </text>

            </g>
          );
        })}

        {/* LINHAS */}

        {data.map((turma, turmaIndex) => {

          const cor =
            cores[turmaIndex % cores.length];

          const pts = semanas.map((semana, i) => {

            const item = turma.dados.find(
              (d) => d.semana === semana
            );

            if (!item) return null;

            return [
              tx(i),
              ty(
                Number(
                  item.presenca_media ??
                  item.presenca ??
                  0
                )
              ),
              item
            ];
          }).filter(Boolean);

          const path = pts
            .map(
              (p, i) =>
                `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`
            )
            .join(" ");

          return (
            <g key={turma.turma}>

              <path
                d={path}
                fill="none"
                stroke={cor}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {pts.map(([x, y, item], i) => {

                const key =
                  `${turmaIndex}-${i}`;

                const isH =
                  hov === key;

                return (
                  <g key={key}>

                    <rect
                      x={x - 12}
                      y={y - 12}
                      width={24}
                      height={24}
                      fill="transparent"
                      onMouseEnter={() => setHov(key)}
                      onMouseLeave={() => setHov(null)}
                    />

                    <circle
                      cx={x}
                      cy={y}
                      r={isH ? 5 : 4}
                      fill="#fff"
                      stroke={cor}
                      strokeWidth={2}
                    />

                    {isH && (

                      <g>

                        <rect
                          x={x - 45}
                          y={y - 55}
                          width={90}
                          height={40}
                          rx={8}
                          fill="#1E293B"
                        />

                        <text
                          x={x}
                          y={y - 38}
                          textAnchor="middle"
                          fontSize={9}
                          fill="rgba(255,255,255,.7)"
                        >
                          {turma.turma}
                        </text>

                        <text
                          x={x}
                          y={y - 24}
                          textAnchor="middle"
                          fontSize={11}
                          fontWeight="600"
                          fill="#fff"
                        >
                          {Number(
                            item.presenca_media ??
                            item.presenca ??
                            0
                          ).toFixed(1)}%
                        </text>

                      </g>
                    )}

                  </g>
                );
              })}

            </g>
          );
        })}

        {/* LABELS X */}

       {semanas.map((semana, i) => (

  <text
    key={semana}
    x={tx(i)}
    y={VH - 2}
    textAnchor="middle"
    fontSize={8}
    fill="#94A3B8"
  >
    {semana}
  </text>

))}

      </svg>
    );
  }

  // =========================================================
  // 🔥 MODO NORMAL (MENSAL)
  // =========================================================

  const vals = data.map(d =>
    Number(
      d.presenca_media ??
      d.presenca ??
      0
    )
  );

  const mn = Math.max(
    0,
    Math.floor(Math.min(...vals) / 10) * 10 - 10
  );

  const mx = Math.min(
    100,
    Math.ceil(Math.max(...vals) / 10) * 10 + 5
  );

  const rng = mx - mn || 1;

  const tx = (i) =>
    P.l + (
      i / Math.max(data.length - 1, 1)
    ) * iW;

  const ty = (v) =>
    P.t + iH - (
      ((v - mn) / rng) * iH
    );

  const pts = data.map((d, i) => ([
    tx(i),
    ty(
      Number(
        d.presenca_media ??
        d.presenca ??
        0
      )
    )
  ]));

  const path = pts
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`
    )
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="none"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    >

      {[0,10,20,30,40,50,60,70,80,90,100].map(v => {

        const y = ty(v);

        return (
          <g key={v}>

            <line
              x1={P.l}
              y1={y}
              x2={VW - P.r}
              y2={y}
              stroke="rgba(0,0,0,0.05)"
              strokeDasharray="4 3"
            />

            <text
              x={P.l - 6}
              y={y + 3}
              textAnchor="end"
              fontSize={9}
              fill="#94A3B8"
            >
              {v}%
            </text>

          </g>
        );
      })}

      <path
        d={path}
        fill="none"
        stroke="#3B82F6"
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {pts.map(([x, y], i) => {

        const item = data[i];

        return (
          <g key={i}>

            <circle
              cx={x}
              cy={y}
              r={4}
              fill="#fff"
              stroke="#3B82F6"
              strokeWidth={2}
            />

            <text
              x={x}
              y={VH - 2}
              textAnchor="middle"
              fontSize={8}
              fill="#94A3B8"
            >
              {item.mes}
            </text>

          </g>
        );
      })}

    </svg>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────
function BarChart({ data, multi = false }) {

  const [hov, setHov] = useState(null);

  if (!data?.length) return null;

  const VW = 620;
  const VH = 200;

  const P = {
    t: 14,
    r: 16,
    b: 28,
    l: 42,
  };

  const iW = VW - P.l - P.r;
  const iH = VH - P.t - P.b;

  const cores = [
    "#3B82F6",
    "#10B981",
    "#EF4444",
    "#F59E0B",
    "#8B5CF6",
    "#06B6D4",
  ];

  // =========================
  // 🔥 MULTI TURMAS
  // =========================

 if (multi) {

  const semanas = [
    ...new Set(
      data.flatMap((t) =>
        t.dados.map((d) => d.semana)
      )
    )
  ];

  const todosValores = data.flatMap((t) =>
    t.dados.map((d) => d.presenca_media)
  );

  const mn = Math.max(
    0,
    Math.floor(Math.min(...todosValores) / 10) * 10 - 10
  );

  const mx = Math.min(
    100,
    Math.ceil(Math.max(...todosValores) / 10) * 10 + 5
  );

  const rng = mx - mn || 1;

  const ty = (v) =>
    P.t + iH - ((v - mn) / rng) * iH;

  const ySteps = [];

  for (let v = mn; v <= mx; v += 10) {
    ySteps.push(v);
  }

  const grupoW = iW / semanas.length;

  const barraW =
    Math.min(18, grupoW / (data.length + 1));

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="none"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    >

      {ySteps.map((v) => {

        const y = ty(v);

        return (
          <g key={v}>
            <line
              x1={P.l}
              y1={y}
              x2={VW - P.r}
              y2={y}
              stroke="rgba(0,0,0,0.05)"
              strokeDasharray="4 3"
            />

            <text
              x={P.l - 6}
              y={y + 3}
              textAnchor="end"
              fontSize={9}
              fill="#94A3B8"
            >
              {v}%
            </text>
          </g>
        );
      })}

      {semanas.map((semana, semanaIndex) => {

        const grupoX =
          P.l + (semanaIndex * grupoW);

       const barrasNoMes = data.filter((turma) =>
  turma.dados.some((d) => d.semana === semana)
).length;

const totalBarras =
  barrasNoMes * barraW;

        const offsetCentral =
          (grupoW - totalBarras) / 2;

        return (
          <g key={semana}>

            {data.map((turma, turmaIndex) => {

              const item = turma.dados.find(
                (d) => d.semana === semana
              );

              if (!item) return null;

              const cor =
                cores[turmaIndex % cores.length];

             const turmasComDados = data.filter((turma) =>
  turma.dados.some((d) => d.semana === semana)
);

const posicaoReal =
  turmasComDados.findIndex(
    (t) => t.turma === turma.turma
  );

const x =
  grupoX +
  offsetCentral +
  (posicaoReal * barraW);

              const y =
                ty(item.presenca_media);

              const h =
                (P.t + iH) - y;

              const isH =
                hov === `${turmaIndex}-${semanaIndex}`;

              return (
                <g
                  key={`${turmaIndex}-${semanaIndex}`}
                  onMouseEnter={() =>
                    setHov(`${turmaIndex}-${semanaIndex}`)
                  }
                  onMouseLeave={() =>
                    setHov(null)
                  }
                >

                  <rect
                    x={x}
                    y={y}
                    width={barraW}
                    height={h}
                    rx={4}
                    fill={cor}
                    opacity={isH ? 1 : 0.85}
                  />

                  {isH && (
                    <g>

                      <rect
                        x={x - 28}
                        y={y - 42}
                        width={80}
                        height={34}
                        rx={8}
                        fill="#1A2540"
                      />

                      <text
                        x={x + 12}
                        y={y - 28}
                        textAnchor="middle"
                        fontSize={8}
                        fill="rgba(255,255,255,.7)"
                      >
                        {turma.turma}
                      </text>

                      <text
                        x={x + 12}
                        y={y - 14}
                        textAnchor="middle"
                        fontSize={11}
                        fill="#fff"
                        fontWeight="600"
                      >
                        {item.presenca_media.toFixed(1)}%
                      </text>

                    </g>
                  )}

                </g>
              );
            })}

            <text
              x={grupoX + grupoW / 2}
              y={VH - 2}
              textAnchor="middle"
              fontSize={8}
              fill="#94A3B8"
            >
              {semana}
            </text>

          </g>
        );
      })}

    </svg>
  );
}

  return null;
}

// ─── Ranking list ─────────────────────────────────────────────────
const MEDALS = [
  { icon: "🥇", bg: T.goldBg,   col: T.goldText   },
  { icon: "🥈", bg: T.silverBg, col: T.silverText  },
  { icon: "🥉", bg: T.bronzeBg, col: T.bronzeText  },
];

function RankList({ data, loading }) {
  if (loading) return (
    <div style={{ padding: "4px 0", display: "flex", flexDirection: "column", gap: 4 }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="rk-row">
          <Sk w={34} h={34} r={9} /><div style={{ flex: 1 }}><Sk w="65%" h={10} mb={4} /><Sk w="35%" h={9} /></div><Sk w={44} h={14} r={5} />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {(data || []).slice(0, 6).map((t, i) => {
        const m   = MEDALS[i] || { icon: `${i + 1}`, bg: T.bg, col: T.textMid };
        const pct = parseFloat(t.porcentagem_presenca || 0).toFixed(1);
        const top = i < 3;
        return (
          <div key={t.turma_id || i} className="rk-row"
            style={{ background: i === 0 ? T.goldBg : "transparent" }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: m.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: top ? 17 : 12, fontWeight: 700, color: m.col,
            }}>{m.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: T.text,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{t.nome_fantasia || t.nome}</div>
              <div style={{ fontSize: 10.5, color: T.textLow, marginTop: 1 }}>• {pct}%</div>
            </div>
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: top ? m.col : T.green,
              minWidth: 46, textAlign: "right",
              fontFamily: "'JetBrains Mono', monospace",
            }}>{pct}%</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Alert section ────────────────────────────────────────────────
function Alerts({ alerts, loading }) {
  return (
    <div className="card fu" style={{ padding: "10px 16px 6px", animationDelay: ".3s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 14 }}>⚠️</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.text, letterSpacing: ".3px" }}>
          ALERTAS IMPORTANTES
        </span>
      </div>
      {loading ? (
        <div style={{ padding: "4px 0 6px", display: "flex", flexDirection: "column", gap: 6 }}>
          <Sk h={10} w="68%" /><Sk h={10} w="52%" />
        </div>
      ) : alerts.length === 0 ? (
        <div style={{ padding: "4px 0 6px", color: T.textLow, fontSize: 12 }}>✅ Sem alertas no momento</div>
      ) : (
        <div>
          {alerts.map((a, i) => (
            <div key={i} className="al-row">
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ fontSize: 14, lineHeight: 1 }}>{a.icon}</span>
                <span style={{ fontSize: 12.5, color: T.text }}>{a.text}</span>
              </div>
              <svg width={13} height={13} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M6 4l4 4-4 4" stroke={T.textLow} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────
export default function Dashboard() {
  const [tab,   setTab]   = useState("semanal");
  const [chart, setChart] = useState("linha");
  const navigate = useNavigate();

  // ── Única chamada centralizada — substitui getTurmas + getRanking ──
  // Quando `tab` muda, o hook dispara automaticamente /dashboard?tipo=<tab>
const { resumo, ranking, grafico, alertas, loading } = useDashboard(tab);

const graficoFormatado =
  grafico.map((turma) => ({

    turma: turma.turma,

    dados: turma.dados.map((item) => ({

      semana: item.semana
        ? new Date(item.semana).toLocaleDateString(
            "pt-BR",
            {
              day: "2-digit",
              month: "2-digit",
            }
          )
        : item.mes,

      presenca_media:
        item.presenca_media ??
        item.presenca ??
        0,
    })),
  }));

  // ── KPIs — extraídos diretamente do resumo retornado pela API ──────
  const mPresenca = loading ? "—" : Number(resumo.presencaMedia).toFixed(1);
  const mFaltas   = loading ? "—" : resumo.faltas;
  const ativos    = loading ? "—" : resumo.turmasAtivas;
  const semanas   = loading ? "—" : resumo.semanasRegistradas;
  const lider     = ranking[0];

  // ── Alertas — mapeados do formato { mensagem } para { icon, text } ─
  const alertasMapped = loading
    ? []
    : alertas.map((a) => ({ icon: "⚠️", text: a.mensagem }));

  return (
    <>
      <style>{CSS}</style>

      <div className="dash">

        {/* ── Row 1: Page title ─────────────────────────────────── */}
        <div className="fu" style={{ animationDelay: "0s" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: "clamp(17px,2vw,22px)", fontWeight: 800, color: T.text, letterSpacing: "-0.6px" }}>
                Dashboard
              </h1>
              <p style={{ fontSize: 12.5, color: T.textMid, marginTop: 2 }}>
                Acompanhe o desempenho geral das turmas em tempo real
              </p>
            </div>
          </div>
        </div>

        {/* ── Row 2: 4 KPI cards ────────────────────────────────── */}
        <div className="kpi-row">
          <KpiCard icon="%" label="Presença Média"
            value={loading ? "—" : `${mPresenca}%`}
            bg={T.amberBg} col={T.amber} loading={loading} d={0.04} />
          <KpiCard icon="⚠" label="Total de Faltas"
            value={loading ? "—" : mFaltas}
            bg={T.redBg} col={T.red} loading={loading} d={0.08} />
          <KpiCard icon="👥" label="Turmas Ativas"
            value={loading ? "—" : ativos}
            bg={T.blueBg} col={T.blue} loading={loading} d={0.12} />
          <KpiCard
  icon="🗓"
  label={
    tab === "semanal"
      ? "Semanas Registradas"
      : "Meses Registrados"
  }
  value={loading ? "—" : semanas}
  bg={T.purpleBg}
  col={T.purple}
  loading={loading}
  d={0.16}
/>
        </div>

        {/* ── Row 3: Chart + Ranking ────────────────────────────── */}
        <div className="mid-row">

          {/* Chart */}
          <div className="card chart-card fu" style={{ padding: "14px 16px 10px", animationDelay: ".18s" }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10, flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, letterSpacing: "-0.2px" }}>
                  Presença por Semana
                </div>
                <div style={{ fontSize: 11, color: T.textLow, marginTop: 2 }}>
                  {tab === "semanal" ? "Semana atual · Ranking semanal" : "Mês atual · Ranking mensal"}
                </div>
              </div>
              <div className="ct-group">
                <button className={`ct${chart === "barras" ? " on" : ""}`} onClick={() => setChart("barras")}>Barras</button>
                <button className={`ct${chart === "linha"  ? " on" : ""}`} onClick={() => setChart("linha")}>Linha</button>
              </div>
            </div>

            <div className="chart-body">
              {loading ? (
                <Sk h="100%" r={10} />
              ) : graficoFormatado.length === 0 ? (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: T.textLow, fontSize: 13 }}>
                  Sem dados disponíveis
                </div>
              ) : chart === "barras" ? (
                <BarChart data={graficoFormatado} 
                multi={true}/>
                
              ) : (
                <LineChart data={graficoFormatado}
                multi={true} />
              )}
            </div>
          </div>

          {/* Ranking */}
          <div className="card rank-card fu" style={{ padding: "14px 12px 10px", animationDelay: ".22s" }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10, flexShrink: 0,
              borderBottom: `1px solid ${T.border}`, paddingBottom: 10,
            }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: T.text, letterSpacing: "-0.2px" }}>
                Ranking das Turmas
              </span>
              <div className="tab-group">
                {["semanal", "mensal"].map(t => (
                  <button key={t} className={`tab${tab === t ? " on" : ""}`} onClick={() => setTab(t)}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="rank-scroll">
              <RankList data={ranking} loading={loading} />
            </div>
          </div>
        </div>

        {/* ── Row 4: Alerts ─────────────────────────────────────── */}
        <Alerts alerts={alertasMapped} loading={loading} />

        {/* ── Row 5: Action buttons ─────────────────────────────── */}
       <div className="act-row fu" style={{ animationDelay: ".36s" }}>
  {[
    {
      label: "＋ Cadastrar Ranking",
      bg: T.g1,
      path: "/cadastro-ranking",
    },
    {
      label: "📊 Ver Ranking",
      bg: T.g2,
      path: "/historico-ranking",
    },
    {
      label: "👥 Gerenciar Turmas",
      bg: T.g3,
      path: "/turmas",
    },
    {
      label: "✉ Enviar Email",
      bg: T.g4,
      path: "/conciliacao", // ou cria uma rota depois
    },
  ].map((b) => (
    <button
      key={b.label}
      className="act-btn"
      style={{ background: b.bg }}
      onClick={() => navigate(b.path)}
    >
      {b.label}
    </button>
  ))}
</div>

        {/* ── Row 6: Footer bar ─────────────────────────────────── */}
        <div className="card foot fu" style={{ padding: "9px 20px", animationDelay: ".42s" }}>
      
          <div className="foot-item">
            <span>🏆</span>
            <span>Turma líder da semana.</span>
            {loading ? <Sk w={110} h={11} r={5} /> : (
              <span>
                🏅 <strong style={{ color: T.text }}>{lider?.nome_fantasia || lider?.nome || "—"}</strong>
                {" — "}
                <strong style={{ color: T.blue }}>{parseFloat(lider?.porcentagem_presenca || 0).toFixed(1)}%</strong>
              </span>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
