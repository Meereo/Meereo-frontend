const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')
const { getIo } = require('../socket')

const router = Router()

// GET /api/offers
// - pro/fournisseur : leurs propres offres soumises
// - client : offres reçues sur SES AOs
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const user = req.user

    let where = {}
    if (user.type === 'client') {
      // Récupérer les AO du client, puis les offres associées
      const myAOs = await prisma.aO.findMany({ where: { ownerUserId: user.id }, select: { id: true } })
      const aoIds = myAOs.map(a => a.id)
      if (aoIds.length === 0) return res.json([])
      where.aoId = { in: aoIds }
    } else {
      // Pro/fournisseur : leurs offres soumises
      where.supplierId = user.id
    }

    const offers = await prisma.offer.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true, name: true, company: true, type: true, publicId: true,
            // onboardingData contient bio, services, RCCM, email, téléphone, ville…
            // partagé volontairement par le prestataire dans son profil
            onboardingData: true,
            proProfile: { select: { entreprise: true, logoFileUrl: true, activeLogoType: true, logoColor: true } },
            fournisseurProfile: { select: { entreprise: true, logoFileUrl: true } },
          },
        },
        ao: { select: { id: true, title: true, lot: true, ownerUserId: true, projectId: true, owner: { select: { id: true, name: true, company: true, publicId: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(offers)
  } catch (e) {
    next(e)
  }
})

// GET /api/offers/compare/:aoId — vue comparative des candidatures pour un AO
router.get('/compare/:aoId', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const ao = await prisma.aO.findUnique({ where: { id: req.params.aoId } })
    if (!ao) throw createError('AO introuvable', 404)
    if (ao.ownerUserId !== req.user.id) throw createError('Accès non autorisé', 403)

    const offers = await prisma.offer.findMany({
      where: { aoId: req.params.aoId },
      include: {
        supplier: {
          select: {
            id: true, name: true, company: true, publicId: true, verified: true,
            onboardingData: true,
            proProfile: { select: { entreprise: true, ville: true, pays: true, bio: true, secteurs: true, services: true, effectif: true, annee: true, logoFileUrl: true, activeLogoType: true, logoColor: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Charger tous les documents entreprise en une seule requête (pas de N+1)
    const supplierIds = offers.map(o => o.supplierId).filter(Boolean)
    const allDocs = supplierIds.length > 0
      ? await prisma.document.findMany({
          where: { userId: { in: supplierIds }, isEntreprise: true, parentId: null },
          select: { id: true, name: true, type: true, category: true, url: true, expiresAt: true, userId: true },
          orderBy: { createdAt: 'desc' },
        })
      : []
    const docsBySupplier = {}
    allDocs.forEach(d => {
      if (!docsBySupplier[d.userId]) docsBySupplier[d.userId] = []
      docsBySupplier[d.userId].push(d)
    })
    const enriched = offers.map(offer => ({
      ...offer,
      entrepriseDocs: docsBySupplier[offer.supplierId] || [],
    }))

    res.json({ ao, offers: enriched })
  } catch (e) { next(e) }
})

// POST /api/offers — pro/fournisseur soumet une offre
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { aoId, entreprise, montant, delai, message, technique, docs } = req.body
    if (!aoId) throw createError('aoId requis', 400)
    // AOF-03 / FIN-04 : un montant strictement positif ET un délai sont obligatoires.
    // Un zéro ne doit jamais se confondre avec une absence de saisie.
    const montantNum = Number(String(montant ?? '').replace(/[\s\u00A0]/g, '').replace(',', '.'))
    if (!Number.isFinite(montantNum) || montantNum <= 0) {
      throw createError('Un montant strictement positif est requis pour soumettre une offre', 400)
    }
    if (!delai || !String(delai).trim()) {
      throw createError('Un délai est requis pour soumettre une offre', 400)
    }

    const prisma = getPrisma()

    // Vérifier que l'AO existe et est ouvert
    const ao = await prisma.aO.findUnique({ where: { id: aoId } })
    if (!ao) throw createError('Appel d\'offres introuvable', 404)
    if (ao.status !== 'open') throw createError('Cet appel d\'offres n\'est plus ouvert', 400)

    // Interdire de répondre à son propre AO
    if (ao.ownerUserId === req.user.id) throw createError('Vous ne pouvez pas répondre à votre propre AO', 403)

    // Valider docs : doit être un tableau (ou absent)
    const safeDocs = Array.isArray(docs) ? docs : []

    // Créer ou mettre à jour (upsert — un pro = une offre par AO)
    const offer = await prisma.offer.upsert({
      where: { aoId_supplierId: { aoId, supplierId: req.user.id } },
      update: {
        entreprise: entreprise || '',
        montant: String(montantNum),
        delai: String(delai).trim(),
        message: message || '',
        technique: technique || '',
        docs: safeDocs,
      },
      create: {
        aoId,
        supplierId: req.user.id,
        entreprise: entreprise || req.user.company || req.user.name || '',
        montant: String(montantNum),
        delai: String(delai).trim(),
        message: message || '',
        technique: technique || '',
        docs: safeDocs,
        statut: 'pending',
      },
    })

    // Notifier le propriétaire de l'AO en temps réel
    const io = getIo()
    if (io && ao.ownerUserId && ao.ownerUserId !== req.user.id) {
      io.to(`user:${ao.ownerUserId}`).emit('notification:new', {
        id: 'offer_' + offer.id,
        msg: (req.user.company || req.user.name || 'Un prestataire') + ' a soumis une offre sur « ' + (ao.title || ao.lot || 'sans titre') + ' »',
        type: 'blue',
        read: false,
        createdAt: new Date().toISOString(),
        page: 'offres',
        aoId,
      })
    }

    res.status(201).json(offer)
  } catch (e) {
    next(e)
  }
})

// PATCH /api/offers/:id — client accepte/refuse, pro modifie la sienne
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.offer.findUnique({ where: { id: req.params.id }, include: { ao: true } })
    if (!existing) throw createError('Offre introuvable', 404)

    const user = req.user
    const isOwner = existing.supplierId === user.id
    const isAOOwner = existing.ao?.ownerUserId === user.id

    if (!isOwner && !isAOOwner) throw createError('Non autorisé', 403)

    const allowed = {}
    if (isAOOwner && req.body.statut !== undefined) {
      allowed.statut = req.body.statut
      // Persister l'acceptation (qui + quand) lors de l'acceptation d'une offre
      if (req.body.statut === 'accepted') {
        // FIN-04 : vérifier le montant AVANT toute mutation (refus des autres offres,
        // fermeture de l'AO, création du marché). Un marché ne doit jamais naître à 0 FCFA.
        const checkMontant = Number(String(existing.montant ?? '').replace(/[\s\u00A0]/g, '').replace(',', '.'))
        if (!Number.isFinite(checkMontant) || checkMontant <= 0) {
          throw createError("Cette offre n'a pas de montant valide — elle ne peut pas être acceptée en l'état", 422)
        }
        allowed.acceptedBy = user.id
        allowed.acceptedAt = new Date()
      }
    }
    if (isOwner && existing.statut === 'pending') {
      if (req.body.montant !== undefined) allowed.montant = String(req.body.montant)
      if (req.body.delai !== undefined) allowed.delai = req.body.delai
      if (req.body.message !== undefined) allowed.message = req.body.message
      if (req.body.technique !== undefined) allowed.technique = req.body.technique
      if (req.body.docs !== undefined) allowed.docs = Array.isArray(req.body.docs) ? req.body.docs : []
    }

    const updated = await prisma.offer.update({ where: { id: req.params.id }, data: allowed })

    // AOF-01 A5/A7: quand une offre est acceptée, rejeter automatiquement toutes les autres offres du même AO
    if (isAOOwner && req.body.statut === 'accepted' && existing.aoId) {
      const otherOffers = await prisma.offer.findMany({
        where: { aoId: existing.aoId, id: { not: req.params.id }, statut: 'pending' },
      })
      for (const other of otherOffers) {
        await prisma.offer.update({ where: { id: other.id }, data: { statut: 'rejected' } })
        // Notifier chaque pro dont l'offre est rejetée
        if (other.supplierId) {
          try {
            const notif = await prisma.notification.create({
              data: {
                userId: other.supplierId,
                type: 'offer_rejected',
                msg: `Votre offre pour « ${existing.ao?.title || 'Appel d\'offres'} » n'a pas été retenue`,
                link: '/bourse',
                read: false,
              },
            })
            const io = getIo()
            if (io) {
              io.to(`user:${other.supplierId}`).emit('notification:new', {
                id: notif.id, type: notif.type, msg: notif.msg, link: notif.link, read: false, createdAt: notif.createdAt,
              })
            }
          } catch (_) {}
        }
      }
      // AOF-01 A8: fermer l'AO automatiquement
      await prisma.aO.update({ where: { id: existing.aoId }, data: { status: 'attributed' } }).catch(() => {})

      // AOF-01 A6: créer automatiquement le marché signé
      // FIN-04 : le marché reprend fidèlement le montant et le délai de l'offre acceptée.
      // Le montant a été validé en amont (avant toute mutation) — aucun fallback '0'.
      const offerMontant = Number(String(existing.montant ?? '').replace(/[\s\u00A0]/g, '').replace(',', '.'))
      try {
        // Idempotence : un seul marché par offre, quel que soit le nombre de fois où
        // l'événement d'acceptation est déclenché (même principe que MSG-04/pairHash).
        const alreadyCreated = await prisma.market.findFirst({ where: { offerId: existing.id } })
        if (!alreadyCreated) await prisma.market.create({
          data: {
            title: existing.ao?.title || 'Marché',
            supplierId: existing.supplierId,
            clientId: existing.ao?.ownerUserId,
            aoId: existing.aoId,
            projectId: existing.ao?.projectId || null,
            offerId: existing.id,
            montant: String(offerMontant),
            delai: existing.delai || '',
            statut: 'signed',
            signedAt: new Date(),
          },
        })
      } catch (marketErr) {
        console.warn('[AOF-01] Auto-create market failed:', marketErr.message)
      }
    }

    // Notifier le fournisseur quand son offre est acceptée ou refusée
    if (isAOOwner && req.body.statut === 'accepted' && existing.supplierId) {
      try {
        const notif = await prisma.notification.create({
          data: {
            userId: existing.supplierId,
            type: 'offer_accepted',
            msg: `Votre offre pour « ${existing.ao?.title || 'Appel d\'offres'} » a été acceptée — un marché va être créé`,
            link: '/marches',
            read: false,
          },
        })
        const io = getIo()
        if (io) {
          io.to(`user:${existing.supplierId}`).emit('notification:new', {
            id: notif.id, type: notif.type, msg: notif.msg, link: notif.link, read: false, createdAt: notif.createdAt,
          })
        }
      } catch (_) { /* non bloquant */ }
    }
    if (isAOOwner && req.body.statut === 'rejected' && existing.supplierId) {
      try {
        const notif = await prisma.notification.create({
          data: {
            userId: existing.supplierId,
            type: 'offer_rejected',
            msg: `Votre offre pour « ${existing.ao?.title || 'Appel d\'offres'} » n'a pas été retenue`,
            link: '/bourse',
            read: false,
          },
        })
        const io = getIo()
        if (io) {
          io.to(`user:${existing.supplierId}`).emit('notification:new', {
            id: notif.id, type: notif.type, msg: notif.msg, link: notif.link, read: false, createdAt: notif.createdAt,
          })
        }
      } catch (_) { /* non bloquant */ }
    }

    res.json(updated)
  } catch (e) {
    next(e)
  }
})

// ─── DELETE /api/offers/:id ──────────────────────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.offer.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Offre introuvable' })
    // Seul le propriétaire de l’offre peut la supprimer
    if (existing.supplierId !== req.user.id) return res.status(403).json({ error: 'Non autorisé' })
    await prisma.offer.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
})

module.exports = router
