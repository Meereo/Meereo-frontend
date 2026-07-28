// ─── OnboardingTxPort ────────────────────────────────────────────────────────
// UNE SEULE prisma.$transaction qui crée tout en atomique :
//   1. Entreprise (création OU rattachement à une existante)
//   2. Compte User (email + passwordHash, jamais en clair)
//   3. Profil typé (Pro / Client / Fournisseur) + secteurs/catégories
//   4. PayoutMethod (fournisseur uniquement)
//   5. Premier produit SI fourni (facultatif — arbitrage 9)
//   6. Suppression du brouillon OnboardingDraft DANS la même transaction
//      (sinon brouillon orphelin — piège Partie VI)
//
// Traduit les violations de contraintes Prisma en codes métier :
//   P2002 account_email_role_active_key → EMAIL_TAKEN
//   P2002 entreprises_rccm_key          → RCCM_TAKEN
//   P2002 (entrepriseId, role)          → ROLE_ALREADY_ON_COMPANY
// ─────────────────────────────────────────────────────────────────────────────

const { getPrisma } = require('../db')
const { hashPassword } = require('../utils/password')

// ─── Traduction des erreurs Prisma ──────────────────────────────────────────

function translatePrismaError(err) {
  if (err.code !== 'P2002') return null

  const target = err.meta?.target
  if (!target) return null
  const key = Array.isArray(target) ? target.join('_') : String(target)

  if (key.includes('email') && key.includes('type'))    return 'EMAIL_TAKEN'
  if (key.includes('email') && key.includes('role'))    return 'EMAIL_TAKEN'
  if (key === 'users_email_key')                        return 'EMAIL_TAKEN'
  if (key.includes('rccm'))                             return 'RCCM_TAKEN'
  if (key.includes('ncc'))                              return 'NCC_TAKEN'
  if (key.includes('entrepriseId') || key.includes('companyId'))
    return 'ROLE_ALREADY_ON_COMPANY'

  return null
}

// ─── Génération du slug SEO (identique à auth.js) ───────────────────────────

function generateSlug(raw) {
  const base = (raw || 'user')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
  return base + '-' + Math.random().toString(36).slice(2, 6)
}

// ─── Transaction principale ─────────────────────────────────────────────────

