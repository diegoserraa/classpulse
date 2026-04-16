import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";

import { apiFetch } from "../services/api";
import { Password } from "@mui/icons-material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 400 },
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 3,
};

function ModalAdicionarUsuario({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (open) {
      setForm({
        nome: "",
        email: "",
        senha: "",
      });
    }
  }, [open]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.nome || !form.email || !form.senha) {
      setSnack({
        open: true,
        message: "Preencha todos os campos",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          password: form.senha
        }),
      });

      if (!response.ok) {
        const erro = await response.json().catch(() => null);
        throw new Error(erro?.message || "Erro ao criar usuário");
      }

      setSnack({
        open: true,
        message: "Usuário criado com sucesso!",
        severity: "success",
      });

      if (onSuccess) onSuccess();

    } catch (error) {
      console.error(error);

      setSnack({
        open: true,
        message: error.message || "Erro ao criar usuário",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={style}>
          <Typography variant="h6" mb={2} fontWeight={600}>
            Adicionar Usuário
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Nome"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              fullWidth
              size="small"
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              size="small"
            />

            <TextField
              label="Senha"
              name="senha"
              type="password"
              value={form.senha}
              onChange={handleChange}
              fullWidth
              size="small"
            />

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                bgcolor: "#000",
                "&:hover": { bgcolor: "#333" },
              }}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ModalAdicionarUsuario;