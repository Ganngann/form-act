# 📋 Backlog Produit - Form-Act

Ce document centralise toutes les tâches du projet. Il a été réorganisé pour prioriser la stabilité et la conformité métier (Bible) avant l'extension fonctionnelle.

## 🚨 Sprint Actuel : Ajustements Post-Démo 18/02

### US-01 : Sélection Automatique Formateur (UX)
**Référence :** Retour Démo 18/02
**En tant que** Admin,
**Je veux** que le système pré-remplisse le formateur s'il est le seul disponible/compétent,
**Afin de** réduire les clics inutiles (80% des cas).

*Critères d'Acceptation (AC) :*
- [ ] Pré-sélection automatique dans le formulaire de création/modification si 1 seul candidat.
- [ ] Possibilité de modifier manuellement.

### US-02 : Flux Demandeur - Demande de Formation
**Référence :** Retour Démo 18/02
**En tant que** Client,
**Je veux** envoyer une demande sans réservation immédiate,
**Afin de** recevoir une offre tarifaire précise avant de m'engager.

*Critères d'Acceptation (AC) :*
- [ ] Remplacement bouton "Réserver" par "Envoyer une demande".
- [ ] Statut initial : `PENDING_APPROVAL` (Demande en attente).
- [ ] Email de confirmation de réception.

### US-03 : Admin - Proposition Tarifaire
**Référence :** Retour Démo 18/02
**En tant que** Admin,
**Je veux** définir un prix pour une demande client,
**Afin de** lui soumettre une offre.

*Critères d'Acceptation (AC) :*
- [ ] Notification "Nouvelle Demande".
- [ ] Interface de saisie du prix (HTVA/TTC) sur la session.
- [ ] Bouton "Envoyer l'offre" -> Notification Client.
- [ ] Statut : `OFFER_SENT`.

### US-04 : Client - Validation Offre
**Référence :** Retour Démo 18/02
**En tant que** Client,
**Je veux** valider l'offre reçue,
**Afin de** confirmer la session.

*Critères d'Acceptation (AC) :*
- [ ] Vue "Validation Offre" avec récapitulatif prix.
- [ ] Bouton "Accepter l'offre".
- [ ] Passage au statut `CONFIRMED`.

### US-05 : Admin - Gestion Subsides FormTS
**Référence :** Retour Démo 18/02
**En tant que** Admin,
**Je veux** valider moi-même l'éligibilité aux subsides,
**Afin de** garder le contrôle financier.

*Critères d'Acceptation (AC) :*
- [ ] Retrait case "Demander subside" côté Client.
- [ ] Ajout toggle "Subside IN COMPANY accepté" côté Admin.
- [ ] Affichage lecture seule pour le Client.

### US-06 : Admin - Gestion Complète du Contenu (CMS Home & Global)
**Référence :** Demande Client (Parcours du site)
**En tant que** Administrateur,
**Je veux** pouvoir éditer **l'intégralité** des textes de la page d'accueil et les configurations globales,
**Afin de** maîtriser totalement le message marketing sans toucher au code.

*Critères d'Acceptation (AC) :*
- **1. Configuration Globale (Header/Footer)**
    - [ ] Identité : Nom du site, Logo, Favicon.
    - [ ] Coordonnées : Email, Téléphone, Adresse (affichés dans le Footer).
    - [ ] Textes Légaux : Mentions Légales, CGV, Confidentialité (Pages dédiées).

- **2. Édition Page Accueil - Section Hero**
    - [ ] Tagline (ex: "The Signature of Expertise").
    - [ ] Titre Principal (H1).
    - [ ] Paragraphe d'accroche (Intro).

- **3. Édition Page Accueil - Section Promo (Bento Grid)**
    - [ ] Titre & Sous-titre du bloc promotionnel "Visiteurs".
    - [ ] Texte descriptif & Label du bouton d'action.

- **4. Édition Page Accueil - Arguments (Value Pillars)**
    - [ ] Titre & Texte pour chacun des 3 piliers (ex: Qualité, Réseau, Tracking).

- **5. Édition Page Accueil - Preuve Sociale (Citation)**
    - [ ] Texte de la citation.
    - [ ] Auteur & Poste.

- **6. Édition Page Accueil - Appel à l'action (Final CTA)**
    - [ ] Grand Titre de fin de page.
    - [ ] Libellés des boutons (Devis / Catalogue).

### US-07 : Footer (Pied de Page)
**Référence :** Demande Client (Parcours du site)
**En tant que** Visiteur,
**Je veux** avoir accès aux informations légales et pratiques en bas de chaque page,
**Afin de** naviguer en toute confiance.

