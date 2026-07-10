/**
 * MEEREO — Seed du référentiel des missions / jalons / tâches
 *
 * Usage :  node prisma/seed-missions.js
 *
 * Idempotent : utilise upsert sur le champ `code` unique.
 * Ne touche jamais aux données projet (ProjectMission, etc.).
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ─── Référentiel complet ────────────────────────────────────────────────────

const REFERENTIEL = [
  {
    code: 'M1',
    title: 'Conception Architecturale',
    responsible: 'Bureau d\'architecture',
    order: 1,
    isOptional: false,
    milestones: [
      {
        code: 'J1.1', title: 'Cadrage du besoin', order: 1,
        tasks: [
          'Recueillir les besoins et contraintes du client.',
          'Visiter le site et relever l\'existant.',
          'Analyser les règles d\'urbanisme applicables.',
          'Établir le programme (surfaces, usages, budget cible).',
          'Faire valider le programme par le client.',
        ],
      },
      {
        code: 'J1.2', title: 'Esquisse', order: 2,
        tasks: [
          'Établir le parti architectural.',
          'Produire les plans d\'esquisse (plan de masse, niveaux).',
          'Produire les premières visualisations.',
          'Présenter l\'esquisse au client.',
          'Intégrer les retours et faire valider l\'esquisse.',
        ],
      },
      {
        code: 'J1.3', title: 'Avant-projet', order: 3,
        tasks: [
          'Développer les plans (niveaux, coupes, façades).',
          'Définir les principes constructifs et les matériaux.',
          'Établir l\'estimation budgétaire.',
          'Coordonner les pré-études structure et fluides.',
          'Faire valider l\'avant-projet par le client.',
        ],
      },
      {
        code: 'J1.4', title: 'Dossier administratif', order: 4,
        tasks: [
          'Constituer le dossier de permis de construire.',
          'Produire les pièces graphiques réglementaires.',
          'Déposer le dossier auprès de l\'administration.',
          'Suivre l\'instruction et répondre aux demandes de compléments.',
          'Obtenir l\'autorisation et la notifier au projet.',
        ],
      },
      {
        code: 'J1.5', title: 'Projet d\'exécution', order: 5,
        tasks: [
          'Produire les plans d\'exécution architecte.',
          'Rédiger les pièces écrites descriptives.',
          'Intégrer les études techniques (structure, fluides).',
          'Constituer le dossier de consultation des entreprises.',
        ],
      },
      {
        code: 'J1.6', title: 'Consultation des entreprises', order: 6,
        tasks: [
          'Préparer l\'appel d\'offres Construction (module Appels d\'Offres MEEREO).',
          'Analyser les candidatures et les offres reçues.',
          'Produire le rapport d\'analyse comparatif.',
          'Assister le client dans la sélection.',
          'Intégrer l\'entreprise retenue au projet (workflow MEEREO).',
        ],
      },
      {
        code: 'J1.7', title: 'Suivi architectural du chantier', order: 7,
        tasks: [
          'Organiser et animer les réunions de chantier.',
          'Contrôler la conformité architecturale des ouvrages.',
          'Viser les demandes de validation et les documents d\'exécution.',
          'Traiter les adaptations de conception.',
          'Tenir le journal des décisions du projet.',
        ],
      },
      {
        code: 'J1.8', title: 'Réception et clôture documentaire', order: 8,
        tasks: [
          'Organiser les opérations préalables à la réception.',
          'Établir la liste des réserves.',
          'Suivre la levée des réserves.',
          'Rassembler le dossier des ouvrages exécutés (DOE).',
          'Clôturer la mission (double validation).',
        ],
      },
    ],
  },
  {
    code: 'M2',
    title: 'Études Structure',
    responsible: 'Bureau d\'études structure',
    order: 2,
    isOptional: false,
    milestones: [
      {
        code: 'J2.1', title: 'Données d\'entrée', order: 1,
        tasks: [
          'Collecter les plans architecte et les données du site.',
          'Analyser le rapport géotechnique.',
          'Identifier les contraintes normatives applicables.',
          'Valider les données d\'entrée avec l\'architecte.',
        ],
      },
      {
        code: 'J2.2', title: 'Pré-dimensionnement', order: 2,
        tasks: [
          'Définir le système porteur.',
          'Pré-dimensionner les éléments principaux.',
          'Vérifier la compatibilité avec le parti architectural.',
          'Émettre la note de pré-dimensionnement.',
        ],
      },
      {
        code: 'J2.3', title: 'Hypothèses et descentes de charges', order: 3,
        tasks: [
          'Établir les hypothèses de charges.',
          'Réaliser les descentes de charges.',
          'Définir les principes de fondations.',
          'Faire valider les principes par l\'architecte.',
        ],
      },
      {
        code: 'J2.4', title: 'Notes de calcul', order: 4,
        tasks: [
          'Modéliser la structure.',
          'Produire les notes de calcul.',
          'Justifier les ouvrages particuliers.',
          'Soumettre les notes de calcul à validation.',
        ],
      },
      {
        code: 'J2.5', title: 'Plans d\'exécution structure', order: 5,
        tasks: [
          'Produire les plans de coffrage.',
          'Produire les plans de ferraillage.',
          'Établir les carnets de détails.',
          'Diffuser les plans pour exécution.',
        ],
      },
      {
        code: 'J2.6', title: 'Suivi d\'exécution structure', order: 6,
        tasks: [
          'Viser les plans d\'atelier de l\'entreprise.',
          'Répondre aux questions techniques du chantier.',
          'Contrôler les ouvrages structurels aux étapes clés.',
          'Traiter les adaptations d\'exécution.',
        ],
      },
      {
        code: 'J2.7', title: 'Clôture de mission', order: 7,
        tasks: [
          'Vérifier la conformité finale des ouvrages structurels.',
          'Remettre les documents destinés au DOE.',
          'Clôturer la mission (double validation).',
        ],
      },
    ],
  },
  {
    code: 'M3',
    title: 'Études Fluides',
    responsible: 'Bureau d\'études fluides',
    order: 3,
    isOptional: false,
    milestones: [
      {
        code: 'J3.1', title: 'Données d\'entrée et bilans de besoins', order: 1,
        tasks: [
          'Collecter les plans et le programme.',
          'Établir les bilans de besoins (électrique, hydraulique, thermique).',
          'Identifier les concessionnaires et points de raccordement.',
          'Valider les données d\'entrée avec l\'architecte.',
        ],
      },
      {
        code: 'J3.2', title: 'Principes de conception', order: 2,
        tasks: [
          'Établir les schémas de principe par lot (plomberie, électricité, CVC).',
          'Définir les locaux techniques et les réservations.',
          'Coordonner les réservations avec l\'architecte et le BE structure.',
          'Faire valider les principes de conception.',
        ],
      },
      {
        code: 'J3.3', title: 'Dimensionnement des installations', order: 3,
        tasks: [
          'Dimensionner les réseaux et les équipements.',
          'Produire les notes de calcul par lot.',
          'Établir les bilans de puissance définitifs.',
          'Soumettre le dimensionnement à validation.',
        ],
      },
      {
        code: 'J3.4', title: 'Plans et pièces d\'exécution fluides', order: 4,
        tasks: [
          'Produire les plans d\'exécution par lot.',
          'Rédiger les descriptifs techniques.',
          'Établir les carnets de détails et les synoptiques.',
          'Diffuser les documents pour exécution.',
        ],
      },
      {
        code: 'J3.5', title: 'Suivi d\'exécution fluides', order: 5,
        tasks: [
          'Viser les documents techniques de l\'entreprise.',
          'Contrôler les installations en cours de pose.',
          'Traiter les questions techniques du chantier.',
          'Suivre la coordination entre les lots techniques.',
        ],
      },
      {
        code: 'J3.6', title: 'Essais et mise en service', order: 6,
        tasks: [
          'Définir le protocole d\'essais.',
          'Assister aux essais et mesures.',
          'Vérifier les performances des installations.',
          'Consigner les résultats d\'essais.',
        ],
      },
      {
        code: 'J3.7', title: 'Clôture de mission', order: 7,
        tasks: [
          'Remettre les documents destinés au DOE (schémas conformes, notices).',
          'Vérifier la levée des réserves fluides.',
          'Clôturer la mission (double validation).',
        ],
      },
    ],
  },
  {
    code: 'M4',
    title: 'Construction',
    responsible: 'Entreprise de construction',
    order: 4,
    isOptional: false,
    milestones: [
      {
        code: 'J4.1', title: 'Préparation du chantier', order: 1,
        tasks: [
          'Installer le chantier (clôture, base vie, accès).',
          'Établir le planning d\'exécution.',
          'Obtenir les autorisations d\'installation.',
          'Réaliser l\'implantation de l\'ouvrage.',
          'Soumettre les documents d\'exécution initiaux.',
        ],
      },
      {
        code: 'J4.2', title: 'Terrassement', order: 2,
        tasks: [
          'Décaper et terrasser.',
          'Exécuter les fouilles.',
          'Évacuer ou stocker les terres.',
          'Faire réceptionner les fonds de fouille (avec le BE structure).',
        ],
      },
      {
        code: 'J4.3', title: 'Fondations', order: 3,
        tasks: [
          'Exécuter le béton de propreté.',
          'Façonner et poser les armatures.',
          'Couler les fondations.',
          'Réaliser les ouvrages enterrés et les arases.',
          'Faire valider les étapes clés.',
        ],
      },
      {
        code: 'J4.4', title: 'Gros œuvre', order: 4,
        tasks: [
          'Élever la structure (poteaux, voiles, poutres).',
          'Couler les planchers.',
          'Réaliser la maçonnerie.',
          'Ménager les réservations des lots fluides.',
          'Documenter l\'avancement (rapports journaliers, photos).',
        ],
      },
      {
        code: 'J4.5', title: 'Charpente', order: 5,
        tasks: [
          'Approvisionner la charpente.',
          'Poser la charpente.',
          'Contrôler la géométrie et les fixations.',
          'Faire valider le jalon.',
        ],
      },
      {
        code: 'J4.6', title: 'Couverture', order: 6,
        tasks: [
          'Poser la couverture et l\'étanchéité.',
          'Traiter les points singuliers (relevés, évacuations).',
          'Contrôler l\'étanchéité (mise hors d\'eau).',
          'Faire valider la mise hors d\'eau.',
        ],
      },
      {
        code: 'J4.7', title: 'Second œuvre', order: 7,
        tasks: [
          'Exécuter les cloisons et les menuiseries.',
          'Exécuter les réseaux (plomberie, électricité, CVC).',
          'Réaliser les revêtements.',
          'Coordonner les corps d\'état.',
          'Tenir les rapports journaliers.',
        ],
      },
      {
        code: 'J4.8', title: 'Finitions', order: 8,
        tasks: [
          'Réaliser les peintures et finitions.',
          'Poser les appareillages et équipements.',
          'Effectuer le nettoyage de fin de chantier.',
          'Réaliser la pré-réception interne (levée des points).',
        ],
      },
      {
        code: 'J4.9', title: 'Réception', order: 9,
        tasks: [
          'Organiser les opérations préalables à la réception.',
          'Lever les réserves.',
          'Remettre les documents (DOE, notices, garanties).',
          'Clôturer la mission (double validation).',
        ],
      },
    ],
  },
  {
    code: 'M5',
    title: 'Architecture d\'Intérieur',
    responsible: 'Architecte d\'intérieur',
    order: 5,
    isOptional: true,
    milestones: [
      {
        code: 'J5.1', title: 'Brief et relevés', order: 1,
        tasks: [
          'Recueillir les besoins et les usages.',
          'Relever les espaces concernés.',
          'Analyser les contraintes techniques.',
          'Faire valider le brief.',
        ],
      },
      {
        code: 'J5.2', title: 'Concept d\'aménagement', order: 2,
        tasks: [
          'Établir le concept (ambiances, planches).',
          'Proposer l\'organisation spatiale.',
          'Présenter le concept au client.',
          'Intégrer les retours et faire valider.',
        ],
      },
      {
        code: 'J5.3', title: 'Projet détaillé', order: 3,
        tasks: [
          'Produire les plans d\'aménagement.',
          'Sélectionner les matériaux et finitions.',
          'Établir les carnets mobilier et éclairage.',
          'Chiffrer l\'aménagement.',
          'Faire valider le projet détaillé.',
        ],
      },
      {
        code: 'J5.4', title: 'Consultation et commandes', order: 4,
        tasks: [
          'Consulter les entreprises et fournisseurs (Marketplace MEEREO le cas échéant).',
          'Comparer les offres.',
          'Passer les commandes validées.',
          'Planifier les interventions.',
        ],
      },
      {
        code: 'J5.5', title: 'Suivi des travaux d\'aménagement', order: 5,
        tasks: [
          'Coordonner les interventions d\'aménagement.',
          'Contrôler la conformité au projet.',
          'Traiter les ajustements.',
          'Documenter l\'avancement.',
        ],
      },
      {
        code: 'J5.6', title: 'Livraison et clôture', order: 6,
        tasks: [
          'Réceptionner les aménagements.',
          'Lever les réserves.',
          'Remettre les documents (fiches produits, garanties — alimentation Asset Engine / Passeport Numérique).',
          'Clôturer la mission (double validation).',
        ],
      },
    ],
  },
]

// ─── Seed ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding mission templates…')

  let missionCount = 0
  let milestoneCount = 0
  let taskCount = 0

  for (const m of REFERENTIEL) {
    const mission = await prisma.missionTemplate.upsert({
      where: { code: m.code },
      update: { title: m.title, responsible: m.responsible, order: m.order, isOptional: m.isOptional },
      create: { code: m.code, title: m.title, responsible: m.responsible, order: m.order, isOptional: m.isOptional },
    })
    missionCount++

    for (const j of m.milestones) {
      const milestone = await prisma.milestoneTemplate.upsert({
        where: { code: j.code },
        update: { title: j.title, order: j.order, missionId: mission.id },
        create: { code: j.code, title: j.title, order: j.order, missionId: mission.id },
      })
      milestoneCount++

      for (let i = 0; i < j.tasks.length; i++) {
        const taskCode = `T${j.code.slice(1)}.${i + 1}` // e.g. T1.1.1
        await prisma.taskTemplate.upsert({
          where: { code: taskCode },
          update: { title: j.tasks[i], order: i + 1, milestoneId: milestone.id },
          create: { code: taskCode, title: j.tasks[i], order: i + 1, milestoneId: milestone.id },
        })
        taskCount++
      }
    }
  }

  console.log(`✅ Seed terminé : ${missionCount} missions, ${milestoneCount} jalons, ${taskCount} tâches`)
}

main()
  .catch((e) => {
    console.error('❌ Seed échoué:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
