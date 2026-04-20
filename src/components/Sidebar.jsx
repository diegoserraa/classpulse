import { useState } from "react";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Tooltip,
  Collapse,
  Typography,
  Avatar,
  Chip
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import SendIcon from "@mui/icons-material/Send";
import HistoryIcon from "@mui/icons-material/History";
import EmailIcon from "@mui/icons-material/Email";
import BarChartIcon from "@mui/icons-material/BarChart";
import AddchartIcon from "@mui/icons-material/Addchart";
import PaletteIcon from "@mui/icons-material/Palette";

import { useNavigate, useLocation } from "react-router-dom";
import { Person2, Person2Outlined, Person2Rounded } from "@mui/icons-material";

const SIDEBAR_OPEN_WIDTH = 230;
const SIDEBAR_CLOSED_WIDTH = 64;

const sectionLabel = (text, open) =>
  open ? (
    <Typography
      variant="caption"
      sx={{
        display: "block",
        px: 2,
        pt: 2,
        pb: 0.5,
        color: "rgba(255,255,255,0.25)",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontSize: "10px",
        userSelect: "none"
      }}
    >
      {text}
    </Typography>
  ) : (
    <Divider sx={{ borderColor: "rgba(255,255,255,0.07)", mx: 1.5, my: 1 }} />
  );

const navItemSx = (isActive, open) => ({
  mx: 1,
  mb: 0.25,
  borderRadius: "8px",
  justifyContent: open ? "initial" : "center",
  px: open ? 1.5 : 0,
  minHeight: 38,
  transition: "background 0.15s",
  background: isActive ? "rgba(99,102,241,0.18)" : "transparent",
  "&:hover": {
    background: isActive
      ? "rgba(99,102,241,0.24)"
      : "rgba(255,255,255,0.06)"
  }
});

// 🔥 SOMENTE ESSAS FUNÇÕES FORAM AJUSTADAS

const iconSx = (isActive, open) => ({
  color: isActive ? "#818cf8" : "rgba(255,255,255,0.4)",
  minWidth: 0,
  mr: open ? 1.5 : 0, // 🔥 aqui estava quebrando o alinhamento
  justifyContent: "center",
  "& svg": { fontSize: 18 }
});

const subIconSx = {
  color: "rgba(255,255,255,0.3)",
  minWidth: 0,
  mr: 0, // 🔥 remove desalinhamento
  justifyContent: "center",
  "& svg": { fontSize: 16 }
};

const textSx = (isActive) => ({
  "& .MuiListItemText-primary": {
    fontSize: "13px",
    fontWeight: isActive ? 500 : 400,
    color: isActive ? "#e2e8f0" : "rgba(255,255,255,0.55)",
    whiteSpace: "nowrap"
  }
});



const subTextSx = (isActive) => ({
  "& .MuiListItemText-primary": {
    fontSize: "12px",
    fontWeight: isActive ? 500 : 400,
    color: isActive ? "#c7d2fe" : "rgba(255,255,255,0.4)"
  }
});

