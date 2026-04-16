import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, Button, IconButton, Chip } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckIcon from "@mui/icons-material/Check";
import { apiFetch } from "../services/Api";

/* ─── Configuração dos temas ─────────────────────────────────────────
   Cada entrada tem:
     id       → identificador único
     name     → nome exibido no card
     route    → URL do iframe
     badge    → (opcional) label do badge tipo "Novo", "Popular"
   ──────────────────────────────────────────────────────────────────── */
const themes = [
  { id: "tema1", name: "Noite",   route: "/game?preview=true",  badge: null },
  { id: "tema2", name: "Festa",    route: "/game2?preview=true", badge: "Popular" },
  { id: "tema3", name: "Super Mario", route: "/game3?preview=true", badge: "Novo" },
  { id: "tema4", name: "Minecraft claro",   route: "/game4?preview=true",  badge: null },
  { id: "tema5", name: "Minecraft escuro",    route: "/game5?preview=true", badge: "Popular" },
  { id: "tema6", name: "Futuristico", route: "/game6?preview=true", badge: "Novo" },
  // Adicione mais temas aqui ↓
];

/* ─── Quantos cards visíveis por breakpoint ──────────────────────────
   Ajuste livremente sem tocar no restante do componente.
   ──────────────────────────────────────────────────────────────────── */
function usePerPage() {
  const [perPage, setPerPage] = useState(3);
  useEffect(() => {
    function compute() {
      const w = window.innerWidth;
      setPerPage(w < 640 ? 1 : w < 1024 ? 2 : 3);
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return perPage;
}

/* ─── Dimensões do "canvas" virtual do iframe ────────────────────────
   Os temas foram construídos para um totem 480 × 900.
   Se os seus temas tiverem tamanho diferente, altere aqui.
   ──────────────────────────────────────────────────────────────────── */
const VIRTUAL_W = 480;
const VIRTUAL_H = 650;

/* ─── Altura que o preview vai ocupar dentro do card ─────────────────
   O aspect ratio do card é calculado automaticamente a partir de
   VIRTUAL_W / VIRTUAL_H, então basta definir a largura do card.
   ──────────────────────────────────────────────────────────────────── */
const PREVIEW_ASPECT = VIRTUAL_H / VIRTUAL_W; // ≈ 1.875

/* ─── Componente ScaledPreview ───────────────────────────────────────
   Renderiza o iframe em tamanho real (VIRTUAL_W × VIRTUAL_H) e aplica
   transform: scale() para que caiba exatamente no container do card.
   Resultado: miniatura pixel-perfect sem cortes e sem scroll.
   ──────────────────────────────────────────────────────────────────── */
function ScaledPreview({ src, title }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const { width } = containerRef.current.getBoundingClientRect();
    setScale(width / VIRTUAL_W);
  }, []);

  useEffect(() => {
    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateScale]);

  return (
    /* Container externo: define a área visível no card */
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        /* A altura acompanha automaticamente o aspect ratio do tema */
        paddingTop: `${PREVIEW_ASPECT * 100}%`,
        position: "relative",
        overflow: "hidden",
        background: "#0a0a0a",
        borderRadius: "12px 12px 0 0",
      }}
    >
      {/* Wrapper interno: tamanho real do tema, escalado pelo scale */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: VIRTUAL_W,
          height: VIRTUAL_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          /* Desabilita interação para não capturar cliques acidentais */
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <iframe
          src={src}
          title={title}
          loading="lazy"
          style={{
            width: VIRTUAL_W,
            height: VIRTUAL_H,
            border: "none",
            display: "block",
            /* Impede que o iframe tente se "responsivizar" */
            maxWidth: "none",
          }}
          /* Sem scroll no iframe */
          scrolling="no"
        />
      </Box>
    </Box>
  );
}

