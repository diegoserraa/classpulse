export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };

  // Só adiciona Content-Type se NÃO for FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // 🔐 adiciona token automaticamente
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // 🔄 transforma body em JSON automaticamente
  let body = options.body;
  if (
    body &&
    typeof body === "object" &&
    !(body instanceof FormData)
  ) {
    body = JSON.stringify(body);
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      {
        ...options,
        headers,
        body,
      }
    );

    // 🔥 TOKEN EXPIRADO OU SEM PERMISSÃO
    if (response.status === 401) {
      localStorage.clear(); // melhor limpar tudo
      window.location.href = "/login";
      return;
    }

    // ⚠️ 403 = sem permissão (não desloga)
    if (response.status === 403) {
      console.warn("Acesso negado (sem permissão)");
      return response;
    }

    return response;

  } catch (error) {
    console.error("Erro na requisição:", error);

    throw error; // mantém comportamento padrão
  }
}