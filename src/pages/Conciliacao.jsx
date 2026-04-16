import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  MenuItem,
  TextField
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiFetch } from "../services/Api";

function Conciliacao() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [fileFaltas, setFileFaltas] = useState(null);
  const [fileDados, setFileDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [pageFaltosos, setPageFaltosos] = useState(0);
  const [pageNaoEncontrados, setPageNaoEncontrados] = useState(0);

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const rowsPerPage = 5;
  const tableContainerHeight = 200;

  const fileFaltasRef = useRef(null);
  const fileDadosRef = useRef(null);

  // NOVO — formatador de telefone
const formatarTelefone = (telefones) => {
  if (!telefones || telefones.length === 0) return "-";

  return telefones
    .map((tel) => {
      const numero = String(tel.numero || "").replace(/\D/g, "");

      if (numero.length === 11) {
        return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
      }

      if (numero.length === 10) {
        return `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`;
      }

      return tel.numero;
    })
    .join(", ");
};

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const response = await apiFetch("/turmas/select", {
          headers: { Accept: "application/json" }
        });
        const data = await response.json();
        setTurmas(data);
      } catch (error) {
        console.error("Erro ao buscar turmas:", error);
      }
    };
    fetchTurmas();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const resetarTela = () => {
    setFileFaltas(null);
    setFileDados(null);
    setResultado(null);
    setEmailEnviado(false);
    setPageFaltosos(0);
    setPageNaoEncontrados(0);
    setTurmaSelecionada("");

    if (fileFaltasRef.current) fileFaltasRef.current.value = null;
    if (fileDadosRef.current) fileDadosRef.current.value = null;
  };

  const handleConciliar = async () => {
    if (!fileFaltas || !fileDados || !turmaSelecionada) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("alunos", fileDados);
      formData.append("faltas", fileFaltas);
      formData.append("turma_id", turmaSelecionada);

      const response = await apiFetch("/upload/planilhas", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setResultado(data);
      setPageFaltosos(0);
      setPageNaoEncontrados(0);
      setEmailEnviado(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erro ao enviar arquivos.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const deletarLoteInterno = async (loteId) => {
    try {
      await apiFetch(`/upload/${loteId}`, {
        method: "DELETE"
      });
    } catch (error) {
      console.error("Erro ao deletar lote:", error);
    }
  };

  const handleEnviarEmail = async () => {
    if (!resultado) return;

    setEnviandoEmail(true);

    try {
      const response = await apiFetch(
        `/emails/lote/${resultado.lote_importacao}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao enviar emails.");
      }

      setSnackbar({
        open: true,
        message: "Emails enviados com sucesso!",
        severity: "success"
      });

      setEmailEnviado(true);
      resetarTela();
    } catch (error) {
      await deletarLoteInterno(resultado.lote_importacao);

      setSnackbar({
        open: true,
        message:
          error.message ||
          "Erro ao enviar emails. Lote removido automaticamente.",
        severity: "error"
      });

      resetarTela();
    } finally {
      setEnviandoEmail(false);
    }
  };

  const handleDeletarLote = async () => {
    if (!resultado) return;

    try {
      const response = await apiFetch(
        `/upload/${resultado.lote_importacao}`,
        {
          method: "DELETE"
        }
      );

      await response.json();

      setSnackbar({
        open: true,
        message: `Lote ${resultado.lote_importacao} deletado.`,
        severity: "info"
      });

      resetarTela();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erro ao deletar lote.",
        severity: "error"
      });
    }
  };

  const btnSmallStyle = {
    height: 40,
    lineHeight: "40px",
    padding: "0 14px",
    fontWeight: "normal",
    textTransform: "none",
  };

  const temFaltosos = resultado?.faltosos?.length > 0;
  const temNaoEncontrados = resultado?.naoEncontrados?.length > 0;
  return (
    <Box sx={{ mt: 2, mb: 6, px: { xs: 1, sm: 2 }, display: "flex", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 1300, mx: "auto", boxSizing: "border-box", overflowX: "hidden" }}>
        <Paper elevation={6} sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2, border: "1px solid rgba(0,0,0,0.1)" }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Conciliação de Dados</Typography>
          <Typography sx={{ mb: 2, color: "text.secondary", fontSize: 12 }}>
            Faça upload das planilhas de faltas e dados dos alunos.
          </Typography>

          <Stack
            spacing={1}
            direction={isMobile ? "column" : "row"}
            alignItems="center"
            sx={{ width: "100%", gap: 1 }}
          >
            <TextField
              select
              label="Turma"
              size="small"
              value={turmaSelecionada}
              onChange={(e) => setTurmaSelecionada(e.target.value)}
              sx={{
                width: 350,
                flexShrink: 0,
                "& .MuiSelect-select": {
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }
              }}
              SelectProps={{
                MenuProps: {
                  PaperProps: { style: { maxHeight: 200 } }
                }
              }}
            >
              {turmas.map((turma) => (
                <MenuItem
                  key={turma.id}
                  value={turma.id}
                  sx={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {turma.nome_original}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              component="label"
              size="small"
              sx={{
                ...btnSmallStyle,
                flexGrow: 0.8,
                width: isMobile ? "100%" : 160,
                backgroundColor: fileFaltas ? "rgba(0, 123, 255, 0.1)" : "inherit",
                "&:hover": {
                  backgroundColor: fileFaltas ? "rgba(0, 123, 255, 0.15)" : "inherit",
                }
              }}
            >
              {fileFaltas ? fileFaltas.name : "Faltas.csv"}
              <input
                ref={fileFaltasRef}
                hidden
                type="file"
                onChange={(e) => setFileFaltas(e.target.files[0])}
              />
            </Button>

            <Button
              variant="outlined"
              component="label"
              size="small"
              sx={{
                ...btnSmallStyle,
                flexGrow: 0.8,
                width: isMobile ? "100%" : 160,
                backgroundColor: fileDados ? "rgba(0, 123, 255, 0.1)" : "inherit",
                "&:hover": {
                  backgroundColor: fileDados ? "rgba(0, 123, 255, 0.15)" : "inherit",
                }
              }}
            >
              {fileDados ? fileDados.name : "Alunos.csv"}
              <input
                ref={fileDadosRef}
                hidden
                type="file"
                onChange={(e) => setFileDados(e.target.files[0])}
              />
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<UploadFileIcon />}
              sx={{
                ...btnSmallStyle,
                flexShrink: 0,
                minWidth: isMobile ? "100%" : 130,
              }}
              onClick={handleConciliar}
              disabled={!fileFaltas || !fileDados || !turmaSelecionada}
            >
              Conciliar
            </Button>
          </Stack>

          {loading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography sx={{ mt: 0.5, fontSize: 11 }}>
                Processando arquivos...
              </Typography>
            </Box>
          )}
        </Paper>

        {resultado && (
          <Box>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeletarLote}
                disabled={emailEnviado}
                size="small"
                sx={{ width: { xs: "100%", md: "auto" }, fontSize: 12, ...btnSmallStyle }}
              >
                Deletar Lote
              </Button>
            </Box>

           <Stack
  direction={{ xs: "column", lg: "row" }}
  spacing={2}
  sx={{ width: "100%" }}
>
  {/* ALUNOS FALTOSOS */}
  {temFaltosos && (
    <Paper
      sx={{
        flex: {
          xs: "1 1 100%",
          lg: temNaoEncontrados ? 2 : 1,
        },
        p: 2,
        borderLeft: "4px solid #2e7d32",
        overflowX: isMobile ? "visible" : "auto"
      }}
    >
      <Stack
        direction={isMobile ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isMobile ? "stretch" : "center"}
        mb={2}
        spacing={1}
      >
        <Typography sx={{ fontWeight: 600, color: "#2e7d32", fontSize: 14 }}>
          Alunos Faltosos ({resultado.totalFaltosos})
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<EmailIcon />}
          onClick={handleEnviarEmail}
          disabled={enviandoEmail || emailEnviado}
          sx={{
            fontSize: 11,
            fontWeight: "normal",
            textTransform: "none",
            width: isMobile ? "100%" : "auto",
            ...btnSmallStyle
          }}
        >
          {enviandoEmail ? "Enviando..." : "Enviar Email"}
        </Button>
      </Stack>

      {enviandoEmail && (
        <Box sx={{ mb: 1 }}>
          <LinearProgress />
          <Typography sx={{ mt: 0.5, fontSize: 11 }}>
            Enviando emails...
          </Typography>
        </Box>
      )}

      {isMobile ? (
        <Stack spacing={1}>
          {resultado.faltosos
            .slice(pageFaltosos * rowsPerPage, pageFaltosos * rowsPerPage + rowsPerPage)
            .map((row, i) => (
              <Paper key={i} sx={{ p: 1.5, borderLeft: "4px solid #2e7d32" }}>
                <Typography sx={{ fontWeight: 600 }}>{row.nome}</Typography>
                <Typography variant="body2">RA: {row.ra}</Typography>
                <Typography variant="body2">Email: {row.email}</Typography>
                <Typography variant="body2">Telefones: {formatarTelefone(row.telefones)}</Typography>
                <Typography variant="body2">Total Faltas: {row.total_faltas}</Typography>
              </Paper>
            ))}
        </Stack>
      ) : (
        <>
          <TableContainer sx={{ maxHeight: tableContainerHeight }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 12 }}>RA</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>Nome</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>Email</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>Telefones</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultado.faltosos
                  .slice(pageFaltosos * rowsPerPage, pageFaltosos * rowsPerPage + rowsPerPage)
                  .map((row, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontSize: 12 }}>{row.ra}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{row.nome}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{row.email}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{formatarTelefone(row.telefones)}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{row.total_faltas}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[rowsPerPage]}
            component="div"
            count={resultado.faltosos.length}
            rowsPerPage={rowsPerPage}
            page={pageFaltosos}
            onPageChange={(e, newPage) => setPageFaltosos(newPage)}
          />
        </>
      )}
    </Paper>
  )}

  {/* ALUNOS NÃO ENCONTRADOS */}
  {temNaoEncontrados && (
    <Paper
      sx={{
        flex: {
          xs: "1 1 100%",
          lg: temFaltosos ? 1 : 1,
        },
        p: 2,
        borderLeft: "4px solid #d32f2f",
        overflowX: isMobile ? "visible" : "auto"
      }}
    >
      <Typography sx={{ fontWeight: 600, color: "#d32f2f", fontSize: 14, mb: 1 }}>
        Alunos Não Encontrados ({resultado.naoEncontrados.length})
      </Typography>

      {isMobile ? (
        <Stack spacing={1}>
          {resultado.naoEncontrados
            .slice(pageNaoEncontrados * rowsPerPage, pageNaoEncontrados * rowsPerPage + rowsPerPage)
            .map((row, i) => (
              <Paper key={i} sx={{ p: 1.5, borderLeft: "4px solid #d32f2f" }}>
                <Typography sx={{ fontWeight: 600 }}>{row.nomePlanilhaFaltas}</Typography>
                <Typography variant="body2">RA: {row.raPlanilhaFaltas}</Typography>
                <Typography variant="body2">Faltas: {row.faltas}</Typography>
              </Paper>
            ))}
        </Stack>
      ) : (
        <>
          <TableContainer sx={{ maxHeight: tableContainerHeight }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 12 }}>RA</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>Nome</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultado.naoEncontrados
                  .slice(pageNaoEncontrados * rowsPerPage, pageNaoEncontrados * rowsPerPage + rowsPerPage)
                  .map((row, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontSize: 12 }}>{row.raPlanilhaFaltas}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{row.nomePlanilhaFaltas}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{row.faltas}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[rowsPerPage]}
            component="div"
            count={resultado.naoEncontrados.length}
            rowsPerPage={rowsPerPage}
            page={pageNaoEncontrados}
            onPageChange={(e, newPage) => setPageNaoEncontrados(newPage)}
          />
        </>
      )}
    </Paper>
  )}
</Stack>
          </Box>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default Conciliacao;