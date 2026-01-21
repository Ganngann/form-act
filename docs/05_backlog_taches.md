# 📋 Backlog Produit - Form-Act

Ce document centralise toutes les tâches du projet. Il sert de "cerveau" pour prioriser les développements avec l'IA.

## 🟢 Sprint 1 : Fondations & Tunnel de Réservation (MVP)

### US-00 : Spike Déploiement & Architecture (P0)
**Objectif :** Valider la faisabilité technique de la stack sur l'hébergement partagé o2switch avant tout développement métier.
- [x] **POC Hello World** : Déployer un Monorepo minimal (NestJS + Next.js) sur o2switch.
- [x] **Test Persistance** : Vérifier que le processus NestJS (Backend) ne se fait pas tuer par le Garbage Collector de cPanel.
- [x] **Test Base de Données** : Connexion MariaDB depuis le VPS/Mutualisé.

### US-01 : Initialisation du Projet
- [x] **Mise en place Stack** : Initialiser Monorepo pnpm (NestJS + Next.js).
- [x] **Setup Design System** : Configurer `globals.css` (Variables couleurs HSL), Police `Inter`, et installer composants Shadcn de base (`button`, `card`, `input`).
- [x] **Config DB** : Configurer Prisma pour SQLite (Dev) et préparer le switch MariaDB (Prod).
- [x] **Script "Jules-Ready"** : Créer une commande `npm run init:project` qui installe tout et génère la DB SQLite en une fois.
- [x] **Seeding** : Créer le script `prisma/seed.ts` pour peupler la DB avec des données de test (Formateurs, Formations).
- [x] **CI/CD** : Configurer GitHub Actions pour le Lint et les Tests.

### US-Tech-01 : Moteur de Territorialité & Dispatch
**Objectif :** Coder la logique "cœur" d'attribution des formateurs (Bible 2.2).
- [x] **Modélisation DB** : Tables `Trainer`, `Zone`, `Expertise`. Distinction "Prédilection" vs "Expertise".
- [x] **Service de Dispatch** : `DispatcherService.findAvailableTrainers(date, zoneId)`.
- [x] **Règle** : Si zone "Désert", retourner tableau vide (pour trigger le fallback manuel).

### US-02 : Catalogue des Formations (Public)
**En tant que** Visiteur,
**Je veux** voir la liste des formations disponibles filtrée par région,
**Afin de** choisir celle qui me convient.

*Critères d'Acceptation (AC) :*
- [x] La page `/catalogue` affiche une grille de formations.
- [x] Un filtre "Province" permet de masquer les formations non disponibles (via `DispatcherService`).
- [x] Chaque carte affiche : Titre, Durée.
- [x] Données mockées (fausses données) utilisées pour cette étape (Implémenté avec données réelles).

### US-Refacto-01 : Mise à jour Workflow Réservation (Transition V1 -> V2)
**Objectif :** Modifier l'implémentation de la US-02 et préparer le terrain pour la US-03 afin de respecter la nouvelle logique métier (Province au Checkout).

*Tâches Techniques :*
- [x] **Retrait Filtre (Catalogue)** : Supprimer le filtre "Province" de la page `/catalogue`. Le tri principal est désormais par Thème (via entité `Category`).
- [x] **Logique State** : Le `RegionFilter` a été remplacé par un filtrage par Catégorie. La zone n'est plus demandée à cette étape.
- [x] **Dispatcher** : Le service de Dispatch n'est plus appelé au chargement du catalogue. Le filtrage géographique est repoussé à la réservation.

### US-03 : Fiche Formation & Calendrier
**En tant que** Visiteur,
**Je veux** voir les détails, choisir ma province et un formateur,
**Afin de** décider quand réserver.

*Critères d'Acceptation (AC) :*
- [x] Page `/formation/[id]` fonctionnelle.
- [x] **Sélecteur de Province** : Intégrer le choix de la province (Step 1 du tunnel). *Design à définir : Modale ou encart "Sticky"*.
- [x] Affichage dynamique des formateurs disponibles pour la province choisie.
- [x] Si aucun formateur : Afficher bouton "Demande de prise en charge manuelle".
- [x] Le calendrier affiche les disponibilités du formateur sélectionné.
- [x] Intégration de la règle "Demi-journée" vs "Journée complète".

### US-Quality-01 : Stabilisation & Qualité (Post US-03)
**Objectif :** Résoudre la dette technique identifiée lors de la review US-03 avant de complexifier le widget.

**Critères Business (AC) :**
- [x] Le comportement du widget de réservation reste identique pour l'utilisateur final (Iso-fonctionnel).
- [x] La sélection de zone, formateur et date reste fluide et réactive.

