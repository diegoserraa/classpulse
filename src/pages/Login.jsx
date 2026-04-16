import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import logo from "../assets/logo.png";

/* ─── Floating particle canvas ──────────────────────────────────────────── */
function ParticleCanvas() {
  useEffect(() => {
    const canvas = document.getElementById("cp-canvas");
    const ctx = canvas.getContext("2d");
    let raf;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 55;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.28,
      dy: (Math.random() - 0.5) * 0.28,
      alpha: Math.random() * 0.45 + 0.08,
      hue: Math.random() > 0.5 ? 170 : 195,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,65%,${p.alpha})`;
        ctx.fill();
      });

      // draw subtle connecting lines
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,210,180,${0.07 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      id="cp-canvas"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

/* ─── Glow orbs ─────────────────────────────────────────────────────────── */
function GlowOrbs() {
  return (
    <>
      {/* top-left orb */}
      <Box
        sx={{
          position: "fixed",
          top: "-180px",
          left: "-180px",
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,214,176,0.13) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* bottom-right orb */}
      <Box
        sx={{
          position: "fixed",
          bottom: "-200px",
          right: "-200px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,140,255,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* center subtle sweep */}
      <Box
        sx={{
          position: "fixed",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(0,214,176,0.08), transparent)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </>
  );
}

/* ─── Custom TextField styles ────────────────────────────────────────────── */
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "rgba(255,255,255,0.92)",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.04)",
    transition: "background 0.25s, box-shadow 0.25s",
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.1)",
      transition: "border-color 0.25s",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0,214,176,0.35)",
    },
    "&.Mui-focused": {
      background: "rgba(0,214,176,0.05)",
      boxShadow: "0 0 0 3px rgba(0,214,176,0.12)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(0,214,176,0.6)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.38)",
    fontSize: "0.875rem",
    letterSpacing: "0.02em",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "rgba(0,214,176,0.85)",
  },
};

/* ─── Main component ─────────────────────────────────────────────────────── */
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao fazer login");
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        background: "linear-gradient(145deg, #050c18 0%, #07111f 50%, #030b14 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ParticleCanvas />
      <GlowOrbs />

      {/* ── Subtle grid overlay ── */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,214,176,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,214,176,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Card ── */}
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          zIndex: 1,
          p: { xs: "36px 28px", sm: "48px 44px" },
          width: "100%",
          maxWidth: 460,
          borderRadius: "24px",
          background: "rgba(255,255,255,0.035)",
          backdropFilter: "blur(28px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: `
            0 32px 80px rgba(0,0,0,0.55),
            0 0 0 0.5px rgba(255,255,255,0.06),
            inset 0 1px 0 rgba(255,255,255,0.08)
          `,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(18px)",
          transition: "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* top accent line */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(0,214,176,0.7), rgba(0,160,255,0.5), transparent)",
            borderRadius: "50%",
          }}
        />

        {/* ── Logo block ── */}
        <Box
          sx={{
            textAlign: "center",
            mb: 4.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* logo wrapper with glow */}
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              mb: 2.5,
              "&::before": {
                content: '""',
                position: "absolute",
                inset: "-20px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0,214,176,0.18) 0%, transparent 70%)",
                pointerEvents: "none",
                animation: "pulse 3.5s ease-in-out infinite",
              },
              "@keyframes pulse": {
                "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
                "50%": { opacity: 1, transform: "scale(1.08)" },
              },
            }}
          >
            <img
              src={logo}
              alt="ClassPulse"
              style={{
                width: 160,
                height: "auto",
                filter:
                  "drop-shadow(0 0 14px rgba(0,214,176,0.45)) drop-shadow(0 0 32px rgba(0,160,255,0.2))",
              }}
            />
          </Box>

          {/* brand name */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: "1.45rem",
              letterSpacing: "-0.02em",
              background:
                "linear-gradient(100deg, #00d6b0 10%, #00aaff 55%, #00d6b0 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 4s linear infinite",
              "@keyframes shimmer": {
                "0%": { backgroundPosition: "0% center" },
                "100%": { backgroundPosition: "200% center" },
              },
            }}
          >
            ClassPulse
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.75,
              color: "rgba(255,255,255,0.32)",
              fontSize: "0.78rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            Gestão inteligente de turmas
          </Typography>
        </Box>

        {/* ── Divider ── */}
        <Box
          sx={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
            mb: 4,
          }}
        />

        {/* ── Form ── */}
        <form onSubmit={handleLogin} noValidate>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email
                      sx={{
                        color: "rgba(0,214,176,0.5)",
                        fontSize: "1.1rem",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock
                      sx={{
                        color: "rgba(0,214,176,0.5)",
                        fontSize: "1.1rem",
                      }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      tabIndex={-1}
                      sx={{
                        color: "rgba(255,255,255,0.3)",
                        "&:hover": { color: "rgba(0,214,176,0.7)" },
                        transition: "color 0.2s",
                      }}
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* error */}
          {error && (
            <Box
              sx={{
                mt: 2,
                px: 2,
                py: 1.25,
                borderRadius: "10px",
                background: "rgba(255,60,60,0.08)",
                border: "1px solid rgba(255,60,60,0.2)",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,100,100,0.95)",
                  fontSize: "0.8rem",
                  textAlign: "center",
                  letterSpacing: "0.01em",
                }}
              >
                {error}
              </Typography>
            </Box>
          )}

          {/* submit */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            sx={{
              mt: 3.5,
              py: 1.65,
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "0.04em",
              textTransform: "none",
              position: "relative",
              overflow: "hidden",
              background:
                "linear-gradient(100deg, #00d6b0 0%, #00aaff 60%, #00d6b0 120%)",
              backgroundSize: "200% auto",
              color: "#03111e",
              boxShadow:
                "0 4px 24px rgba(0,214,176,0.28), 0 1px 0 rgba(255,255,255,0.15) inset",
              transition:
                "transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s, background-position 0.5s",
              "&:hover:not(:disabled)": {
                transform: "translateY(-2px) scale(1.01)",
                boxShadow:
                  "0 8px 36px rgba(0,214,176,0.42), 0 1px 0 rgba(255,255,255,0.2) inset",
                backgroundPosition: "right center",
              },
              "&:active:not(:disabled)": {
                transform: "translateY(0) scale(0.99)",
                boxShadow: "0 2px 12px rgba(0,214,176,0.25)",
              },
              "&:disabled": {
                background: "rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.2)",
                boxShadow: "none",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={22} thickness={5} sx={{ color: "#03111e" }} />
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        {/* ── Footer note ── */}
        <Typography
          variant="body2"
          sx={{
            mt: 3.5,
            textAlign: "center",
            color: "rgba(255,255,255,0.16)",
            fontSize: "0.72rem",
            letterSpacing: "0.04em",
          }}
        >
          © {new Date().getFullYear()} ClassPulse · Todos os direitos reservados
        </Typography>
      </Paper>
    </Box>
  );
}

export default Login;
