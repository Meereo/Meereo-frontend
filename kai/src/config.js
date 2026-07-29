try { process.loadEnvFile(); } catch { /* noop */ }

export const PORT = parseInt(process.env.PORT || "3002", 10);
export const KAI_MODEL = process.env.KAI_MODEL || "qwen2.5:3b";
export const KAI_HOST = process.env.KAI_HOST || "http://localhost:11434";
export const QUOREX_API_KEY = process.env.QUOREX_API_KEY || "";
export const DEFAULT_USER = process.env.DEFAULT_USER || "user_demo";
export const MEEREO_API_URL = process.env.MEEREO_API_URL || "http://localhost:3001";
