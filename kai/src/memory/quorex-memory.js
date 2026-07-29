import { Quorex } from "@quorex/sdk";
import { QUOREX_API_KEY } from "../config.js";

class QuorexMemory {
  constructor() {
    this.qx = QUOREX_API_KEY
      ? new Quorex({ apiKey: QUOREX_API_KEY })
      : null;
  }

  get enabled() { return this.qx !== null; }

  async remember(userId, text, opts) {
    if (!this.qx) return null;
    try { return await this.qx.remember(userId, text, opts); }
    catch (e) { console.warn("[quorex] remember:", e.message); return null; }
  }

  async forget(userId, vecId) {
    if (!this.qx) return null;
    try { return await this.qx.forget(userId, vecId); }
    catch (e) { console.warn("[quorex] forget:", e.message); return null; }
  }

  async recall(userId, query, opts) {
    if (!this.qx) return [];
    try { return await this.qx.recall(userId, query, opts); }
    catch (e) { console.warn("[quorex] recall:", e.message); return []; }
  }

  async export(userId) {
    if (!this.qx) return null;
    try { return await this.qx.export(userId); }
    catch (e) { return null; }
  }

  async purge(userId) {
    if (!this.qx) return 0;
    try { return await this.qx.purge(userId); }
    catch (e) { console.warn("[quorex] purge:", e.message); return 0; }
  }

  async stats(userId) {
    if (!this.qx) return null;
    try { return await this.qx.stats(userId); }
    catch (e) { console.warn("[quorex] stats:", e.message); return null; }
  }
}

export const memory = new QuorexMemory();
