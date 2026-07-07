# Page Professionnelle Publique

**Source :** Platform Bible · Tome 14.5 / PRD · Tome 3 Partie 2

## Vision

Identité numérique officielle de chaque entreprise. Vitrine sur MEEREO et partageable en dehors de la plateforme. Remplace la simple fiche entreprise. URL publique (ex: meereo.com/pro/raw-design).

## Structure de la page

### En-tête
Logo, bannière, nom entreprise, catégorie, localisation, badge vérifié, slogan (optionnel).

### Présentation
Histoire, vision, valeurs, domaines d'activité, spécialités. Contenu personnalisable.

### Chiffres clés
Année création, collaborateurs, projets réalisés, pays d'intervention, domaines expertise.

### Domaines d'expertise
Sélection de compétences : Architecture, Construction, Structure, Fluides, Architecture d'intérieur.

### Portfolio
Réalisations : titre, description, localisation, photos, vidéos, année, mission réalisée. Filtrable. Ajout automatique des projets MEEREO possible (avec accord entreprise + client).

### Équipe (facultatif)
Photo, nom, fonction, biographie, spécialités.

### Certifications
Certifications, agréments, qualifications. Documents justificatifs privés sauf décision contraire.

### Références
Projets réalisés sur/hors MEEREO.

### Avis et satisfaction (futur)
Retours d'expérience des clients ayant collaboré. Contextualisés et vérifiables.

### Statistiques (auto-calculées)
Nombre de projets, taux de réponse AO, délai moyen réponse, note moyenne, missions terminées, ancienneté.

## Flow

```
Inscription professionnel
  → Vérification entreprise
  → Création automatique Page (état Brouillon)
  → Personnalisation depuis Cockpit Professionnel
  → Publication → état Publiée
  → Visible dans annuaire, AO, CRM, recherches

Visiteur sur la Page :
  → Consulter infos, portfolio, références
  → Contacter → Communication Hub → conversation privée
  → Inviter dans un projet → sélection projet → invitation officielle
  → Partager / copier lien

Réponse AO :
  → Page Pro automatiquement jointe à la candidature
  → Client consulte identité, portfolio, expertise, références sans duplication
```

## États de la page

- **Brouillon** — visible uniquement par l'entreprise
- **Publiée** — visible dans tout l'écosystème
- **Désactivée** — plus visible publiquement, projets existants inchangés

## Événements générés

- `ProfessionalPagePublished`
- `ProfessionalPageUpdated`
- `ProfessionalPageVisited`
- `PortfolioOpened`
- `ProfessionalContactStarted`
- `ProfessionalInvited`

## Règles métier

- 1 entreprise = 1 Page Pro unique
- Infos publiques choisies par l'entreprise
- Données confidentielles restent privées
- Documents admin jamais rendus publics automatiquement
- SEO optimisé (titre, description, balises, URL lisible)
