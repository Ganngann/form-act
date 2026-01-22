# 📋 Backlog Produit - Form-Act

Ce document centralise toutes les tâches du projet. Il sert de "cerveau" pour prioriser les développements avec l'IA.

## 🟢 Sprint 1 : Fondations & Tunnel de Réservation (MVP) - ✅ TERMINE

- [x] **US-00** : Spike Déploiement & Architecture (P0)
- [x] **US-01** : Initialisation du Projet
- [x] **US-Tech-01** : Moteur de Territorialité & Dispatch
- [x] **US-02** : Catalogue des Formations (Public)
- [x] **US-Refacto-01** : Mise à jour Workflow Réservation (Transition V1 -> V2)
- [x] **US-03** : Fiche Formation & Calendrier
- [x] **US-Quality-01** : Stabilisation & Qualité (Post US-03)
- [x] **US-04** : Tunnel de Réservation (Checkout V1)

## 🟡 Sprint 2 : MVP Logistique & Admin (Prioritaire) - ✅ TERMINE

- [x] **US-10** : Admin - Gestion Identité Formateurs
- [x] **US-11** : Admin - Gestion Zones Formateurs
- [x] **US-12** : Admin - Vue Master Calendar
- [x] **US-12.5** : Auth - Sécurisation & Sessions
- [x] **US-13** : Formateur - Dashboard & Missions
- [x] **US-14** : Formateur - Gestion Profil
- [x] **US-15** : Formateur - Upload Preuve

## 🔴 Sprint 3 : Automations & Finalisation (Post-MVP)

### US-16 : Tech - Infrastructure Notifications
- [x] **Infra** : NestJS Schedule/Bull, Entité NotificationLog, Service Email.

### US-17 : Notifs - Cycle Logistique (Relances)
- [x] **Relances** : Cron T+48h (Logistique), Cron J-15 & J-9 (Participants).

### US-18 : Notifs - Cycle Préparation (J-30/J-7)
- [x] **Docs** : Programme (J-30), Rappel (J-21), Pack Doc & Lock (J-7).

### US-19 : Notifs - Cycle Clôture (J+1)
**Référence Bible :** Section 4.1 (Matrice des Notifications)
**En tant que** Système,
**Je veux** relancer le formateur après la session,
**Afin de** récupérer la preuve de prestation rapidement.

*Critères d'Acceptation (AC) :*
- [x] Cron J+1 (Formateur) : Rappel upload preuve si non reçue.

### US-20 : Tech - Export Calendrier (iCal Out)
**Référence Bible :** Section 2.3 (Flux Sortant)
**En tant que** Formateur,
**Je veux** un lien iCal exposant mes missions Form-Act,
**Afin de** les voir dans mon agenda personnel.

*Critères d'Acceptation (AC) :*
- [x] Endpoint public sécurisé (Token) générant un flux .ics.
- [x] Inclusion des détails (Lieu, Heure) dans les événements.

## 🟣 Sprint 4 : Feedback & UX (Refonte & Ajustements)

### US-21 : Page d'Accueil Publique
**Référence Wireframe :** Section 2.1 (Accueil)
**En tant que** Visiteur,
**Je veux** une page d'accueil accueillante avec un moteur de recherche par thème,
**Afin de** comprendre l'offre et commencer ma réservation.

*Critères d'Acceptation (AC) :*
- [x] Hero Section avec Titre & Sous-titre.
- [x] Dropdown de recherche par "Catégorie" (Thème) redirigeant vers le Catalogue.
- [x] CTAs "Espace Formateur", "Connexion" et "Voir le Catalogue".
- [x] Section Réassurance.

### US-22 : Navigation Globale
**En tant que** Utilisateur,
**Je veux** une barre de navigation accessible sur toutes les pages et adaptée à mon rôle,
**Afin de** circuler facilement entre l'accueil, le catalogue et mon espace personnel.

*Critères d'Acceptation (AC) :*
- [x] Header présent sur le layout principal.
- [x] **Public** : Liens Accueil, Catalogue, Connexion.
- [x] **Admin** : Lien vers Dashboard Admin.
- [x] **Formateur** : Lien vers Espace Formateur (Missions).
- [x] **Client** : Lien vers Espace Client (Mes formations).

### US-23 : Catalogue Client & Recherche
**Référence Wireframe :** Section 2.1 (Catalogue)
**En tant que** Client,
**Je veux** voir la liste des formations disponibles,
**Afin de** faire mon choix.

