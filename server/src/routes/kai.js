import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Tu es KAI, l'assistant personnel IA de la plateforme MEEREO.
MEEREO est une plateforme premium de gestion de projets BTP et immobilier en Afrique de l'Ouest.

TON RÔLE :
- Répondre de manière courte, claire, utile et orientée action
- T'appuyer sur les données réelles du compte utilisateur (fournies en contexte)
- Parler en français, de manière professionnelle mais chaleureuse
- Guider l'utilisateur vers la bonne section de la plateforme quand pertinent
- Ne jamais inventer de données — si tu ne sais pas, dis-le simplement

TON STYLE :
- Maximum 3-4 phrases par réponse
- Pas de listes longues sauf si demandé
- Utilise le prénom de l'utilisateur quand tu l'as
- Sois direct et factuel
- Quand tu mentionnes une section, indique-la clairement (ex: "allez dans Offres reçues")
- Pas d'emojis sauf parcimonie (1 max par réponse)

SECTIONS DISPONIBLES PAR PROFIL :
- Pro : Tableau de bord, Projets, Avancement, Budget, Messages, Documents, Intervenants, Clients, Appels d'offres, Offres, Marchés, Marketplace, Commandes, Paramètres
- Client : Accueil, Suivi du projet, Choix & validations, Mes demandes, Offres reçues, Contrats validés, Documents, Messages, Catalogue, Professionnels, Commandes, Paramètres
- Fournisseur : Tableau de bord, Mon catalogue, Boutique, Performance, Bourse AO, Commandes, Paiements, Paramètres`

export default function kaiRouter() {
  const router = Router()

  router.post('/chat', async (req, res) => {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return res.status(503).json({ error: 'KAI API non configurée', fallback: true })
    }

    try {
      const { message, context } = req.body
      if (!message) return res.status(400).json({ error: 'Message requis' })

      // Build user context from the data sent by frontend
      const ctx = context || {}
      const contextLines = []
      contextLines.push(`PROFIL : ${ctx.userType || 'pro'} — ${ctx.userName || 'Utilisateur'} (${ctx.userCompany || ''})`)

      if (ctx.projects?.length > 0) {
        contextLines.push(`PROJETS (${ctx.projects.length}) :`)
        ctx.projects.slice(0, 5).forEach(p => {
          contextLines.push(`  - ${p.nom || p.name} : phase ${p.phase || '?'}, avancement ${p.avancement || 0}%, budget ${p.budget || '?'}, client: ${p.client || '?'}`)
        })
      } else {
        contextLines.push('PROJETS : aucun projet en cours')
      }

      if (ctx.pendingOffers > 0) contextLines.push(`OFFRES EN ATTENTE : ${ctx.pendingOffers}`)
      if (ctx.pendingDecisions > 0) contextLines.push(`DÉCISIONS EN ATTENTE : ${ctx.pendingDecisions}`)
      if (ctx.unreadMessages > 0) contextLines.push(`MESSAGES NON LUS : ${ctx.unreadMessages}`)
      if (ctx.activeMarkets > 0) contextLines.push(`MARCHÉS ACTIFS : ${ctx.activeMarkets}`)
      if (ctx.documentsCount > 0) contextLines.push(`DOCUMENTS : ${ctx.documentsCount}`)
      if (ctx.productsCount > 0) contextLines.push(`PRODUITS AU CATALOGUE : ${ctx.productsCount}`)
      if (ctx.pendingOrders > 0) contextLines.push(`COMMANDES EN ATTENTE : ${ctx.pendingOrders}`)
      if (ctx.teamMembers?.length > 0) {
        contextLines.push(`INTERVENANTS : ${ctx.teamMembers.map(m => m.nom || m.name).join(', ')}`)
      }

      const userContext = contextLines.join('\n')

      const client = new Anthropic({ apiKey })
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: SYSTEM_PROMPT + '\n\nCONTEXTE UTILISATEUR ACTUEL :\n' + userContext,
        messages: [{ role: 'user', content: message }],
      })

      const text = response.content?.[0]?.text || 'Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ?'
      res.json({ response: text })
    } catch (e) {
      console.error('[KAI]', e.message)
      res.status(500).json({ error: e.message, fallback: true })
    }
  })

  return router
}
