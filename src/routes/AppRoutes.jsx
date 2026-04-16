import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Conciliacao from "../pages/Conciliacao";
import MainLayout from "../layouts/MainLayout";
import Turmas from "../pages/Turmas";
import Historico from "../pages/Historico";
import CadastroRanking from "../pages/CadastroRanking";
import HistoricoRanking from "../pages/HistoricoRanking";
import RankingGamificado from "../pages/temas/RankingGamificado";
import RankingGamificado2 from "../pages/temas/RankingGamificado2";
import RankingGamificado3 from "../pages/temas/RankingGamificado3";
import MinecrafitClaro from "../pages/temas/MinecraftClaro";
import MinecrafitEscuro from "../pages/temas/MinecraftEscuro";
import Futuristico from "../pages/temas/Futuristico";
import Users from "../pages/Users";
import SelectTema from "../pages/SelectTema";
import Totem from "../pages/Totem";

/* 🔐 Função pra pegar user do token */
function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

/* 🔐 Proteção de rota */
function PrivateRoute({ children, roles = [] }) {
  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* 🔓 ROTAS LIVRES (SEM LOGIN) */}
        <Route path="/game" element={<RankingGamificado />} />
        <Route path="/game2" element={<RankingGamificado2 />} />
        <Route path="/game3" element={<RankingGamificado3 />} />
         <Route path="/game4" element={<MinecrafitClaro />} />
        <Route path="/game5" element={<MinecrafitEscuro />} />
        <Route path="/game6" element={<Futuristico />} />
        <Route path="/totem" element={<Totem />} />
      

        {/* 🔐 ROTAS PROTEGIDAS */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/conciliacao"
          element={
            <PrivateRoute>
              <MainLayout>
                <Conciliacao />
              </MainLayout>
            </PrivateRoute>
          }
        />
         <Route
          path="/tema"
          element={
            <PrivateRoute>
              <MainLayout>
                <SelectTema />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/turmas"
          element={
            <PrivateRoute>
              <MainLayout>
                <Turmas />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* 🔥 SOMENTE ADMIN */}
        <Route
          path="/usuarios"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <MainLayout>
                <Users />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/historico"
          element={
            <PrivateRoute>
              <MainLayout>
                <Historico />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/cadastro-ranking"
          element={
            <PrivateRoute>
              <MainLayout>
                <CadastroRanking />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/historico-ranking"
          element={
            <PrivateRoute>
              <MainLayout>
                <HistoricoRanking />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;