*Critères d'Acceptation (AC) :*
- [x] **Menu de navigation Client** : Liens vers "Catalogue" et "Mes Formations".
- [x] Grille des formations filtrable par Catégorie.
- [x] Affichage des cartes formations (Titre, Durée).
- [x] Accès clair à la page Catalogue depuis la Navigation et l'Accueil.
- [x] Lien vers la page détail formation.

### US-24 : Admin - Liste des Clients
**En tant que** Administrateur,
**Je veux** voir la liste de tous les comptes clients inscrits,
**Afin de** gérer le parc utilisateur.

*Critères d'Acceptation (AC) :*
- [x] Endpoint Backend `GET /clients` (Nouveau Module Clients).
- [x] Mise à jour Schema Prisma : Ajout `createdAt` sur le modèle Client.
- [x] Page liste des clients (Tableau).
- [x] Colonnes : Nom Entreprise, TVA, Email, Date inscription.

### US-25 : UX Admin - Création Formateur (Zones)
**En tant que** Administrateur,
**Je veux** sélectionner facilement les zones (Prédilection/Expertise) lors de la création d'un formateur,
**Afin de** configurer correctement son profil géographique dès le départ.

*Critères d'Acceptation (AC) :*
- [x] Correctif `TrainerForm` : Chargement des zones activé en mode "Création" (et pas seulement Edition).
- [x] Composant de sélection de zones (Multi-select) visible et ergonomique.

### US-26 : UX Formateur - Dashboard & Next Mission
**Référence Wireframe :** Section 2.3 (Dashboard Formateur)
**En tant que** Formateur,
**Je veux** voir immédiatement les détails complets de ma prochaine mission et accéder à tout mon espace,
**Afin de** gérer mon activité au quotidien.

*Critères d'Acceptation (AC) :*
- [x] **Menu de navigation Formateur** : Liens vers "Tableau de bord / Missions", "Mon Profil" et "Mon Calendrier" (Export iCal).
- [x] Logique de filtre : Prochaine mission = Première mission chronologique où `date >= today`.
- [x] Bloc "Prochaine Mission" mis en avant (Card distincte).
- [x] Informations affichées : Client, Date/Heure, Adresse, Formation.
- [x] Actions : Bouton "Y aller" (Lien Google Maps généré) et "Détails".

### US-27 : UX Admin - Dashboard (Vue d'ensemble)
**En tant que** Administrateur,
**Je veux** voir les prochaines formations prévues sur mon dashboard et accéder à tous mes outils de gestion,
**Afin de** piloter l'activité au jour le jour.

*Critères d'Acceptation (AC) :*
- [x] **Menu de navigation Admin** (Sidebar/Tabs) : Liens vers "Dashboard", "Formateurs", "Clients", "Calendrier Master".
- [x] Endpoint Backend `GET /sessions` avec filtres de date et status.
- [x] Widget "Prochaines Sessions" sur le dashboard Admin (Sessions CONFIRMED à venir).
- [x] Lien "Voir tout" redirigeant vers la liste complète des sessions.

### US-28 : Tech - Seed Consolidation (Données de Test)
**En tant que** Développeur/Testeur,
**Je veux** des données de seed cohérentes et interconnectées,
**Afin de** tester les parcours utilisateurs complets sans configuration manuelle.

*Critères d'Acceptation (AC) :*
- [x] Seed Client avec historique de commandes (Passées, Futures).
- [x] Ajout des dates de création (`createdAt`) pour les clients seedés.
- [x] Cohérence entre Zones Formateur et Zones Client dans les sessions seedées.
- [x] Données réalistes pour les tests de dashboard (KPIs non vides).

## ⚪ Sprint 5 : Fonctionnalités Avancées (Reportées)

### US-29 : Tech - Import Calendrier (iCal In)
**Référence Bible :** Section 2.3 (Flux Entrant)
**En tant que** Système,
**Je veux** lire l'agenda personnel du formateur,
**Afin de** ne pas lui proposer de missions sur ses créneaux occupés.

*Critères d'Acceptation (AC) :*
- [ ] Champ URL iCal dans le profil Formateur.
- [ ] Tâche planifiée de synchronisation (lecture et création de "blocages").

### US-30 : Admin - Préparation Facturation
**Référence Bible :** Section 5.1 & 5.2
**En tant que** Administrateur,
**Je veux** visualiser les sessions prêtes à être facturées avec le prix calculé,
**Afin de** préparer l'encodage comptable.

