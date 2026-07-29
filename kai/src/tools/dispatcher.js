import { getData } from "../data/index.js";

export async function dispatch(name, args, ctx) {
  const data = getData();

  switch (name) {
    case "get_delays":
      return data.getProjects()
        .filter(p => p.retard > 0)
        .map(p => ({ nom: p.nom, retard_jours: p.retard, avance: p.avance }));

    case "get_budget_status": {
      const t = args.threshold ?? 80;
      return data.getProjects()
        .map(p => ({ nom: p.nom, budget: p.budget, au_dessus_seuil: p.budget >= t }));
    }

    case "get_pending_invoices":
      return data.getInvoices();

    case "generate_report":
      return data.getGlobalActivity();

    case "get_marketplace":
      return data.getMarketplace();

    case "send_notification":
      if (!ctx.allowSend) {
        ctx.pending.push(args);
        return { staged: true, note: "Validation requise — non envoye." };
      }
      ctx.sent.push(args);
      return { sent: true, recipient: args.recipient };

    default:
      return { error: `outil inconnu: ${name}` };
  }
}
