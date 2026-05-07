import { useState, useCallback, useEffect } from "react";
import { apiFetch } from "../services/Api";

/* ═══════════════════════════════════════════════════════════════
   useDashboard — hook centralizado de dados
   Substitui: getTurmas + getRanking (semanal) + getRanking (mensal)
   Consome:   GET /dashboard?tipo=semanal|mensal
   ═══════════════════════════════════════════════════════════════ */

// ─── Chamada de API ────────────────────────────────────────────────
const getDashboard = async (tipo) => {
  const r = await apiFetch(`/dashboard?tipo=${tipo}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
};

// ─── Estado inicial tipado ─────────────────────────────────────────
// Garante que os componentes nunca recebem undefined
const INITIAL_STATE = {
  resumo: {
    presencaMedia:      0,
    faltas:             0,
    turmasAtivas:       0,
    semanasRegistradas: 0,
  },
  ranking: [],
  grafico: [],
  tabela:  [],
  alertas: [],
};

// ─── Hook ──────────────────────────────────────────────────────────
export function useDashboard(tipo) {
  const [data,    setData]    = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await getDashboard(tipo);

      // Ordenar ranking por presença decrescente
      // (mantém comportamento idêntico ao sort anterior feito no Dashboard)
      const rankingOrdenado = [...(json.ranking ?? [])].sort(
        (a, b) =>
          parseFloat(b.porcentagem_presenca) -
          parseFloat(a.porcentagem_presenca)
      );

      setData({
        ...INITIAL_STATE,
        ...json,
        ranking: rankingOrdenado,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tipo]);

  // Dispara sempre que `tipo` muda (semanal ↔ mensal)
  useEffect(() => { load(); }, [load]);

  return {
    // dados
    resumo:  data.resumo,
    ranking: data.ranking,
    grafico: data.grafico,
    tabela:  data.tabela,
    alertas: data.alertas,
    // estado
    loading,
    error,
    reload: load,   // exposto para refresh manual, se necessário
  };
}