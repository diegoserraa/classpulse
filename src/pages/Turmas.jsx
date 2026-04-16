import React, { useState, useEffect, useMemo } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Switch
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { apiFetch } from "../services/api";

function Turma() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  const [turmas, setTurmas] = useState([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // mantido para uso futuro (sem loader visual)

  const [buscaNome, setBuscaNome] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDados, setModalDados] = useState({
    id: null,
    nome_original: "",
    nome_fantasia: "",
    foto_url: "",
  });
  const [preview, setPreview] = useState("");

  const buscarTurmas = async (isInitial = false) => {
    if (isInitial) setInitialLoading(true);

    try {
      const res = await apiFetch("/turmas");
      const data = await res.json();
      setTurmas(data);
    } catch (err) {
      console.error("Erro ao buscar turmas:", err);
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  };

  useEffect(() => {
    buscarTurmas(true);
  }, []);

  const alternarStatus = async (id, ativoAtual) => {
    setTurmas((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ativo: !ativoAtual } : t
      )
    );

    try {
      await apiFetch(`/turmas/${id}/ativo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !ativoAtual }),
      });

      buscarTurmas();
    } catch (err) {
      console.error("Erro ao alternar status:", err);
    }
  };

  const abrirModalAdicionar = () => {
    setModalDados({ id: null, nome_original: "", nome_fantasia: "", foto_url: "" });
    setPreview("");
    setModalOpen(true);
  };

  const abrirModalEditar = (turma) => {
    setModalDados({
      id: turma.id,
      nome_original: turma.nome_original,
      nome_fantasia: turma.nome_fantasia,
      foto_url: turma.foto_url,
    });
    setPreview(turma.foto_url);
    setModalOpen(true);
  };

  const salvarTurma = async () => {
    const { id, nome_original, nome_fantasia, foto_url } = modalDados;

    if (!nome_original || !nome_fantasia || !foto_url) {
      alert("Todos os campos são obrigatórios.");
      return;
    }

    try {
      if (id) {
        await apiFetch(`/turmas/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome_original, nome_fantasia, foto_url }),
        });
      } else {
        await apiFetch("/turmas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome_original, nome_fantasia, foto_url }),
        });
      }

      setModalOpen(false);
      buscarTurmas();
    } catch (err) {
      console.error("Erro ao salvar turma:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setModalDados({ ...modalDados, foto_url: reader.result });
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const turmasFiltradas = useMemo(() => {
    return turmas.filter((t) => {
      const nomeMatch = t.nome_fantasia.toLowerCase().includes(buscaNome.toLowerCase());
      const statusMatch =
        statusFiltro === "todos" ||
        (statusFiltro === "ativa" && t.ativo) ||
        (statusFiltro === "inativa" && !t.ativo);
      return nomeMatch && statusMatch;
    });
  }, [turmas, buscaNome, statusFiltro]);

  const turmasPaginadas = useMemo(() => {
    const inicio = page * rowsPerPage;
    const fim = inicio + rowsPerPage;
    return turmasFiltradas.slice(inicio, fim);
  }, [turmasFiltradas, page, rowsPerPage]);

  const resumo = {
    total: turmasFiltradas.length,
    ativas: turmasFiltradas.filter((t) => t.ativo).length,
    inativas: turmasFiltradas.filter((t) => !t.ativo).length,
  };

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={3}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 }, width: "100%" }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Turmas
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={2}>
        {[
          { label: "Total", value: resumo.total, icon: <CheckCircleIcon />, bg: "#e0f2fe", color: "#0284c7", border: "#e2e8f0" },
          { label: "Ativas", value: resumo.ativas, icon: <CheckCircleIcon />, bg: "#d1fae5", color: "#059669", border: "#bbf7d0" },
          { label: "Inativas", value: resumo.inativas, icon: <CancelIcon />, bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
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

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={2}>
        <TextField fullWidth size="small" label="Buscar por nome" value={buscaNome} onChange={(e) => setBuscaNome(e.target.value)} />
        <TextField select fullWidth size="small" label="Status" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="ativa">Ativa</MenuItem>
          <MenuItem value="inativa">Inativa</MenuItem>
        </TextField>
      </Stack>

      <Box mb={2} display="flex" justifyContent={{ xs: "stretch", md: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth={isSmall}
          sx={{ bgcolor: "rgb(30, 41, 59)", "&:hover": { bgcolor: "#0f172a" } }}
          onClick={abrirModalAdicionar}
        >
          Adicionar Turma
        </Button>
      </Box>

      {isSmall ? (
        <Stack spacing={1.5}>
          {turmasPaginadas.map((turma) => (
            <Card key={turma.id}>
              <CardContent sx={{ p: 1.5 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={turma.foto_url} />
                  <Box>
                    <Typography fontWeight={600}>{turma.nome_fantasia}</Typography>
                    <Typography variant="body2">{turma.nome_original}</Typography>
                    <Typography variant="body2">Faltas: {turma.porcentagem_faltas}%</Typography>
                  </Box>
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="space-between" mt={1}>
                  <Chip label={turma.ativo ? "Ativa" : "Inativa"} color={turma.ativo ? "success" : "error"} />

                  <Switch
                    checked={turma.ativo}
                    onChange={() => alternarStatus(turma.id, turma.ativo)}
                    color="success"
                  />
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Button size="small" variant="outlined" onClick={() => abrirModalEditar(turma)}>
                  Editar
                </Button>
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
                  <TableCell sx={{ fontWeight: 600 }}>Turma</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Faltas</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ações</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                

                {turmasPaginadas.map((turma) => (
                  <TableRow key={turma.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={turma.foto_url} sx={{ width: 40, height: 40 }} />
                        <Box>
                          <Typography fontWeight={600}>{turma.nome_fantasia}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {turma.nome_original}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip label={`${turma.porcentagem_faltas}%`} size="small" />
                    </TableCell>

                    <TableCell>
                      <Switch
                        checked={turma.ativo}
                        onChange={() => alternarStatus(turma.id, turma.ativo)}
                        color="success"
                      />
                    </TableCell>

                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => abrirModalEditar(turma)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={turmasFiltradas.length}
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

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{modalDados.id ? "Editar Turma" : "Adicionar Turma"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Nome Original" fullWidth value={modalDados.nome_original} onChange={(e) => setModalDados({ ...modalDados, nome_original: e.target.value })} />
            <TextField label="Nome Fantasia" fullWidth value={modalDados.nome_fantasia} onChange={(e) => setModalDados({ ...modalDados, nome_fantasia: e.target.value })} />
            <Button variant="outlined" component="label">
              Selecionar Foto
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {preview && <Avatar src={preview} sx={{ width: 100, height: 100 }} />}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarTurma}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Turma;
