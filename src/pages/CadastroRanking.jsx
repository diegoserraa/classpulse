import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  MenuItem,
  TextField
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { apiFetch } from "../services/api";

function CadastroRanking() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [diasAula, setDiasAula] = useState("");

  const [fileBase, setFileBase] = useState(null);
  const [fileFaltas, setFileFaltas] = useState(null);

  const fileBaseRef = useRef(null);
  const fileFaltasRef = useRef(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const alturaPadrao = 40;

  const inputStyle = {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      height: alturaPadrao,
      display: "flex",
      alignItems: "center",
    },
    "& input": {
      padding: "0 14px",
      height: "100%",
      boxSizing: "border-box",
    }
  };

  const selectStyle = {
    ...inputStyle,
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      height: "100%",
      padding: "0 14px"
    }
  };

  const btnSmallStyle = {
    height: alturaPadrao,
    minHeight: alturaPadrao,
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textTransform: "none",
  };

  useEffect(() => {
    const fetchTurmas = async () => {
      const response = await apiFetch("/turmas/select");
      const data = await response.json();
      setTurmas(data);
    };
    fetchTurmas();
  }, []);

  const formValido =
    turmaSelecionada &&
    dataInicio &&
    dataFim &&
    diasAula &&
    fileBase &&
    fileFaltas;

  const handleDiasChange = (e) => {
    let value = Number(e.target.value);

    if (value > 5) value = 5;
    if (value < 1) value = 1;

    setDiasAula(value);
  };

  // 🔥 RESET COMPLETO
  const resetarFormulario = () => {
    setTurmaSelecionada("");
    setDataInicio("");
    setDataFim("");
    setDiasAula("");
    setFileBase(null);
    setFileFaltas(null);

    if (fileBaseRef.current) fileBaseRef.current.value = "";
    if (fileFaltasRef.current) fileFaltasRef.current.value = "";
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("turma_id", turmaSelecionada);
      formData.append("data_inicio", dataInicio);
      formData.append("data_fim", dataFim);
      formData.append("dias_aula", diasAula);
      formData.append("arquivo_base", fileBase);
      formData.append("arquivo_faltas", fileFaltas);

      const response = await fetchApi("/ranking/semanal", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error();

      setSnackbar({
        open: true,
        message: "Cadastro realizado com sucesso!",
        severity: "success"
      });

      // 🔥 aqui está o segredo
      resetarFormulario();

    } catch {
      setSnackbar({
        open: true,
        message: "Erro ao cadastrar",
        severity: "error"
      });
    }
  };

  return (
    <Box sx={{ mt: 2, mb: 6, px: { xs: 1, sm: 2 }, display: "flex", justifyContent: "center" }}>
      
      <Box sx={{ width: "100%", maxWidth: 1300, mx: "auto" }}>

        <Paper elevation={6} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
          
          <Typography variant="h6" sx={{ mb: 1 }}>
            Cadastro de Ranking Semanal
          </Typography>

          <Typography sx={{ mb: 2, color: "text.secondary", fontSize: 12 }}>
            Informe os dados e envie as planilhas.
          </Typography>

          {/* 🔹 LINHA 1 */}
          <Stack direction={isMobile ? "column" : "row"} spacing={1} sx={{ mb: 1 }}>
            
            <TextField
              select
              label="Turma"
              size="small"
              fullWidth
              sx={selectStyle}
              value={turmaSelecionada}
              onChange={(e) => setTurmaSelecionada(e.target.value)}
            >
              {turmas.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.nome_original}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Data Início"
              type="date"
              size="small"
              fullWidth
              sx={inputStyle}
              InputLabelProps={{ shrink: true }}
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />

            <TextField
              label="Data Fim"
              type="date"
              size="small"
              fullWidth
              sx={inputStyle}
              InputLabelProps={{ shrink: true }}
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </Stack>

          {/* 🔹 LINHA 2 */}
          <Stack direction={isMobile ? "column" : "row"} spacing={1} sx={{ mb: 2 }}>

            <TextField
              label="Dias Letivos"
              type="number"
              size="small"
              fullWidth
              sx={inputStyle}
              value={diasAula}
              onChange={handleDiasChange}
              inputProps={{ min: 1, max: 5 }}
            />

            <Button
              variant="outlined"
              component="label"
              size="small"
              sx={{
                ...btnSmallStyle,
                flex: 1,
                backgroundColor: fileBase ? "rgba(0, 123, 255, 0.1)" : "inherit",
              }}
            >
              {fileBase ? fileBase.name : "Base.xlsx"}
              <input
                ref={fileBaseRef}
                hidden
                type="file"
                onChange={(e) => setFileBase(e.target.files[0])}
              />
            </Button>

            <Button
              variant="outlined"
              component="label"
              size="small"
              sx={{
                ...btnSmallStyle,
                flex: 1,
                backgroundColor: fileFaltas ? "rgba(0, 123, 255, 0.1)" : "inherit",
              }}
            >
              {fileFaltas ? fileFaltas.name : "Faltas.xlsx"}
              <input
                ref={fileFaltasRef}
                hidden
                type="file"
                onChange={(e) => setFileFaltas(e.target.files[0])}
              />
            </Button>
          </Stack>

          {/* 🔹 BOTÃO */}
          <Stack direction={isMobile ? "column" : "row"} spacing={1}>
            
            <Button
              variant="contained"
              size="small"
              startIcon={<UploadFileIcon />}
              sx={{ ...btnSmallStyle, flex: 1 }}
              onClick={handleSubmit}
              disabled={!formValido}
            >
              Cadastrar
            </Button>

          </Stack>

        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>

      </Box>
    </Box>
  );
}

export default CadastroRanking;