*Critères d'Acceptation (AC) :*
- [ ] Liste des sessions terminées avec preuve validée.
- [ ] Calcul automatique du prix final : Base + Distance (Matrix) + Ajustement.
- [ ] Vue synthétique des données de facturation (TVA, Adresse).

### US-31 : Admin - Clôture Facturation
**Référence Bible :** Section 5.2 (Odoo Prep)
**En tant que** Administrateur,
**Je veux** marquer une session comme "Facturée",
**Afin de** notifier le client et archiver le dossier.

*Critères d'Acceptation (AC) :*
- [ ] Action "Marquer comme Facturé".
- [ ] Envoi email notification client.
- [ ] Archivage de la session (Lecture seule).

### US-32 : Auth - Réinitialisation Mot de Passe
**Référence Bible :** Section 3.1 (Interface Publique)
**En tant que** Utilisateur,
**Je veux** pouvoir définir un nouveau mot de passe si j'ai oublié l'ancien,
**Afin de** récupérer l'accès à mon compte.

*Critères d'Acceptation (AC) :*
- [ ] Flux "Mot de passe oublié" (Email avec lien/token).
- [ ] Page de définition du nouveau mot de passe.

## ⚫ Sprint 6 : Infrastructure & Mise en Prod

### US-33 : Mise en Production (Production Ready)
**Contexte :** Le projet doit être déployé sur un hébergement o2switch (Node.js) et supporter une charge d'environ 120 sessions/an. L'objectif est de sécuriser l'application et de garantir sa stabilité en production.

**En tant que** DevOps / Développeur,
**Je veux** configurer l'application pour un environnement de production sécurisé et robuste,
**Afin de** prévenir les failles de sécurité et assurer le bon fonctionnement sur l'infrastructure cible.

*Critères d'Acceptation (AC) :*

1.  **Sécurité Applicative** :
    - [ ] Mise en place de **Helmet** (En-têtes HTTP sécurisés).
    - [ ] Configuration **CORS** dynamique (via variables d'environnement) pour autoriser uniquement le domaine frontend de production.
    - [ ] Activation du **Rate Limiting** (Throttler) pour protéger l'API contre les abus (ex: Brute Force).

2.  **Configuration & Environnement** :
    - [ ] Validation stricte des variables d'environnement au démarrage (Joi/Zod) : Vérifier présence DB_URL, JWT_SECRET, SMTP_CONFIG, etc.
    - [ ] Désactivation des logs de debug (NestJS Logger) en mode production.

3.  **Procédure de Déploiement (o2switch)** :
    - [ ] Documentation de la procédure de mise en ligne sur cPanel/Node.js.
    - [ ] Stratégie de gestion des uploads : Configuration du dossier `uploads` pour être persistant (hors du dossier de build écrasé à chaque déploiement).
    - [ ] Script ou documentation pour l'exécution des migrations Prisma en production (`prisma migrate deploy`).

4.  **Build & Optimisation** :
    - [ ] Vérification des scripts de build pour exclure les `devDependencies` en production (`pnpm prune --prod` ou équivalent).

## 🔵 Backlog - Améliorations Données

### US-Data-01 : Enrichissement Modèle Formation

**En tant que** Développeur,
**Je veux** étendre le modèle de données `Formation` dans Prisma,
**Afin de** pouvoir persister les données commerciales et pédagogiques complètes.

*Champs à ajouter (Spécifications) :*
1. **`price`** (Decimal) : Montant standard en Euros (HTVA).
2. **`methodology`** (String/Text) : Description de l'approche pédagogique (ex: "Jeux de rôles, mises en situation...").
3. **`inclusions`** (String/Text) : Liste du matériel inclus (ex: "Syllabus, Matériel pédagogique, Analyse demande").
4. **`agreementCode`** (String) : Numéro d'agrément Titres-Services (ex: "E XXXX" ou "XXX").
5. **`imageUrl`** (String) : URL de l'image d'illustration de la formation.

*Critères d'Acceptation (AC) :*
- [x] Schema Prisma mis à jour avec les nouveaux champs (Optionnels/Nullable pour l'instant).
- [x] Migration SQL générée et appliquée.
- [x] DTOs NestJS (`CreateFormationDto`, `UpdateFormationDto`) mis à jour pour accepter ces champs.
- [x] Entité de retour mise à jour.
