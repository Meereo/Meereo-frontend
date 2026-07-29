export function errorHandler(err, req, res, _next) {
  console.error("[error]", err.message);

  if (err.message?.includes("Ollama")) {
    return res.status(503).json({
      error: "LLM indisponible",
      detail: err.message,
      hint: "Verifiez qu'Ollama tourne (ollama list / ollama serve).",
    });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Erreur interne." });
}
