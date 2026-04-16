import { Box, Toolbar, AppBar, Typography, IconButton, Avatar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // remove token
    navigate("/login"); // redireciona para login
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Conteúdo principal */}
      <Box sx={{ flexGrow: 1 }}>
        {/* TopBar */}
        <AppBar
          position="fixed"
          sx={{
            ml: sidebarOpen ? "220px" : "60px",
            width: sidebarOpen ? "calc(100% - 220px)" : "calc(100% - 60px)",
            backgroundColor: "#0f172a",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            transition: "all 0.3s"
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            
            {/* Lado esquerdo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                color="inherit"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <MenuIcon />
              </IconButton>

              <Typography variant="h6" noWrap>
                CLASSPULSE
              </Typography>
            </Box>

            {/* Lado direito */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
             

              <IconButton color="inherit" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </Box>

          </Toolbar>
        </AppBar>

        {/* Conteúdo */}
        <Box
          component="main"
          sx={{
            p: 3,
            pt: 10,
            minHeight: "100vh",
            backgroundColor: "#f3f4f6",
            transition: "all 0.3s"
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;