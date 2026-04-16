import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  TableContainer,
  TablePagination,
  useTheme,
  useMediaQuery,
  Tooltip,
  Autocomplete,
  IconButton,
  Collapse,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteIcon from "@mui/icons-material/Delete";
import PercentIcon from "@mui/icons-material/Percent";
import WarningIcon from "@mui/icons-material/Warning";
import GroupsIcon from "@mui/icons-material/Groups";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { apiFetch } from "../services/api";

function HistoricoRanking() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [dados, setDados] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [turmaId, setTurmaId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openTurma, setOpenTurma] = useState({});
  const [openDelete, setOpenDelete] = useState(false);
  const [itemDelete, setItemDelete] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // ================= BUSCA =================
  const buscar = async () => {
    setLoading(true);
    try {
      let url = "/ranking/tabela";
      const params = [];

      if (turmaId) params.push(`turmaId=${turmaId}`);
      if (dataInicio) params.push(`dataInicio=${dataInicio}`);
      if (dataFim) params.push(`dataFim=${dataFim}`);

      if (params.length) url += `?${params.join("&")}`;

      const res = await apiFetch(url);
      const data = await res.json();

      setDados(Array.isArray(data) ? data : []);
    } catch {
      setDados([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscar();
  }, [turmaId, dataInicio, dataFim]);

  useEffect(() => {
    apiFetch("/turmas/select")
      .then((r) => r.json())
      .then(setTurmas)
      .catch(() => setTurmas([]));
  }, []);

  // ================= AGRUPAMENTO =================
  const agrupado = useMemo(() => {
    const meses = {};

    dados.forEach((item) => {
      const data = new Date(item.data_inicio);

      const mesKey = data.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
      });

      if (!meses[mesKey]) {
        meses[mesKey] = {
          mes: mesKey,
          turmas: {}
        };
      }

      if (!meses[mesKey].turmas[item.turma_id]) {
        meses[mesKey].turmas[item.turma_id] = {
          turmaId: item.turma_id,
          nome:
            turmas.find((t) => t.id === item.turma_id)?.nome_original ||
            `Turma ${item.turma_id}`,
          itens: []
        };
      }

      meses[mesKey].turmas[item.turma_id].itens.push(item);
    });

    return Object.values(meses).map((mes) => ({
      ...mes,
      turmas: Object.values(mes.turmas).map((turma) => {
        const itensOrdenados = turma.itens.sort(
          (a, b) => new Date(a.data_inicio) - new Date(b.data_inicio)
        );

        const inicio = new Date(
          Math.min(...itensOrdenados.map((i) => new Date(i.data_inicio)))
        );

        const fim = new Date(
          Math.max(...itensOrdenados.map((i) => new Date(i.data_fim)))
        );

 const totalPossivel = itensOrdenados.reduce(
  (acc, i) => acc + i.total_alunos * i.dias_aula,
  0
);

const totalPresente = itensOrdenados.reduce(
  (acc, i) => acc + (i.total_alunos * i.dias_aula - i.total_faltas),
  0
);

const media =
  totalPossivel > 0 ? (totalPresente * 100) / totalPossivel : 0;

        return {
          ...turma,
          itens: itensOrdenados,
          periodoInicio: inicio,
          periodoFim: fim,
          mediaPresenca: media.toFixed(2)
        };
      })
    }));
  }, [dados, turmas]);

  const paginado = useMemo(() => {
    const inicio = page * rowsPerPage;
    return agrupado.slice(inicio, inicio + rowsPerPage);
  }, [agrupado, page, rowsPerPage]);

  const toggleTurma = (key) => {
    setOpenTurma((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ================= RESUMO INTELIGENTE =================
  // ================= RESUMO INTELIGENTE =================
const resumo = useMemo(() => {
  // Calcula total de presenças ponderadas
  const totalPossivel = dados.reduce((acc, i) => acc + i.total_alunos * i.dias_aula, 0);
  const totalPresente = dados.reduce((acc, i) => acc + ((i.total_alunos * i.dias_aula) - i.total_faltas), 0);
  
  const mediaPresenca = totalPossivel > 0 ? ((totalPresente * 100) / totalPossivel).toFixed(2) : 0;

  const semanasUnicas = new Set(dados.map((i) => `${i.data_inicio}-${i.data_fim}`)).size;
  const totalTurmas = new Set(dados.map((i) => i.turma_id)).size;
  const totalFaltas = dados.reduce((acc, i) => acc + i.total_faltas, 0);

  return {
    semanasUnicas,
    totalFaltas,
    mediaPresenca,
    totalTurmas
  };
}, [dados]);


  const getColor = (valor) => {
    if (valor >= 85) return "#059669";
    if (valor >= 70) return "#d97706";
    return "#dc2626";
  };

  const excluir = async () => {
    try {
      await apiFetch(`/ranking/${itemDelete.id}`, {
        method: "DELETE"
      });

      setDados((prev) => prev.filter((i) => i.id !== itemDelete.id));

      setSnackbar({ open: true, message: "Excluído com sucesso", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Erro ao excluir", severity: "error" });
    } finally {
      setOpenDelete(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Histórico de Ranking
      </Typography>

      <Snackbar open={snackbar.open} autoHideDuration={3000}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      {/* ================= CARDS BONITOS ================= */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={2}>
        {[
          {
            label: "Presença Média",
            value: `${resumo.mediaPresenca}%`,
            color: getColor(resumo.mediaPresenca),
            bg: "#ecfdf5",
            icon: <PercentIcon />
          },
          {
            label: "Faltas",
            value: resumo.totalFaltas,
            color: "#dc2626",
            bg: "#fee2e2",
            icon: <WarningIcon />
          },
          {
            label: "Turmas",
            value: resumo.totalTurmas,
            color: "#2563eb",
            bg: "#dbeafe",
            icon: <GroupsIcon />
          },
          {
            label: "Semanas únicas",
            value: resumo.semanasUnicas,
            color: "#7c3aed",
            bg: "#ede9fe",
            icon: <CalendarMonthIcon />
          }
        ].map((item, i) => (
          <Card
            key={i}
            sx={{
              flex: 1,
              borderRadius: 3,
              border: "1px solid #e2e8f0"
            }}
          >
            <CardContent sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    background: item.bg,
                    p: 1,
                    borderRadius: 2,
                    color: item.color,
                    display: "flex"
                  }}
                >
                  {item.icon}
                </Box>

                <Box>
                  <Typography variant="caption">
                    {item.label}
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: item.color }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* resto da tela continua igual */}

      {/* FILTROS */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
        <Autocomplete
          fullWidth
          size="small"
          options={turmas}
          getOptionLabel={(o) => o.nome_original || ""}
          value={turmas.find((t) => t.id === turmaId) || null}
          onChange={(e, v) => setTurmaId(v ? v.id : "")}
          renderInput={(params) => <TextField {...params} label="Turma" />}
        />

        <TextField
          type="date"
          size="small"
          fullWidth
          label="Início"
          InputLabelProps={{ shrink: true }}
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
        />

        <TextField
          type="date"
          size="small"
          fullWidth
          label="Fim"
          InputLabelProps={{ shrink: true }}
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
        />
      </Stack>

      {/* TABELA */}
      <Paper sx={{ borderRadius: 4 }}>
        <TableContainer sx={{ maxHeight: "65vh" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Turma</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Presença Média</TableCell>
                <TableCell>Semanas</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginado.map((mes) => (
                <React.Fragment key={mes.mes}>
                  <TableRow sx={{ background: "#273b5d" }}>
                    <TableCell colSpan={5} sx={{ color: "#fff", fontWeight: 700 }}>
                      {mes.mes}
                    </TableCell>
                  </TableRow>

                  {mes.turmas.map((turma) => {
                    const key = `${mes.mes}-${turma.turmaId}`;

                    return (
                      <React.Fragment key={key}>
                        <TableRow hover>
                          <TableCell>
                            <IconButton onClick={() => toggleTurma(key)}>
                              {openTurma[key] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            </IconButton>
                          </TableCell>

                          <TableCell>{turma.nome}</TableCell>

                          <TableCell>
                            {turma.periodoInicio.toLocaleDateString()} -{" "}
                            {turma.periodoFim.toLocaleDateString()}
                          </TableCell>

                          <TableCell>
                            <Chip label={`${turma.mediaPresenca}%`} color="success" size="small" />
                          </TableCell>

                          <TableCell>
                            <Chip label={turma.itens.length} size="small" />
                          </TableCell>
                        </TableRow>

                        {/* DETALHE */}
                        <TableRow>
                          <TableCell colSpan={5} sx={{ p: 0 }}>
                            <Collapse in={openTurma[key]}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow sx={{ background: "#f1f5f9" }}>
                                    <TableCell>Semana</TableCell>
                                    <TableCell>Alunos</TableCell>
                                    <TableCell>Faltas</TableCell>
                                    <TableCell>Presença</TableCell>
                                    <TableCell>Ações</TableCell>
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  {turma.itens.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>
                                        {new Date(item.data_inicio).toLocaleDateString()} -{" "}
                                        {new Date(item.data_fim).toLocaleDateString()}
                                      </TableCell>

                                      <TableCell>{item.total_alunos}</TableCell>
                                      <TableCell>{item.total_faltas}</TableCell>

                                      <TableCell>
                                        <Chip label={`${item.porcentagem_presenca}%`} color="success" size="small" />
                                      </TableCell>

                                      <TableCell>
                                        <Tooltip title="Excluir">
                                          <IconButton
                                            color="error"
                                            onClick={() => {
                                              setItemDelete(item);
                                              setOpenDelete(true);
                                            }}
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Tooltip>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={agrupado.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* DELETE */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Excluir registro</DialogTitle>
        <DialogContent>Tem certeza?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={excluir}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HistoricoRanking;