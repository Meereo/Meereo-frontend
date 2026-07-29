/**
 * Data provider MEEREO — connecte KAi aux données réelles de la plateforme.
 * Appelle l'API Meereo interne (server:3001) pour récupérer projets, factures,
 * marketplace, utilisateurs, etc.
 *
 * Fallback gracieux : si l'API est indisponible, retourne des tableaux vides
 * pour que KAi puisse quand même répondre en mode dégradé.
 */

import { MEEREO_API_URL } from "../../config.js";

const BASE = MEEREO_API_URL;

async function fetchJson(path, token) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Cookie"] = `meereo_token=${token}`;
    const res = await fetch(`${BASE}${path}`, { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn(`[meereo-provider] ${path}:`, e.message);
    return null;
  }
}

/**
 * Crée un provider contextualisé pour un utilisateur donné.
 * @param {string} token - JWT token de l'utilisateur (optionnel, pour les appels authentifiés)
 */
export function createMeereoProvider(token) {
  // Cache léger en mémoire (5 minutes)
  const cache = new Map();
  const CACHE_TTL = 5 * 60 * 1000;

  async function cached(key, fetcher) {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
    const data = await fetcher();
    cache.set(key, { data, ts: Date.now() });
    return data;
  }

  return {
    getProjects() {
      return cached("projects", async () => {
        const res = await fetchJson("/api/projects", token);
        if (!Array.isArray(res)) return [];
        return res.map((p) => ({
          id: p.id,
          nom: p.nom || p.name || "Projet",
          ville: p.ville || p.location || "",
          avance: p.avancement || p.progress || 0,
          retard: p.retard || 0,
          budget: p.budgetPct || p.budget || 0,
          phase: p.phase || "",
          status: p.status || "active",
        }));
      });
    },

    getProjectById(id) {
      return cached(`project_${id}`, async () => {
        const res = await fetchJson(`/api/projects/${id}`, token);
        if (!res) return null;
        return {
          id: res.id,
          nom: res.nom || res.name || "Projet",
          ville: res.ville || "",
          avance: res.avancement || res.progress || 0,
          retard: res.retard || 0,
          budget: res.budgetPct || res.budget || 0,
          phase: res.phase || "",
        };
      });
    },

    getInvoices() {
      return cached("invoices", async () => {
        const res = await fetchJson("/api/invoices", token);
        if (!Array.isArray(res)) return [];
        return res.map((f) => ({
          id: f.id,
          fournisseur: f.fournisseur || f.supplier || "",
          montant: f.montant || f.amount || "",
          ecart_bdc: f.ecart || "",
          statut: f.statut || f.status || "pending",
        }));
      });
    },

    getInvoiceById(id) {
      return cached(`invoice_${id}`, async () => {
        const res = await fetchJson(`/api/invoices/${id}`, token);
        return res || null;
      });
    },

    getIncidentCount() {
      return cached("incidents", async () => {
        const res = await fetchJson("/api/incidents/count", token);
        return res?.count || 0;
      });
    },

    getUsers() {
      return cached("users", async () => {
        const res = await fetchJson("/api/users", token);
        if (!Array.isArray(res)) return [];
        return res.map((u) => ({
          id: u.id,
          prenom: u.name || u.prenom || "",
          type: u.type || "client",
          tier: "standard",
        }));
      });
    },

    getUserById(id) {
      return cached(`user_${id}`, async () => {
        const res = await fetchJson(`/api/users/${id}`, token);
        return res || null;
      });
    },

    getMarketplace() {
      return cached("marketplace", async () => {
        const res = await fetchJson("/api/marketplace/products", token);
        if (!Array.isArray(res)) return [];
        return res.map((p) => ({
          id: p.id,
          nom: p.name || p.nom || "",
          fournisseur: p.supplierName || p.fournisseur || "",
          prix: p.price || "",
          disponible: p.stock > 0,
        }));
      });
    },

    getMarketplaceById(id) {
      return cached(`mp_${id}`, async () => {
        const res = await fetchJson(`/api/marketplace/products/${id}`, token);
        return res || null;
      });
    },

    async getGlobalActivity() {
      const [projects, invoices, marketplace] = await Promise.all([
        this.getProjects(),
        this.getInvoices(),
        this.getMarketplace(),
      ]);
      return {
        chantiers: projects.length,
        avancement_moyen: projects.length
          ? Math.round(projects.reduce((s, p) => s + p.avance, 0) / projects.length)
          : 0,
        en_retard: projects.filter((p) => p.retard > 0).length,
        factures_en_attente: invoices.length,
        incidents: await this.getIncidentCount(),
        produits_marketplace: marketplace.length,
      };
    },

    clearCache() {
      cache.clear();
    },
  };
}

/**
 * Provider par défaut (sans authentification).
 * Utilisé pour les données générales accessibles sans token.
 */
export const meereoProvider = createMeereoProvider(null);