function Sidebar({ open, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [emailOpen, setEmailOpen] = useState(false);
  const [rankingOpen, setRankingOpen] = useState(false);

  

  const is = (path) => location.pathname === path;

function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    // 🔥 valida expiração
    if (payload.exp * 1000 < Date.now()) {
      localStorage.clear();
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
const user = getUserFromToken();
const isAdmin = user?.role === "ADMIN";

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH,
          boxSizing: "border-box",
          background: "#0f172a",
          color: "white",
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          overflowX: "hidden",
          borderRight: "0.5px solid rgba(255,255,255,0.07)"
        }
      }}
    >

      {/* ── Logo + Toggle ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: open ? 2 : 0,
          py: 2,
          justifyContent: open ? "flex-start" : "center",
          borderBottom: "0.5px solid rgba(255,255,255,0.07)"
        }}
      >
        {/* Logo mark */}
     

        {open && (
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#f1f5f9",
              letterSpacing: "-0.01em",
              flex: 1
            }}
          >
            CLASSPULSE
          </Typography>
        )}

        <IconButton
          onClick={toggleSidebar}
          size="small"
          sx={{
            color: "rgba(255,255,255,0.3)",
            ml: open ? "auto" : 0,
            "&:hover": { color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.06)" }
          }}
        >
          <MenuIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Navigation ── */}
      <List disablePadding sx={{ flex: 1, py: 1 }}>

        {/* GERAL */}
        {sectionLabel("Geral", open)}

        {/* Dashboard */}
        <Tooltip title={open ? "" : "Dashboard"} placement="right">
          <ListItemButton
            selected={is("/")}
            onClick={() => navigate("/")}
            sx={navItemSx(is("/"), open)}
          >
            <ListItemIcon sx={iconSx(is("/"), open)}>
              <DashboardIcon />
            </ListItemIcon>
            {open && (
              <>
                <ListItemText primary="Dashboard" sx={textSx(is("/"))} />
                <Chip
                  label="3"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "10px",
                    fontWeight: 600,
                    background: "rgba(99,102,241,0.3)",
                    color: "#a5b4fc",
                    "& .MuiChip-label": { px: 0.75 }
                  }}
                />
              </>
            )}
          </ListItemButton>
        </Tooltip>

        {/* Turmas */}
        <Tooltip title={open ? "" : "Turmas"} placement="right">
          <ListItemButton
            selected={is("/turmas")}
            onClick={() => navigate("/turmas")}
            sx={navItemSx(is("/turmas"), open)}
          >
            <ListItemIcon sx={iconSx(is("/turmas"), open)}>
              <SchoolIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Turmas" sx={textSx(is("/turmas"))} />}
          </ListItemButton>
        </Tooltip>

    {isAdmin && (
  <Tooltip title={open ? "" : "Usuarios"} placement="right">
    <ListItemButton
      selected={is("/usuarios")}
      onClick={() => navigate("/usuarios")}
      sx={navItemSx(is("/usuarios"), open)}
    >
      <ListItemIcon sx={iconSx(is("/usuarios"), open)}>
        <Person2Rounded />
      </ListItemIcon>
      {open && (
        <ListItemText
          primary="Usuários"
          sx={textSx(is("/usuarios"))}
        />
      )}
    </ListItemButton>
  </Tooltip>
)}
        

        {/* COMUNICAÇÃO */}
        {sectionLabel("Comunicação", open)}

        {/* Email group */}
        <Tooltip title={open ? "" : "Email"} placement="right">
          <ListItemButton
            onClick={() => setEmailOpen(!emailOpen)}
            sx={navItemSx(false, open)}
          >
            <ListItemIcon sx={iconSx(false, open)}>
              <EmailIcon />
            </ListItemIcon>
            {open && (
              <>
                <ListItemText primary="Email" sx={textSx(false)} />
                {emailOpen ? (
                  <ExpandLess sx={{ fontSize: 16, color: "rgba(255,255,255,0.25)" }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 16, color: "rgba(255,255,255,0.25)" }} />
                )}
              </>
            )}
          </ListItemButton>
        </Tooltip>

        <Collapse in={emailOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ ...navItemSx(is("/conciliacao"), open), pl: open ? 3.5 : 0 }}
              onClick={() => navigate("/conciliacao")}
            >
              <ListItemIcon sx={subIconSx}>
                <SendIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Enviar" sx={subTextSx(is("/conciliacao"))} />}
            </ListItemButton>

            <ListItemButton
              sx={{ ...navItemSx(is("/historico"), open), pl: open ? 3.5 : 0 }}
              onClick={() => navigate("/historico")}
            >
              <ListItemIcon sx={subIconSx}>
                <HistoryIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Histórico" sx={subTextSx(is("/historico"))} />}
            </ListItemButton>
          </List>
        </Collapse>

        {/* DESEMPENHO */}
        {sectionLabel("Desempenho", open)}

        {/* Ranking group */}
        <Tooltip title={open ? "" : "Ranking"} placement="right">
          <ListItemButton
            onClick={() => setRankingOpen(!rankingOpen)}
            sx={navItemSx(false, open)}
          >
            <ListItemIcon sx={iconSx(false, open)}>
              <BarChartIcon />
            </ListItemIcon>
            {open && (
              <>
                <ListItemText primary="Ranking" sx={textSx(false)} />
                {rankingOpen ? (
                  <ExpandLess sx={{ fontSize: 16, color: "rgba(255,255,255,0.25)" }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 16, color: "rgba(255,255,255,0.25)" }} />
                )}
              </>
            )}
          </ListItemButton>
        </Tooltip>

        <Collapse in={rankingOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ ...navItemSx(is("/cadastro-ranking"), open), pl: open ? 3.5 : 0 }}
              onClick={() => navigate("/cadastro-ranking")}
            >
              <ListItemIcon sx={subIconSx}>
                <AddchartIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Gerar" sx={subTextSx(is("/cadastro-ranking"))} />}
            </ListItemButton>

            <ListItemButton
              sx={{ ...navItemSx(is("/historico-ranking"), open), pl: open ? 3.5 : 0 }}
              onClick={() => navigate("/historico-ranking")}
            >
              <ListItemIcon sx={subIconSx}>
                <HistoryIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Histórico" sx={subTextSx(is("/historico-ranking"))} />}
            </ListItemButton>
              <ListItemButton
              sx={{ ...navItemSx(is("/tema"), open), pl: open ? 3.5 : 0 }}
              onClick={() => navigate("/tema")}
            >
              <ListItemIcon sx={subIconSx}>
                <PaletteIcon  />
              </ListItemIcon>
              {open && <ListItemText primary="Tema" sx={subTextSx(is("/tema"))} />}
            </ListItemButton>
          </List>
        </Collapse>

      </List>

      {/* ── Footer / User ── */}
      <Box
        sx={{
          borderTop: "0.5px solid rgba(255,255,255,0.07)",
          p: 1
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: open ? 1.5 : 0,
            py: 1,
            borderRadius: "8px",
            justifyContent: open ? "flex-start" : "center",
            cursor: "pointer",
            transition: "background 0.15s",
            "&:hover": { background: "rgba(255,255,255,0.05)" }
          }}
        >
          <Avatar
            sx={{
              width: 28,
              height: 28,
              fontSize: "11px",
              fontWeight: 600,
              background: "linear-gradient(135deg, #6366f1, #a78bfa)",
              flexShrink: 0
            }}
          >
            AD
          </Avatar>
          {open && (
            <Box sx={{ overflow: "hidden" }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 500, color: "#e2e8f0", lineHeight: 1.3 }}>
                Admin
              </Typography>
              <Typography sx={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", lineHeight: 1.3 }}>
                CLASSPULSE · 2026
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

    </Drawer>
  );
}

export default Sidebar;
