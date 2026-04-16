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
  Stack,
  Card,
  CardContent,
  CircularProgress,
  TableContainer,
  TablePagination,
  useTheme,
  useMediaQuery,
  Button,
  Tooltip,
  Autocomplete,
  IconButton,
  Collapse,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EditIcon from "@mui/icons-material/Edit";
import { apiFetch } from "../services/Api";

function Historico() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReenvio, setLoadingReenvio] = useState({});
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("todos");
  const [editTelefones, setEditTelefones] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openLotes, setOpenLotes] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [openEdit, setOpenEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [openWhatsApp, setOpenWhatsApp] = useState(false);
  const [whatsItem, setWhatsItem] = useState(null);
  const [selectedTelefone, setSelectedTelefone] = useState(null);

  // Formata telefone
  const formatarTelefone = (value) => {
    const numeros = value.replace(/\D/g, "").slice(0, 11);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 10) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  };
  const limparTelefone = (value) => value.replace(/\D/g, "");

  const toggleLote = (lote) => {
    setOpenLotes((prev) => ({ ...prev, [lote]: !prev[lote] }));
  };

  // Busca histórico
  const buscarHistorico = async () => {
    setLoading(true);
    try {
      let url = "/upload/conciliacao";
      const params = [];
      if (filtroTurma) params.push(`turma_id=${filtroTurma}`);
      if (filtroData) params.push(`data=${filtroData}`);
      if (filtroEmail !== "todos") params.push(`email_enviado=${filtroEmail}`);
      if (params.length) url += `?${params.join("&")}`;
      const res = await apiFetch(url);
      const data = await res.json();
      setHistorico(Array.isArray(data) ? data : []);
    } catch {
      setHistorico([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const buscarTurmas = async () => {
      try {
        const res = await apiFetch("/turmas/select");
        const data = await res.json();
        setTurmas(Array.isArray(data) ? data : []);
      } catch {
        setTurmas([]);
      }
    };
    buscarTurmas();
  }, []);

  useEffect(() => {
    buscarHistorico();
  }, [filtroTurma, filtroData, filtroEmail]);

  const historicoAgrupado = useMemo(() => {
    if (!Array.isArray(historico)) return [];
    const grupos = {};
    historico.forEach((item) => {
      if (!item) return;
      const chave = item.lote_importacao;
      if (!grupos[chave]) grupos[chave] = { lote: chave, data: item.data_importacao, turma_nome: item.turma_nome, turma_id: item.turma_id, itens: [] };
      grupos[chave].itens.push(item);
    });
    return Object.values(grupos).map((g) => ({ ...g, itens: Array.isArray(g.itens) ? g.itens : [] }));
  }, [historico]);

  const historicoPaginado = useMemo(() => {
    const inicio = page * rowsPerPage;
    return historicoAgrupado.slice(inicio, inicio + rowsPerPage);
  }, [historicoAgrupado, page, rowsPerPage]);

  const safeHistorico = Array.isArray(historico) ? historico : [];
  const resumo = {
    total: safeHistorico.length,
    enviados: safeHistorico.filter((i) => i?.email_enviado).length,
    erros: safeHistorico.filter((i) => !i?.email_enviado).length,
  };

  const reenviarEmail = async (item) => {
    try {
      setLoadingReenvio((prev) => ({ ...prev, [item?.id]: true }));
      const res = await apiFetch(`/emails/reenvio/${item.id}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.resultado?.status === "FALHA") throw new Error(data?.resultado?.erro || data?.message || "Erro ao reenviar email");

      setHistorico((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, email_enviado: true, erro_email: null } : i)
      );
      setSnackbar({ open: true, message: "Email reenviado com sucesso!", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Falha ao reenviar email", severity: "error" });
    } finally {
      setLoadingReenvio((prev) => ({ ...prev, [item?.id]: false }));
    }
  };

  const abrirModalWhatsApp = (item) => {
    setWhatsItem(item);
    if (Array.isArray(item?.telefones) && item.telefones.length > 0) {
      setSelectedTelefone(item.telefones[0].numero || item.telefones[0].telefone);
    } else setSelectedTelefone("");
    setOpenWhatsApp(true);
  };
  const enviarWhatsApp = () => {
    if (!selectedTelefone) return;
    window.open(`https://wa.me/55${limparTelefone(selectedTelefone)}`, "_blank");
    setOpenWhatsApp(false);
  };

  const editarRegistro = (item) => {
    setEditItem(item);
    setEditEmail(item?.email || "");
    const telefones = Array.isArray(item?.telefones) ? item.telefones : [];
    setEditTelefones(telefones.map((t) => ({
      label: t.label || "Telefone",
      numero: formatarTelefone(t.numero || t.telefone || "")
    })));
    setOpenEdit(true);
  };

  const salvarEdicao = async () => {
    try {
      setLoadingEdit(true);
      const telefonesLimpos = editTelefones.map((t) => ({ label: t.label, telefone: limparTelefone(t.numero) }));
      const res = await apiFetch(`/upload/conciliacao/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: editEmail, telefones: telefonesLimpos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.erro || "Erro ao atualizar");
      setHistorico((prev) =>
        prev.map((i) => i.id === editItem.id ? { ...i, email: editEmail, telefones: telefonesLimpos } : i)
      );
      setSnackbar({ open: true, message: "Dados atualizados com sucesso!", severity: "success" });
      setOpenEdit(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setLoadingEdit(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 }, width: "100%" }}>
      <Typography variant="h6" fontWeight={700} mb={2}>Histórico de Conciliação</Typography>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      {/* MODAIS */}
<Dialog
  open={openWhatsApp}
  onClose={() => setOpenWhatsApp(false)}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: { 
      m: 2, // margem mínima nas laterais em mobile
      width: "100%", 
      maxWidth: { xs: 350, sm: 500 }, // largura máxima do modal
      borderRadius: 3
    }
  }}
>
        <DialogTitle>Enviar WhatsApp</DialogTitle>
        <DialogContent dividers>
          <Box mb={2}><Typography variant="subtitle2" color="textSecondary">Aluno</Typography><Typography variant="body1" fontWeight={500}>{whatsItem?.nome}</Typography></Box>
          <Box mb={2}>
            <Typography variant="subtitle2" color="textSecondary" mb={0.5}>Número de telefone</Typography>
            <TextField select fullWidth size="small" placeholder="Escolha o número" value={selectedTelefone || ""} onChange={(e) => setSelectedTelefone(e.target.value)}>
              {Array.isArray(whatsItem?.telefones) && whatsItem.telefones.map((t, i) => <MenuItem key={i} value={t.numero || t.telefone}>{t.label} - {t.numero || t.telefone}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1 }}>
          <Button onClick={() => setOpenWhatsApp(false)}>Cancelar</Button>
          <Button variant="contained" onClick={enviarWhatsApp} disabled={!selectedTelefone}>Enviar</Button>
        </DialogActions>
      </Dialog>

<Dialog
  open={openEdit}
  onClose={() => setOpenEdit(false)}
  fullWidth
  maxWidth="md"
  PaperProps={{
    sx: {
      m: 2,
      width: "100%",
      maxWidth: { xs: "100%", sm: 600 }, // largura máxima desktop
      borderRadius: 3,
    },
  }}
>
  <DialogTitle>Editar Contato</DialogTitle>

  <DialogContent dividers>
    {/* Email */}
    <TextField
      fullWidth
      margin="dense"
      label="Email"
      value={editEmail}
      onChange={(e) => setEditEmail(e.target.value)}
    />

    {/* Telefones */}
    <Stack spacing={2} mt={2} direction="column">
      {editTelefones.map((tel, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" }, // coluna mobile, linha desktop
            alignItems: { xs: "flex-start", sm: "center" }, // alinhamento vertical
            gap: 1,
            width: "100%",
          }}
        >
          {/* Label */}
          <Typography
            sx={{
              width: { xs: "100%", sm: 220 }, // ocupa 100% no mobile, fixa no desktop
              flexShrink: 0,
              fontWeight: 500,
              color: "text.secondary",
            }}
          >
            {tel.label}
          </Typography>

          {/* Input */}
          <TextField
            fullWidth
            size="small"
            label="Telefone"
            value={tel.numero}
            onChange={(e) => {
              const novos = [...editTelefones];
              novos[index].numero = formatarTelefone(e.target.value);
              setEditTelefones(novos);
            }}
          />
        </Box>
      ))}
    </Stack>
  </DialogContent>

  <DialogActions sx={{ px: 3, py: 1 }}>
    <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
    <Button
      onClick={salvarEdicao}
      variant="contained"
      disabled={loadingEdit}
    >
      {loadingEdit ? <CircularProgress size={20} /> : "Salvar"}
    </Button>
  </DialogActions>
</Dialog>

      {/* RESUMO */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={2}>
        {[
          { label: "Total", value: resumo.total, color: "#0284c7", bg: "#e0f2fe" },
          { label: "Emails Enviados", value: resumo.enviados, color: "#059669", bg: "#d1fae5" },
          { label: "Erros", value: resumo.erros, color: "#dc2626", bg: "#fee2e2" },
        ].map((item, i) => (
          <Card key={i} sx={{ flex: 1, borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <CardContent sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ background: item.bg, p: 1, borderRadius: 2, color: item.color }}>{item.label === "Erros" ? <CancelIcon /> : <CheckCircleIcon />}</Box>
                <Box>
                  <Typography variant="caption">{item.label}</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: item.color }}>{item.value}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* FILTROS */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={2}>
        <Autocomplete
          fullWidth
          size="small"
          options={turmas}
          getOptionLabel={(option) => option.nome_original || ""}
          value={turmas.find((t) => t.id === filtroTurma) || null}
          onChange={(e, newValue) => setFiltroTurma(newValue ? newValue.id : "")}
          renderInput={(params) => <TextField {...params} label="Turma" />}
        />
        <TextField fullWidth size="small" type="date" label="Data" InputLabelProps={{ shrink: true }} value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
        <TextField select fullWidth size="small" label="Status Email" value={filtroEmail} onChange={(e) => setFiltroEmail(e.target.value)}>
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="true">Enviados</MenuItem>
          <MenuItem value="false">Erro</MenuItem>
        </TextField>
      </Stack>

      {/* TABELA OU CARDS */}
      {isMobile ? (
        // MOBILE CARDS
        <Stack spacing={2}>
          {historicoPaginado.map((grupo) => (
            <Card key={grupo.lote} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={600}>{grupo.lote?.slice(0, 8)}...</Typography>
                  <IconButton size="small" onClick={() => toggleLote(grupo.lote)}>{openLotes[grupo.lote] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</IconButton>
                </Stack>
                <Typography variant="caption">Turma: {grupo.turma_nome}</Typography>
                <Typography variant="caption">Data: {grupo.data ? new Date(grupo.data).toLocaleDateString() : "-"}</Typography>
                <Typography variant="caption">Itens: {grupo.itens.length}</Typography>

                <Collapse in={openLotes[grupo.lote]}>
                  <Stack mt={1} spacing={1}>
                    {grupo.itens.map((item) => (
                      <Card key={item.id} variant="outlined" sx={{ p: 1 }}>
                        <Stack spacing={0.5}>
                          <Typography fontWeight={500}>{item.nome}</Typography>
                          <Typography variant="caption">RA: {item.ra}</Typography>
                          <Typography variant="caption">Email: {item.email}</Typography>
                          <Stack direction="row" spacing={1} mt={1}>
                            {!item.email_enviado && (
                              <Tooltip title="Reenviar Email">
                                <Button size="small" variant="outlined" color="error" onClick={() => reenviarEmail(item)} disabled={loadingReenvio[item?.id]}>
                                  {loadingReenvio[item?.id] ? <CircularProgress size={16} /> : <EmailIcon fontSize="small" />}
                                </Button>
                              </Tooltip>
                            )}
                            <Tooltip title="WhatsApp">
                              <Button size="small" variant="outlined" color="success" onClick={() => abrirModalWhatsApp(item)}><WhatsAppIcon fontSize="small" /></Button>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <Button size="small" variant="outlined" onClick={() => editarRegistro(item)}><EditIcon fontSize="small" /></Button>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        // DESKTOP TABLE
        <Paper sx={{ borderRadius: 4, overflow: "hidden", position: "relative" }}>
          {loading && (
            <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.6)", zIndex: 10 }}>
              <CircularProgress size={28} />
            </Box>
          )}
          <TableContainer sx={{ maxHeight: "60vh", opacity: loading ? 0.6 : 1 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Lote</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Turma</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Enviados</TableCell>
                  <TableCell>Erros</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historicoPaginado.map((grupo) => {
                  const itens = Array.isArray(grupo?.itens) ? grupo.itens : [];
                  const enviados = itens.filter(i => i?.email_enviado).length;
                  const erros = itens.length - enviados;
                  return (
                    <React.Fragment key={grupo.lote}>
                      <TableRow hover>
                        <TableCell><IconButton size="small" onClick={() => toggleLote(grupo.lote)}>{openLotes[grupo.lote] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</IconButton></TableCell>
                        <TableCell>{grupo.lote?.slice(0, 8)}...</TableCell>
                        <TableCell>{grupo.data ? new Date(grupo.data).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{grupo.turma_nome || "—"}</TableCell>
                        <TableCell>{itens.length}</TableCell>
                        <TableCell>{enviados}</TableCell>
                        <TableCell>{erros}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={7} sx={{ p: 0 }}>
                          <Collapse in={openLotes[grupo.lote]}>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ background: "#f1f5f9" }}>
                                  <TableCell>Aluno</TableCell>
                                  <TableCell>RA</TableCell>
                                  <TableCell>Contato</TableCell>
                                  <TableCell>Faltas</TableCell>
                                  <TableCell>Data</TableCell>
                                  <TableCell>Lote</TableCell>
                                  <TableCell>Status</TableCell>
                                  <TableCell>Ações</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {itens.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{item?.nome}</TableCell>
                                    <TableCell>{item?.ra}</TableCell>
                                    <TableCell>{item?.email}</TableCell>
                                    <TableCell><Chip label={item?.total_faltas || 0} size="small" /></TableCell>
                                    <TableCell>{item?.data_importacao ? new Date(item.data_importacao).toLocaleDateString() : "-"}</TableCell>
                                    <TableCell>{item?.lote_importacao?.slice(0, 8)}...</TableCell>
                                    <TableCell><Chip label={item?.email_enviado ? "Enviado" : "Erro"} color={item?.email_enviado ? "success" : "error"} size="small" /></TableCell>
                                    <TableCell>
                                      <Stack direction="row" spacing={1}>
                                        {!item?.email_enviado && (
                                          <Tooltip title="Reenviar Email">
                                            <Button size="small" variant="outlined" color="error" onClick={() => reenviarEmail(item)} disabled={loadingReenvio[item?.id]}>
                                              {loadingReenvio[item?.id] ? <CircularProgress size={16} /> : <EmailIcon fontSize="small" />}
                                            </Button>
                                          </Tooltip>
                                        )}
                                        <Tooltip title="WhatsApp">
                                          <Button size="small" variant="outlined" color="success" onClick={() => abrirModalWhatsApp(item)}><WhatsAppIcon fontSize="small" /></Button>
                                        </Tooltip>
                                        <Tooltip title="Editar">
                                          <Button size="small" variant="outlined" onClick={() => editarRegistro(item)}><EditIcon fontSize="small" /></Button>
                                        </Tooltip>
                                      </Stack>
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
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={historicoAgrupado.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </Paper>
      )}
    </Box>
  );
}

export default Historico;