import { useEffect, useState } from "react";

const themeRoutes = {
  tema1: "/game",
  tema2: "/game2",
  tema3: "/game3",
  tema4: "/game4",
  tema5: "/game5",
  tema6: "/game6",
};

export default function Totem() {
  const [tema, setTema] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/tema/stream`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log("Tema recebido:", data.tema);

      setTema((prev) => {
        if (prev === data.tema) return prev;
        return data.tema;
      });

      // 🔥 salva fallback
      localStorage.setItem("lastTheme", data.tema);
    };

    eventSource.onerror = () => {
      console.warn("SSE caiu, usando fallback");

      const fallback = localStorage.getItem("lastTheme");
      if (fallback) setTema(fallback);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (!tema) {
    return (
      <div style={{ color: "#fff", background: "#000" }}>
        Carregando tema...
      </div>
    );
  }

  const route = themeRoutes[tema] || "/game";

  return (
    <iframe
      key={tema} // 🔥 força reload
      src={`${route}?t=${tema}`} // 🔥 evita cache
      style={{
        width: "100vw",
        height: "100vh",
        border: "none",
      }}
    />
  );
}