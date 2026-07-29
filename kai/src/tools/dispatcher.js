import { getData } from "../data/index.js";

export async function dispatch(name, args, ctx) {
  const data = getData();

  switch (name) {
    case "get_delays": {
      const projects = await data.getProjects();
      return projects
        .filter(p => p.retard > 0)
        .map(p => ({ nom: p.nom, retard_jours: p.retard, avance: p.avance }));
    }

    case "get_budget_status": {
      const t = args.threshold ?? 80;
      const projects = await data.getProjects();
      return projects
        .map(p => ({ nom: p.nom, budget: p.budget, au_dessus_seuil: p.budget >= t }));
    }

    case "get_pending_invoices":
      return await data.getInvoices();

    case "generate_report":
      return await data.getGlobalActivity();

    case "get_marketplace":
      return await data.getMarketplace();

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
