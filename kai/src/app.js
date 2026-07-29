import express from "express";
import cors from "cors";
import { identify } from "./middleware/identify.js";
import { errorHandler } from "./middleware/error-handler.js";
import healthRouter from "./routes/health.js";
import chatRouter from "./routes/chat.js";
import automationsRouter from "./routes/automations.js";
import factsRouter from "./routes/facts.js";
import proactiveRouter from "./routes/proactive.js";

const app = express();

app.use(cors());
app.use(express.json());

/* Route publique */
app.use("/api/health", healthRouter);

/* Routes protegees (identification requise) */
app.use("/api/chat", identify, chatRouter);
app.use("/api/automations", identify, automationsRouter);
app.use("/api/facts", identify, factsRouter);
app.use("/api/proactive", identify, proactiveRouter);

/* Error handler global */
app.use(errorHandler);

export default app;
