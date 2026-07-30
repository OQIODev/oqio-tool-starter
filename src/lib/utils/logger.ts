// Logging serveur structuré — une ligne JSON par événement, captable par
// n'importe quel collecteur (Vercel, Coolify, docker logs).
// Aucun `console.log` ad hoc ailleurs dans le code serveur.

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  [key: string]: unknown;
}

function emit(level: LogLevel, event: string, payload: LogPayload = {}): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...payload,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function logInfo(event: string, payload?: LogPayload): void {
  emit("info", event, payload);
}

export function logWarn(event: string, payload?: LogPayload): void {
  emit("warn", event, payload);
}

export function logError(event: string, err: unknown, payload?: LogPayload): void {
  const errPayload =
    err instanceof Error
      ? { errorName: err.name, errorMessage: err.message, errorStack: err.stack }
      : { error: String(err) };
  emit("error", event, { ...errPayload, ...payload });
}

/** Log d'appel LLM — séparé pour pouvoir suivre le coût sans grepper les logs. */
export interface LLMLogEntry {
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  latencyMs: number;
  userId?: string;
}

export function logLLMCall(entry: LLMLogEntry): void {
  emit("info", "llm_call", { ...entry });
}