*Critères d'Acceptation (AC) :*
- [ ] Création du composant global `Footer`.
- [ ] Liens vers : "Mentions Légales", "CGV", "Politique de Confidentialité".
- [ ] Coordonnées de contact (Adresse, Email).
- [ ] Copyright dynamique (Année).
- [ ] *Lien avec US-06 : Les textes doivent être modifiables via l'admin.*

### US-08 : Inscription Spontanée Client
**Référence :** Demande Client (Parcours du site)
**En tant que** Prospect Client,
**Je veux** créer mon compte sans devoir initier une demande de formation,
**Afin de** préparer mes informations de facturation et accéder à mon espace personnel.

*Critères d'Acceptation (AC) :*
- [ ] Formulaire d'inscription accessible publiquement (Lien "Espace Client" ou "S'inscrire").
- [ ] Collecte des informations de base (Nom, Email, Mot de passe).
- [ ] Redirection vers le Dashboard Client après inscription.

### US-09 : Formateur - Agenda & Synchronisation (iCal In)
**Référence :** Bible 2.3 & Demande Client
**En tant que** Formateur,
**Je veux** gérer mes plages d'indisponibilité manuellement ET synchroniser mon agenda personnel (Google/Outlook),
**Afin de** ne pas recevoir de demandes sur des créneaux déjà occupés par ailleurs.

*Critères d'Acceptation (AC) :*
- [ ] Interface Agenda dans l'Espace Formateur (Vue Mensuelle/Hebdo).
- [ ] Ajout manuel de "Jours OFF" ou "Plages Occupées".
- [ ] **Import iCal (Flux Entrant)** : Champ pour coller l'URL ics de son agenda perso.
- [ ] Tâche de fond (Cron) pour lire les flux iCal et bloquer les créneaux correspondants.
- [ ] Prise en compte immédiate par l'algorithme d'attribution (Exclusion du formateur si occupé).