/* ─── Componente ThemeCard ────────────────────────────────────────── */
function ThemeCard({ theme, isActive, onSelect }) {
  return (
    <Box
      sx={{
        /* Transição suave ao ativar/desativar destaque */
        transition: "box-shadow 0.2s ease, transform 0.15s ease",
        borderRadius: "16px",
        overflow: "hidden",
        background: "#ffffff",
        border: isActive
          ? "2px solid #6366f1"
          : "1.5px solid rgba(0,0,0,0.08)",
        boxShadow: isActive
          ? "0 0 0 4px rgba(99,102,241,0.15), 0 8px 24px rgba(99,102,241,0.12)"
          : "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: isActive
            ? "0 0 0 4px rgba(99,102,241,0.2), 0 16px 40px rgba(99,102,241,0.18)"
            : "0 8px 28px rgba(0,0,0,0.1)",
        },
        /* Layout interno */
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Preview area ────────────────────────────────────────────── */}
      <Box sx={{ position: "relative" }}>
        <ScaledPreview src={theme.route} title={theme.name} />

        {/* Badge opcional (ex: "Novo", "Popular") */}
        {theme.badge && (
          <Chip
            label={theme.badge}
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: 0.3,
              background:
                theme.badge === "Popular"
                  ? "rgba(99,102,241,0.92)"
                  : "rgba(16,185,129,0.92)",
              color: "#fff",
              backdropFilter: "blur(4px)",
              border: "none",
              height: 24,
            }}
          />
        )}

        {/* Overlay de "ativo" com check */}
        {isActive && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "rgba(99,102,241,0.08)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              p: 1.25,
              borderRadius: "12px 12px 0 0",
            }}
          >
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(99,102,241,0.5)",
              }}
            >
              <CheckIcon sx={{ fontSize: 14, color: "#fff" }} />
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Info bar ────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 2,
          pt: 1.75,
          pb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          borderTop: "1px solid rgba(0,0,0,0.06)",
          background: "#fafafa",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 15,
              color: "#111827",
              lineHeight: 1.3,
            }}
          >
            {theme.name}
          </Typography>
          {isActive && (
            <Typography
              sx={{
                fontSize: 11,
                color: "#6366f1",
                fontWeight: 500,
                mt: 0.25,
                letterSpacing: 0.2,
              }}
            >
              Tema ativo
            </Typography>
          )}
        </Box>

        <Button
          variant={isActive ? "outlined" : "contained"}
          size="small"
          onClick={() => onSelect(theme)}
          disableElevation
          sx={{
            flexShrink: 0,
            fontWeight: 600,
            fontSize: 12.5,
            textTransform: "none",
            borderRadius: "8px",
            px: 2,
            py: 0.75,
            letterSpacing: 0.2,
            ...(isActive
              ? {
                  borderColor: "#6366f1",
                  color: "#6366f1",
                  "&:hover": {
                    background: "rgba(99,102,241,0.06)",
                    borderColor: "#4f46e5",
                  },
                }
              : {
                  background: "#111827",
                  color: "#fff",
                  "&:hover": { background: "#1f2937" },
                }),
          }}
        >
          {isActive ? "Ativado ✓" : "Ativar"}
        </Button>
      </Box>
    </Box>
  );
}

/* ─── Componente principal ThemeSelector ─────────────────────────── */
function getActiveTheme() {
  try {
    const data = localStorage.getItem("activeTheme");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveActiveTheme(theme) {
  localStorage.setItem("activeTheme", JSON.stringify(theme));

  // 🔥 DISPARA O RELOAD DO TOTEM
  localStorage.setItem("reloadTotem", Date.now());
} 

export default function ThemeSelector() {
  const [active, setActive]   = useState(null);
  const [page,   setPage]     = useState(0);
  const perPage               = usePerPage();

  useEffect(() => {
  async function loadActiveTheme() {
    try {
      const res = await apiFetch("/tema/tema-ativo");
      const data = await res.json();

      const currentTheme = themes.find(
        (t) => t.id === data.tema
      );

      if (currentTheme) {
        setActive(currentTheme);

        // opcional: sincroniza cache local
        saveActiveTheme(currentTheme);
      }
    } catch (err) {
      console.error("Erro ao carregar tema ativo:", err);
    }
  }

  loadActiveTheme();
}, []);

  /* Quantas "páginas" existem */
  const totalPages = Math.ceil(themes.length / perPage);
  const canPrev    = page > 0;
  const canNext    = page < totalPages - 1;

  /* Fatia de temas da página atual */
  const visibleThemes = themes.slice(page * perPage, page * perPage + perPage);

async function handleSelect(theme) {
  setActive(theme);

  await apiFetch("/tema/tema-ativo", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tema: theme.id
    })
  });
}

  function handlePrev() {
    if (canPrev) setPage((p) => p - 1);
  }

  function handleNext() {
    if (canNext) setPage((p) => p + 1);
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f5f5f7",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          pt: 4,
          pb: 1,
          px: { xs: 2, sm: 4 },
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 22, sm: 25 },
            fontWeight: 700,
            color: "#111827",
            letterSpacing: -0.5,
          }}
        >
          Escolha o Tema do Totem
        </Typography>


        {/* Paginação indicativa */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.6, mt: 2 }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Box
                key={i}
                onClick={() => setPage(i)}
                sx={{
                  width: i === page ? 20 : 6,
                  height: 6,
                  borderRadius: 99,
                  background: i === page ? "#6366f1" : "rgba(99,102,241,0.25)",
                  cursor: "pointer",
                  transition: "width 0.25s ease, background 0.2s",
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* ── Carrossel ───────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          px: { xs: 1, sm: 3, md: 5 },
          py: 2,
          gap: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Seta esquerda */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            pr: { xs: 0.5, sm: 1 },
          }}
        >
          <IconButton
            onClick={handlePrev}
            disabled={!canPrev}
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              "&:hover": { background: "#f3f4f6" },
              "&:disabled": { opacity: 0.3, boxShadow: "none" },
              transition: "opacity 0.2s",
            }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>

        {/* Grid de cards */}
        <Box
          sx={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: { xs: 2, sm: 2.5, md: 3 },
            alignItems: "start",
            /* Animação suave ao trocar página */
            animation: "fadeSlide 0.25s ease",
            "@keyframes fadeSlide": {
              from: { opacity: 0, transform: "translateX(12px)" },
              to:   { opacity: 1, transform: "translateX(0)" },
            },
          }}
        >
          {visibleThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={active?.id === theme.id}
              onSelect={handleSelect}
            />
          ))}
        </Box>

        {/* Seta direita */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            pl: { xs: 0.5, sm: 1 },
          }}
        >
          <IconButton
            onClick={handleNext}
            disabled={!canNext}
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              "&:hover": { background: "#f3f4f6" },
              "&:disabled": { opacity: 0.3, boxShadow: "none" },
              transition: "opacity 0.2s",
            }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      </Box>

  
    </Box>
  );
}