**Critères Qualité & Technique :**
- [x] **Refactoring** : Découper `booking-widget.tsx` (actuellement > 250 lignes) en sous-composants (`ZoneSelector`, `TrainerSelector`, `CalendarView`) respectant la limite de ~150 lignes.
- [x] **Clean Code** : Extraire la logique d'état et de fetch dans un Custom Hook `useBookingLogic`.
- [x] **Environnement** : Nettoyer les URL API hardcodées (utiliser variable d'env).

### US-04 : Tunnel de Réservation (Checkout V1)
**En tant que** Visiteur,
**Je veux** finaliser ma réservation en créant mon compte via mon N° TVA,
**Afin de** valider ma commande.

**Critères Business (AC) :**
- [x] Un formulaire demande le N° TVA au visiteur.
- [x] **Auto-complétion** : Le système pré-remplit le Nom de l'entreprise et l'Adresse via API externe (VIES/BCE).
- [x] **Mode Dégradé** : Si l'API TVA échoue ou si le client le souhaite, la saisie manuelle est possible.
- [x] La validation du formulaire crée le compte utilisateur (Client) et enregistre la session en base de données.
- [x] L'utilisateur est redirigé vers une page de succès/confirmation.

**Critères Qualité & Technique :**
- [x] Utilisation de Zod pour la validation stricte des données (Format TVA BE, champs requis).
- [x] Gestion robuste des erreurs API (ne pas bloquer le tunnel si VIES est down).
- [x] Test E2E validant la création d'une réservation complète.

---

## 🟡 Sprint 2 : MVP Logistique & Admin (Prioritaire)

### US-10 : Admin - Gestion Identité Formateurs
**Référence Bible :** Section 3.4 (Panneau Administrateur > Gestion des Formateurs)
**En tant que** Administrateur,
**Je veux** créer et gérer les comptes des formateurs (Identité),
**Afin de** leur donner accès à la plateforme.

*Critères d'Acceptation (AC) :*
- [x] Liste paginée des formateurs avec filtrage.
- [x] Création d'un formateur : Nom, Prénom, Email.
- [x] Validation : Email unique requis.
- [x] Édition des informations de base.

### US-11 : Admin - Gestion Zones Formateurs
**Référence Bible :** Section 2.2 (Algorithme de Territorialité) & 3.4
**En tant que** Administrateur,
**Je veux** définir les zones géographiques d'intervention d'un formateur,
**Afin que** le moteur de dispatch puisse les proposer correctement.

*Critères d'Acceptation (AC) :*
- [x] Interface d'assignation des provinces par formateur.
- [x] Distinction explicite : Zone de Prédilection (Court) vs Zone d'Expertise (Long).
- [x] Règle métier : Une zone de prédilection est automatiquement incluse comme zone d'expertise (Héritage).

### US-12 : Admin - Vue Master Calendar
**Référence Bible :** Section 3.4 (Master Calendar)
**En tant que** Administrateur,
**Je veux** visualiser l'ensemble des sessions confirmées sur un calendrier global,
**Afin de** piloter l'activité de l'équipe.

*Critères d'Acceptation (AC) :*
- [x] Vue Calendrier (Mois/Semaine) agrégée.
- [x] Affichage des sessions avec code couleur (Confirmé, En attente, Terminé).
- [x] Détail au clic : Client, Formateur, Lieu.

### US-12.5 : Auth - Sécurisation & Sessions
**Référence Bible :** Section 3 (Architecture & Parcours Utilisateurs)
**En tant que** Utilisateur (Admin, Formateur, Client),
**Je veux** me connecter de manière sécurisée et accéder uniquement aux sections dédiées à mon rôle,
**Afin de** protéger les données sensibles (RGPD).

*Critères Business (AC) :*
- [x] **Page de Connexion** : Interface unique `/login` demandant Email + Mot de passe.
- [x] **Redirection Intelligente** :
    - Role `ADMIN` -> `/admin` (Master Calendar)
    - Role `TRAINER` -> `/trainer`
    - Role `CLIENT` -> `/dashboard` (Espace Client)
- [x] **Protection des Routes** : Tentative d'accès direct sans session -> Redirection vers `/login`.
- [x] **Déconnexion** : Bouton accessible partout détruisant la session.

*Critères Qualité & Technique :*
- [x] **Backend** : Création du `AuthModule` (NestJS) avec stratégie Passport-JWT.
- [x] **Sécurité** : Stockage du Token JWT dans un Cookie `HttpOnly` (Secure/SameSite).
- [x] **Middleware** : Implémentation Next.js Middleware pour le contrôle d'accès (RBAC) côté serveur.
- [x] **Ségrégation** : Un client ne peut pas accéder aux routes `/admin` ou `/trainer`, et vice-versa.

### US-13 : Formateur - Dashboard & Missions
**Référence Bible :** Section 3.3 (Espace Formateur > Mes Missions)
**En tant que** Formateur,
**Je veux** consulter la liste de mes missions et leurs détails,
**Afin de** m'organiser.

*Critères d'Acceptation (AC) :*
- [x] Liste chronologique des sessions à venir.
- [x] Page de détail par session.
- [x] Affichage des infos logistiques : Adresse (Lien GPS), Matériel requis, Participants.

### US-14 : Formateur - Gestion Profil
**Référence Bible :** Section 3.3 (Espace Formateur > Mon Profil)
**En tant que** Formateur,
**Je veux** modifier mes informations de présentation,
**Afin de** maintenir mon profil à jour.

*Critères d'Acceptation (AC) :*
- [x] Formulaire d'édition de la Bio.
- [x] Upload de la Photo de profil.

### US-15 : Formateur - Upload Preuve
**Référence Bible :** Section 3.3 (Centre Documentaire)
**En tant que** Formateur,
**Je veux** téléverser la liste de présence signée après une session,
**Afin de** prouver la prestation et déclencher la facturation.

*Critères d'Acceptation (AC) :*
- [x] Zone d'upload (Drag & Drop) sur la fiche session terminée.
- [x] Stockage sécurisé du fichier.
- [x] Mise à jour du statut de la session ("Preuve Reçue").

---

## 🔴 Sprint 3 : Automations & Finalisation (Post-MVP)

### US-16 : Tech - Infrastructure Notifications
**Référence Bible :** Section 4 (Moteur d'Automatisations)
**En tant que** Développeur,
**Je veux** mettre en place l'architecture technique des tâches planifiées,
**Afin de** supporter le moteur de notifications.

*Critères Techniques :*
- [x] Installation et configuration de NestJS Schedule (Cron) ou Bull (Queues).
- [x] Création de l'entité `NotificationLog` pour l'historique.
- [x] Service générique d'envoi d'email.

### US-17 : Notifs - Cycle Logistique (Relances)
**Référence Bible :** Section 4.1 (Matrice des Notifications)
**En tant que** Système,
**Je veux** relancer automatiquement le client pour obtenir les informations manquantes,
**Afin de** garantir la bonne tenue de la formation.

*Critères d'Acceptation (AC) :*
- [x] Cron T+48h : Relance si Logistique vide.
- [x] Cron J-15 : Alerte si Participants vides.
- [x] Cron J-9 : Alerte Critique si Participants vides.

### US-18 : Notifs - Cycle Préparation (J-30/J-7)
**Référence Bible :** Section 4.1 (Matrice des Notifications)
**En tant que** Système,
**Je veux** envoyer les documents et instructions aux moments clés,
**Afin de** préparer les parties prenantes.

*Critères d'Acceptation (AC) :*
- [x] Cron J-30 (Client) : Envoi PDF Programme.
- [x] Cron J-21 (Formateur) : Rappel Mission avec détails.
- [x] Cron J-7 (Formateur) : Envoi Pack Documentaire (Liste Présence PDF) + Verrouillage modification Client.

### US-19 : Notifs - Cycle Clôture (J+1)
**Référence Bible :** Section 4.1 (Matrice des Notifications)
**En tant que** Système,
**Je veux** relancer le formateur après la session,
**Afin de** récupérer la preuve de prestation rapidement.

*Critères d'Acceptation (AC) :*
- [ ] Cron J+1 (Formateur) : Rappel upload preuve si non reçue.

### US-20 : Tech - Export Calendrier (iCal Out)
**Référence Bible :** Section 2.3 (Flux Sortant)
**En tant que** Formateur,
**Je veux** un lien iCal exposant mes missions Form-Act,
**Afin de** les voir dans mon agenda personnel.

*Critères d'Acceptation (AC) :*
- [ ] Endpoint public sécurisé (Token) générant un flux .ics.
- [ ] Inclusion des détails (Lieu, Heure) dans les événements.

### US-21 : Tech - Import Calendrier (iCal In)
**Référence Bible :** Section 2.3 (Flux Entrant)
**En tant que** Système,
**Je veux** lire l'agenda personnel du formateur,
**Afin de** ne pas lui proposer de missions sur ses créneaux occupés.

*Critères d'Acceptation (AC) :*
- [ ] Champ URL iCal dans le profil Formateur.
- [ ] Tâche planifiée de synchronisation (lecture et création de "blocages").

### US-22 : Admin - Préparation Facturation
**Référence Bible :** Section 5.1 & 5.2
**En tant que** Administrateur,
**Je veux** visualiser les sessions prêtes à être facturées avec le prix calculé,
**Afin de** préparer l'encodage comptable.

*Critères d'Acceptation (AC) :*
- [ ] Liste des sessions terminées avec preuve validée.
- [ ] Calcul automatique du prix final : Base + Distance (Matrix) + Ajustement.
- [ ] Vue synthétique des données de facturation (TVA, Adresse).

### US-23 : Admin - Clôture Facturation
**Référence Bible :** Section 5.2 (Odoo Prep)
**En tant que** Administrateur,
**Je veux** marquer une session comme "Facturée",
**Afin de** notifier le client et archiver le dossier.

*Critères d'Acceptation (AC) :*
- [ ] Action "Marquer comme Facturé".
- [ ] Envoi email notification client.
- [ ] Archivage de la session (Lecture seule).

### US-24 : Auth - Réinitialisation Mot de Passe
**Référence Bible :** Section 3.1 (Interface Publique)
**En tant que** Utilisateur,
**Je veux** pouvoir définir un nouveau mot de passe si j'ai oublié l'ancien,
**Afin de** récupérer l'accès à mon compte.

*Critères d'Acceptation (AC) :*
- [ ] Flux "Mot de passe oublié" (Email avec lien/token).
- [ ] Page de définition du nouveau mot de passe.
