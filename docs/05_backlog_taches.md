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
- [ ] Hero Section avec Titre & Sous-titre.
- [ ] Dropdown de recherche par "Catégorie" (Thème) redirigeant vers le Catalogue.
- [ ] CTAs "Espace Formateur", "Connexion" et "Voir le Catalogue".
- [ ] Section Réassurance.

### US-22 : Navigation Globale
**En tant que** Utilisateur,
**Je veux** une barre de navigation accessible sur toutes les pages et adaptée à mon rôle,
**Afin de** circuler facilement entre l'accueil, le catalogue et mon espace personnel.

*Critères d'Acceptation (AC) :*
- [ ] Header présent sur le layout principal.
- [ ] **Public** : Liens Accueil, Catalogue, Connexion.
- [ ] **Admin** : Lien vers Dashboard Admin.
- [ ] **Formateur** : Lien vers Espace Formateur (Missions).
- [ ] **Client** : Lien vers Espace Client (Mes formations).

### US-23 : Catalogue Client & Recherche
**Référence Wireframe :** Section 2.1 (Catalogue)
**En tant que** Client,
**Je veux** voir la liste des formations disponibles,
**Afin de** faire mon choix.

*Critères d'Acceptation (AC) :*
- [ ] Grille des formations filtrable par Catégorie.
- [ ] Affichage des cartes formations (Titre, Durée).
- [ ] Accès clair à la page Catalogue depuis la Navigation et l'Accueil.
- [ ] Lien vers la page détail formation.

### US-24 : Admin - Liste des Clients
**En tant que** Administrateur,
**Je veux** voir la liste de tous les comptes clients inscrits,
**Afin de** gérer le parc utilisateur.

*Critères d'Acceptation (AC) :*
- [ ] Endpoint Backend `GET /clients` (Nouveau Module Clients).
- [ ] Mise à jour Schema Prisma : Ajout `createdAt` sur le modèle Client.
- [ ] Page liste des clients (Tableau).
- [ ] Colonnes : Nom Entreprise, TVA, Email, Date inscription.

### US-25 : UX Admin - Création Formateur (Zones)
**En tant que** Administrateur,
**Je veux** sélectionner facilement les zones (Prédilection/Expertise) lors de la création d'un formateur,
**Afin de** configurer correctement son profil géographique dès le départ.

*Critères d'Acceptation (AC) :*
- [ ] Correctif `TrainerForm` : Chargement des zones activé en mode "Création" (et pas seulement Edition).
- [ ] Composant de sélection de zones (Multi-select) visible et ergonomique.

### US-26 : UX Formateur - Dashboard & Next Mission
**Référence Wireframe :** Section 2.3 (Dashboard Formateur)
**En tant que** Formateur,
**Je veux** voir immédiatement les détails complets de ma prochaine mission,
**Afin de** me préparer sans chercher l'info.

*Critères d'Acceptation (AC) :*
- [ ] Logique de filtre : Prochaine mission = Première mission chronologique où `date >= today`.
- [ ] Bloc "Prochaine Mission" mis en avant (Card distincte).
- [ ] Informations affichées : Client, Date/Heure, Adresse, Formation.
- [ ] Actions : Bouton "Y aller" (Lien Google Maps généré) et "Détails".

### US-27 : UX Admin - Dashboard (Vue d'ensemble)
**En tant que** Administrateur,
**Je veux** voir les prochaines formations prévues sur mon dashboard,
**Afin de** piloter l'activité au jour le jour.

*Critères d'Acceptation (AC) :*
- [ ] Endpoint Backend `GET /sessions` avec filtres de date et status.
- [ ] Widget "Prochaines Sessions" sur le dashboard Admin (Sessions CONFIRMED à venir).
- [ ] Lien "Voir tout" redirigeant vers la liste complète des sessions.

### US-28 : Tech - Seed Consolidation (Données de Test)
**En tant que** Développeur/Testeur,
**Je veux** des données de seed cohérentes et interconnectées,
**Afin de** tester les parcours utilisateurs complets sans configuration manuelle.

*Critères d'Acceptation (AC) :*
- [ ] Seed Client avec historique de commandes (Passées, Futures).
- [ ] Ajout des dates de création (`createdAt`) pour les clients seedés.
- [ ] Cohérence entre Zones Formateur et Zones Client dans les sessions seedées.
- [ ] Données réalistes pour les tests de dashboard (KPIs non vides).

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
- [ ] Schema Prisma mis à jour avec les nouveaux champs (Optionnels/Nullable pour l'instant).
- [ ] Migration SQL générée et appliquée.
- [ ] DTOs NestJS (`CreateFormationDto`, `UpdateFormationDto`) mis à jour pour accepter ces champs.
- [ ] Entité de retour mise à jour.