### US-10 : Téléchargement Liste Participants (Admin/Formateur)
**Référence :** Demande Client
**En tant que** Formateur ou Administrateur,
**Je veux** télécharger la liste des participants formattée (Liste d'émargement),
**Afin de** la faire signer le jour J ou d'en disposer pour gestion.

*Critères d'Acceptation (AC) :*
- [ ] Bouton "Télécharger Liste Émargement (PDF)" sur le détail de la mission (Espace Formateur).
- [ ] Bouton "Télécharger Liste" sur la fiche session (Espace Admin).
- [ ] Le PDF doit contenir : Infos Session, Liste Noms/Prénoms, Colonne Signature.
- [ ] Accessible dès que la session est confirmée.

### US-11 : Tous - Modification du Mot de Passe
**Référence :** Demande Client
**En tant que** Utilisateur (Admin, Client, Formateur),
**Je veux** modifier mon mot de passe actuel depuis mon profil,
**Afin de** sécuriser mon compte.

*Critères d'Acceptation (AC) :*
- [ ] Section "Sécurité" dans le profil utilisateur.
- [ ] Formulaire : Ancien mot de passe / Nouveau mot de passe / Confirmation.
- [ ] Validation de complexité (Min 8 caractères).
- [ ] Feedback visuel "Mot de passe mis à jour".
- [ ] *Complète l'US-32 (Reset Password par email).*

### US-12 : Admin - Désactivation Formateur
**Référence :** Demande Client
**En tant que** Administrateur,
**Je veux** désactiver un formateur qui ne collabore plus avec nous,
**Afin de** l'exclure des nouvelles assignations et bloquer son accès, sans perdre l'historique.

*Critères d'Acceptation (AC) :*
- [ ] Toggle "Actif / Inactif" sur la fiche formateur.
- [ ] Si Inactif : Impossible de se connecter.
- [ ] Si Inactif : Exclu des résultats de recherche pour les nouvelles sessions.
- [ ] Si Inactif : Conservé dans l'historique des sessions passées.
- [ ] Filtre "Afficher les inactifs" dans la liste des formateurs.

### US-13 : Admin - Reset Filtres Sessions
**Référence :** Demande Client
**En tant que** Administrateur,
**Je veux** un bouton pour désactiver tous les filtres actifs sur la liste des sessions,
**Afin de** visualiser l'intégralité des dossiers en un clic.

*Critères d'Acceptation (AC) :*
- [ ] Bouton "Voir tout" ou "Réinitialiser" à côté de la barre de recherche/filtres.
- [ ] Action : Remet tous les filtres (Recherche, Statut, Date) à zéro.
- [ ] Recharge la liste complète des sessions (hors archives).

### US-14 : Admin - Relance Manuelle Logistique Client
**Référence :** Demande Client
**En tant que** Administrateur,
**Je veux** déclencher manuellement l'email de rappel logistique à un client,
**Afin de** débloquer un dossier sans attendre l'automatisme (ou en cas de non-réception).

*Critères d'Acceptation (AC) :*
- [ ] Bouton "Relancer Client (Logistique)" sur la fiche session (si logistique incomplète).
- [ ] Envoi immédiat de l'email type "Relance Logistique" (avec lien formulaire).
- [ ] Feedback visuel "Email de relance envoyé".
- [ ] Feedback visuel "Email de relance envoyé".

### US-15 : Admin - Édition Textes Emails (CMS)
**Référence :** Demande Client
**En tant que** Administrateur,
**Je veux** modifier le contenu des emails automatiques (Offre, Validation, Relance),
**Afin de** personnaliser ma communication sans développeur.

*Critères d'Acceptation (AC) :*
- [ ] Section "Modèles d'Emails" dans l'admin (avec Paramètres Généraux).
- [ ] Liste des templates editables (Sujet + Corps).
- [ ] Support des variables dynamiques (ex: `{{client_name}}`, `{{session_date}}`).
- [ ] Sauvegarde en base de données plutôt que dans le code (fichiers JSON ou table DB).

## 🏗️ Sprint Précédent : Stabilisation & Conformité (Priorité Immédiate)
*Objectif : Garantir que le tunnel de vente (Client) et la gestion logistique (Formateur) fonctionnent sans défaut avant d'ouvrir la facturation.*

### Bug-03 : Checkout & Récapitulatif (Estimation)
**Référence Bible :** Section 3.1
**Symptôme :** Le tunnel de réservation s'arrête brutalement sans étape de confirmation.
- [x] Ajouter une étape de confirmation finale avant validation.
- [x] Afficher un récapitulatif avec mention explicite **"Estimation Tarifaire"** (Le prix final incluant les frais de déplacement exacts sera validé par l'admin à la facturation, cf. Bible 5.1).
- [x] Préciser au client que la facturation sera effectuée via Odoo après la prestation.

### Audit-UX-01 : Module Logistique Client
**Référence Bible :** Section 4.2 (Verrou J-7)
- [x] S'assurer que le client peut éditer le lieu/participants/matériel tant que ce n'est pas verrouillé (J-7).

### Bug-07 : Amélioration Seed (Dette Technique)
- [x] Corriger `seed.ts` pour utiliser des `upsert` robustes sur les titres de formation et éviter les multiplications infinies au re-seed.

### Bug-08 : Admin - Sélection Formateurs Experts
**Symptôme :** L'administrateur ne peut pas sélectionner les formateurs experts lors de l'édition d'une formation.
**Impact :** Bloquant pour la gestion des formations "Expertise".
- [ ] Analyser le composant de sélection (Combobox/Select).
- [ ] Vérifier la requête API de récupération des formateurs.
- [ ] Corriger la liaison ID Formation <-> ID Formateur.

### Bug-09 : UI - Champs Formulaire Formateur
**Symptôme :** Le texte des champs "Email" et "Biographie" chevauche les icônes sur la page d'édition.
**Action :** Ajuster le padding-left des inputs concernés (CSS Tailwind).

### Tech-01 : Refactorisation Dialog UI (Dette Technique)
- [x] Le composant `apps/web/src/components/ui/dialog.tsx` est une implémentation "maison" simplifiée qui n'utilise pas les primitives complètes de `@radix-ui/react-dialog` (Portal, Overlay). Il faudrait le migrer vers l'implémentation standard shadcn/ui pour garantir une accessibilité et une gestion du focus optimales.

### Tech-02 : UI - Standardisation Header Admin
**But :** Harmoniser les en-têtes des pages d'administration.
**Design :** Badge (Pill) + Titre (H1) + Sous-titre + Bouton Retour optionnel.
- [ ] Créer un composant réutilisable `PageHeader` (ou `AdminHeader`).
- [ ] Props : `badge`, `title`, `description`, `backButton` (boolean/href), `breadcrumb` (array ou ReactNode), `children` (ReactNode pour actions à droite).
- [ ] Remplacer les en-têtes "en dur" dans les pages Admin (Dashboard, Sessions, Archives, etc.).

---

## 🚧 Sprint Suivant : Finance & Administration
*Objectif : Implémenter le flux financier (Facturation & Reporting) une fois les opérations fiabilisées.*

### US-33 : Admin - Préparation Facturation
**Référence Bible :** Section 5.1 (Calcul Prix) & 5.2 (Odoo Prep)
**En tant que** Administrateur,
**Je veux** visualiser les sessions terminées et ajuster le prix final,
**Afin de** préparer l'encodage comptable dans Odoo.

*Critères d'Acceptation (AC) :*
- [x] Liste des sessions terminées avec preuve validée (`PROOF_RECEIVED` ou `VALIDATED`).
- [x] Calcul automatique du prix : Base + Distance (Matrix) + Options.
- [x] **Champ "Ajustement Admin"** éditable (Positif ou Négatif) pour figer le Prix Final (Bible 5.1).
- [x] Vue synthétique des données de facturation (TVA, Adresse).

### US-34 : Admin - Clôture Facturation
**Référence Bible :** Section 5.2 (Odoo Prep)
**En tant que** Administrateur,
**Je veux** marquer une session comme "Facturée",
**Afin de** notifier le client et archiver le dossier.

*Critères d'Acceptation (AC) :*
- [x] Action "Marquer comme Facturé".
- [x] Envoi email notification client.
- [x] Archivage de la session (Lecture seule / Statut `INVOICED`).

### US-35 : Formateur - Reporting & Honoraires
**Référence Bible :** Section 3.3 (Reporting)
**En tant que** Formateur,
**Je veux** visualiser le récapitulatif de mes missions et l'estimation de mes gains,
**Afin de** suivre mon activité.

*Critères d'Acceptation (AC) :*
- [ ] Page "Reporting" dans l'espace formateur.
- [ ] Sélecteur de Mois.
- [ ] KPIs : Nombre missions, Total Km, Total Honoraires (Estimé).
- [ ] Liste des missions du mois avec détail montant.

---

## 🚀 Sprint de Lancement : Infrastructure & Production
*Objectif : Sécuriser et déployer l'application pour le "Go Live".*

### US-36 : Mise en Production (Production Ready)
**Contexte :** Déploiement sur o2switch (Node.js).
**En tant que** DevOps,
**Je veux** configurer l'application pour un environnement de production sécurisé.

*Critères d'Acceptation (AC) :*
- [ ] Sécurité : Intégration Helmet et Rate Limiting (Backend).
- [ ] Env : Validation stricte des variables (Joi/Zod) et configuration FRONTEND_URL.
- [ ] Procédure : Documentation déploiement o2switch (Scripts de build monorepo).
- [ ] Persistance : Gestion des volumes pour les `uploads` (Preuves de présence).

### US-Seed-Final : Consolidation Données
- [ ] Vérifier que le seed de production contient les formations et catégories finales validées par le métier.

---

## 🧊 Frigo / V2 (Post-MVP)
*Fonctionnalités "Confort" identifiées dans la Bible mais non bloquantes pour le lancement.*



### US-38 : Conformité RGPD (Anonymisation)
**Référence Bible :** Section 6.2
- [ ] Tâche Cron quotidienne pour supprimer les données participants après 24 mois.

---

## 🗄️ Archives (Terminé)

### 💎 Refonte Admin V2 (Février 2026)
- [x] **AdminBentoStats** : Indicateurs visuels interactifs (Assignations, Logistique J-14, Émargements, Facturation).
- [x] **SessionRadarCard** : Design "Radar Opérationnel" avec urgence J-X et pipeline tactique 5 étapes.
- [x] **SessionSearchBar** : Filtrage temps réel par formation, client ou formateur.
- [x] **ArchivesPage** : Workspace séparé pour les sessions clôturées (billedAt != null).
- [x] **Workspace Unifié** : Navigation fluide et dashboard consolidé.

### Sprints 1 à 5 + Corrections Post-Audit (Terminées)

*(Liste des tâches terminées conservée pour historique)*

- [x] **US-00 à US-04** (Sprint 1 : Fondations)
- [x] **US-10 à US-15** (Sprint 2 : Logistique & Admin)
- [x] **US-16 à US-20** (Sprint 3 : Automations)
- [x] **US-21 à US-28** (Sprint 4 : UX)
- [x] **US-29** : Client - Gestion Profil & Facturation
- [x] **US-30** : Admin - Gestion des Sessions (Base)
- [x] **US-31** : Booking - Demande Manuelle
- [x] **US-32** : Auth - Réinitialisation Mot de Passe
- [x] **US-33** : Admin - Préparation Facturation (Calcul base + distance)
- [x] **US-34** : Admin - Clôture Facturation (Statut INVOICED + Email)
- [x] **Bug-01** : Catalogue Vide & Recherche
- [x] **Bug-02** : Liens Morts
- [x] **Bug-04** : Espace Formateur
- [x] **Bug-05** : Logique Métier & Planning
- [x] **Bug-06** : Participants & Emails (Partie Infra Notifs)
- [x] **US-Data-01** : Enrichissement Modèle
