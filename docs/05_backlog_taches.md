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

## 🔴 Sprint 3 : Automations & Finalisation (Post-MVP) - ✅ TERMINE

- [x] **US-16** : Tech - Infrastructure Notifications
- [x] **US-17** : Notifs - Cycle Logistique (Relances)
- [x] **US-18** : Notifs - Cycle Préparation (J-30/J-7)
- [x] **US-19** : Notifs - Cycle Clôture (J+1)
- [x] **US-20** : Tech - Export Calendrier (iCal Out)

## 🟣 Sprint 4 : Feedback & UX (Refonte & Ajustements) - ✅ TERMINE

- [x] **US-21** : Page d'Accueil Publique
- [x] **US-22** : Navigation Globale
- [x] **US-23** : Catalogue Client & Recherche
- [x] **US-24** : Admin - Liste des Clients
- [x] **US-25** : UX Admin - Création Formateur (Zones)
- [x] **US-26** : UX Formateur - Dashboard & Next Mission
- [x] **US-27** : UX Admin - Dashboard (Vue d'ensemble)
- [x] **US-28** : Tech - Seed Consolidation (Données de Test)


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

### US-Data-01 : Enrichissement Modèle Formation - ✅ TERMINE
- [x] Mise à jour du modèle Prisma, migrations, DTOs et entités.

