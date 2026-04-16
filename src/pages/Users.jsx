import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  TableContainer,
  TablePagination,
  useTheme,
  useMediaQuery,
  Divider,
  Switch
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";

import ModalAdicionarUsuario from "../components/ModalAdicionarUsuario";
import { apiFetch } from "../services/api";

function Users() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [buscaNome, setBuscaNome] = useState("");
  const [buscaEmail, setBuscaEmail] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openModal, setOpenModal] = useState(false);

  // =============================
  // BUSCAR USUÁRIOS
  // =============================
  const buscarUsuarios = async () => {
    try {
      setLoading(true);

      const res = await apiFetch("/auth/users");

      if (!res.ok) throw new Error("Erro ao buscar usuários");

      const data = await res.json();

      const usuariosTratados = (Array.isArray(data) ? data : []).map((u) => ({
        ...u,
        ativo: Boolean(u.ativo),
      }));

      setUsuarios(usuariosTratados);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarUsuarios();
  }, []);

  // =============================
  // ATIVAR / INATIVAR
  // =============================
  const alternarStatus = async (id, ativoAtual) => {
    const novoStatus = !ativoAtual;

    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, ativo: novoStatus } : u
      )
    );

    try {
      const response = await apiFetch(`/auth/users/${id}/ativo`, {
        method: "PATCH",
        body: { ativo: novoStatus },
      });

      if (!response.ok) throw new Error("Erro ao atualizar status");
    } catch (error) {
      console.error("Erro ao atualizar:", error);

      // rollback
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, ativo: ativoAtual } : u
        )
      );
    }
  };

  // =============================
  // FILTRO
  // =============================
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const nomeMatch =
        u.nome?.toLowerCase().includes(buscaNome.toLowerCase()) ?? false;

      const emailMatch =
        u.email?.toLowerCase().includes(buscaEmail.toLowerCase()) ?? false;

      const statusMatch =
        statusFiltro === "todos" ||
        (statusFiltro === "ativo" && u.ativo) ||
        (statusFiltro === "inativo" && !u.ativo);

      return nomeMatch && emailMatch && statusMatch;
    });
  }, [usuarios, buscaNome, buscaEmail, statusFiltro]);

  useEffect(() => {
    setPage(0);
  }, [buscaNome, buscaEmail, statusFiltro]);

  const usuariosPaginados = useMemo(() => {
    const inicio = page * rowsPerPage;
    return usuariosFiltrados.slice(inicio, inicio + rowsPerPage);
  }, [usuariosFiltrados, page, rowsPerPage]);

  const resumo = {
    total: usuariosFiltrados.length,
    ativos: usuariosFiltrados.filter((u) => u.ativo).length,
    inativos: usuariosFiltrados.filter((u) => !u.ativo).length,
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={3}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 }, width: "100%" }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Usuários
      </Typography>

      {/* RESUMO estilo Turma */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={2}>
        {[
          { label: "Total", value: resumo.total, icon: <PersonIcon />, bg: "#e0f2fe", color: "#0284c7", border: "#e2e8f0" },
          { label: "Ativos", value: resumo.ativos, icon: <CheckCircleIcon />, bg: "#d1fae5", color: "#059669", border: "#bbf7d0" },
          { label: "Inativos", value: resumo.inativos, icon: <CancelIcon />, bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
        ].map((item, i) => (
          <Card key={i} sx={{ flex: 1, borderRadius: 3, border: `1px solid ${item.border}` }}>
            <CardContent sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ background: item.bg, p: 1, borderRadius: 2, color: item.color }}>
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="caption">{item.label}</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: item.color }}>
                    {item.value}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* FILTROS */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={2}>
        <TextField fullWidth size="small" label="Buscar por nome" value={buscaNome} onChange={(e) => setBuscaNome(e.target.value)} />
        <TextField fullWidth size="small" label="Buscar por email" value={buscaEmail} onChange={(e) => setBuscaEmail(e.target.value)} />
        <TextField select fullWidth size="small" label="Status" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="ativo">Ativo</MenuItem>
          <MenuItem value="inativo">Inativo</MenuItem>
        </TextField>
      </Stack>

      <Box mb={2} display="flex" justifyContent={{ xs: "stretch", md: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          fullWidth={isSmall}
          sx={{ bgcolor: "rgb(30, 41, 59)", "&:hover": { bgcolor: "#333" } }}
        >
          Adicionar Usuário
        </Button>
      </Box>

      <ModalAdicionarUsuario
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => {
          buscarUsuarios();
          setOpenModal(false);
        }}
      />

      {/* MOBILE */}
      {isSmall ? (
        <Stack spacing={1.5}>
          {usuariosPaginados.map((u) => (
            <Card key={u.id}>
              <CardContent sx={{ p: 1.5 }}>
                <Typography fontWeight={600}>{u.nome}</Typography>
                <Typography variant="body2">{u.email}</Typography>

                <Stack direction="row" justifyContent="space-between" mt={1}>
                  <Chip label={u.ativo ? "Ativo" : "Inativo"} color={u.ativo ? "success" : "error"} />
                  <Switch
                    checked={u.ativo}
                    onChange={() => alternarStatus(u.id, u.ativo)}
                    color="success"
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Paper sx={{ borderRadius: 4, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <TableContainer sx={{ maxHeight: "55vh" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {usuariosPaginados.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.nome}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Switch
                        checked={u.ativo}
                        onChange={() => alternarStatus(u.id, u.ativo)}
                        color="success"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={usuariosFiltrados.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      )}
    </Box>
  );
}

export default Users;