const onboardingTxAdapter = {
  /**
   * @param {object} input
   * @param {string} input.email
   * @param {string} input.password        - En clair — hashé ici, jamais loggé
   * @param {string} input.name
   * @param {'pro'|'client'|'fournisseur'} input.type
   * @param {string} [input.company]
   * @param {string} [input.phone]
   * @param {string} [input.metier]
   * @param {string} [input.ville]
   * @param {object} [input.profile]       - Champs spécifiques au type
   * @param {object} [input.entreprise]    - { legalName, rccm, ncc } ou { id } si existante
   * @param {object} [input.payoutMethod]  - Fournisseur : { type, label?, details? }
   * @param {object} [input.firstProduct]  - Facultatif (arbitrage 9)
   * @param {string} [input.draftId]       - ID du brouillon à supprimer
   * @returns {Promise<{ user: object }>}
   */
  async execute(input) {
    const prisma = getPrisma()
    const {
      email, password, name, type,
      company, phone, metier, ville,
      profile = {},
      entreprise: entInput,
      payoutMethod,
      firstProduct,
      draftId,
    } = input

    // Hash en amont — le mot de passe en clair ne franchit pas cette ligne
    const passwordHash = await hashPassword(password)

    try {
      const user = await prisma.$transaction(async (tx) => {
        // ── 1. Entreprise ───────────────────────────────────────────────
        let entrepriseId = null
        if (entInput) {
          if (entInput.id) {
            entrepriseId = entInput.id
          } else {
            const ent = await tx.entreprise.create({
              data: {
                legalName: entInput.legalName || company || name,
                rccm: entInput.rccm || null,
                ncc: entInput.ncc || null,
              },
            })
            entrepriseId = ent.id
          }
        }

        // ── 2. Compte User ──────────────────────────────────────────────
        const created = await tx.user.create({
          data: {
            email: email.trim().toLowerCase(),
            passwordHash,
            name,
            type,
            company: company || null,
            phone: phone || null,
            metier: metier || null,
            ville: ville || null,
            slug: generateSlug(company || name),
          },
        })

        // ── 3. Profil typé ──────────────────────────────────────────────
        if (type === 'pro') {
          await tx.proProfile.create({
            data: {
              userId: created.id,
              entreprise: profile.entreprise || company || name,
              ville: profile.ville || ville || 'Abidjan',
              pays: profile.pays || "Côte d'Ivoire",
              annee: profile.annee || null,
              rccm: profile.rccm || null,
              ncc: profile.ncc || null,
              tel: profile.tel || phone || '',
              secteurs: profile.secteurs || [],
              services: profile.services || [],
              logoColor: profile.logoColor || '#1D1D1F',
              logoShape: profile.logoShape || 'Hexagone',
              logoTypo: profile.logoTypo || 'Gras',
              logoFileUrl: profile.logoFileUrl || null,
              activeLogoType: profile.activeLogoType || 'generated',
              slogan: profile.slogan || null,
              bio: profile.bio || null,
              projetsN: profile.projetsN || null,
              effectif: profile.effectif || null,
              portfolioFiles: profile.portfolioFiles || [],
              cockpitTeam: profile.cockpitTeam || [],
              coverUrl: profile.coverUrl || null,
              entrepriseId,
            },
          })
        } else if (type === 'client') {
          await tx.clientProfile.create({
            data: {
              userId: created.id,
              prenom: profile.prenom || name.split(' ')[0] || '',
              nom: profile.nom || name.split(' ').slice(1).join(' ') || '',
              civilite: profile.civilite || null,
              tel: profile.tel || phone || '',
              ville: profile.ville || ville || 'Abidjan',
              pays: profile.pays || "Côte d'Ivoire",
              photoUrl: profile.photoUrl || null,
              projectType: profile.projectType || null,
              location: profile.location || null,
              surface: profile.surface || null,
              budget: profile.budget || null,
              description: profile.description || null,
            },
          })
        } else if (type === 'fournisseur') {
          await tx.fournisseurProfile.create({
            data: {
              userId: created.id,
              entreprise: profile.entreprise || company || name,
              ville: profile.ville || ville || 'Abidjan',
              pays: profile.pays || "Côte d'Ivoire",
              rccm: profile.rccm || null,
              ncc: profile.ncc || null,
              tel: profile.tel || phone || '',
              logoColor: profile.logoColor || '#1D1D1F',
              logoShape: profile.logoShape || 'Hexagone',
              logoTypo: profile.logoTypo || 'Gras',
              logoFileUrl: profile.logoFileUrl || null,
              categories: profile.categories || [],
              zones: profile.zones || [],
              delaiLivraison: profile.delaiLivraison || null,
              products: profile.products || [],
              entrepriseId,
            },
          })

          // ── 4. PayoutMethod (fournisseur uniquement) ──────────────────
          if (payoutMethod) {
            await tx.payoutMethod.create({
              data: {
                userId: created.id,
                type: payoutMethod.type,
                label: payoutMethod.label || '',
                details: payoutMethod.details || {},
                isDefault: true,
              },
            })
          }
        }

        // ── 5. Premier produit (facultatif — arbitrage 9) ───────────────
        if (firstProduct && type === 'fournisseur') {
          await tx.product.create({
            data: {
              supplierId: created.id,
              name: firstProduct.name,
              category: firstProduct.category || '',
              price: firstProduct.price != null ? firstProduct.price : 0,
              unit: firstProduct.unit || 'unité',
              description: firstProduct.description || '',
              photoUrl: firstProduct.photoUrl || null,
            },
          })
        }

        // ── 6. Suppression du brouillon (même tx → pas d'orphelin) ──────
        if (draftId) {
          await tx.onboardingDraft.delete({ where: { id: draftId } })
            .catch(() => { /* brouillon déjà supprimé ou inexistant — non fatal */ })
        }

        return created
      })

      return { user }
    } catch (err) {
      const code = translatePrismaError(err)
      if (code) {
        const domainErr = new Error(code)
        domainErr.code = code
        throw domainErr
      }
      throw err
    }
  },
}

module.exports = onboardingTxAdapter
