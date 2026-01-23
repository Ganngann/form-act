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


## ⚪ Sprint 5 : Opérations & Fiabilisation (Le Système "Gérable") - ✅ TERMINE

### US-29 : Client - Gestion Profil & Facturation
**Référence Bible :** Section 3.2 (Espace Client) & 5.2
**En tant que** Client,
**Je veux** modifier mes informations de facturation (TVA, Adresse, Email Compta),
**Afin de** garantir que les factures émises seront correctes.

*Critères d'Acceptation (AC) :*
- [x] Page "Mon Profil" dans l'espace client.
- [x] Modification Nom Entreprise / TVA (avec re-validation VIES/Format si possible).
- [x] Modification Adresse Siège et Email Compta.
- [x] Historique des modifications (Audit simple : "Modifié le X par Y").

### US-30 : Admin - Gestion des Sessions (Forçage)
**Référence Bible :** Section 3.4 (Forçage) & 1.2 (RACI)
**En tant que** Administrateur,
**Je veux** pouvoir intervenir sur n'importe quelle session (modifier formateur, déverrouiller logistique, annuler),
**Afin de** gérer les imprévus et les erreurs clients.

*Critères d'Acceptation (AC) :*
- [x] Vue "Liste des Sessions" (Filtres: Date, Statut, Client).
- [x] Vue "Détail Session" pour l'Admin.
- [x] Action "Changer Formateur" : Permet de sélectionner un autre formateur (ignore les règles de zones).
- [x] Action "Déverrouiller Logistique" : Permet au client de modifier les infos après J-7.
- [x] Action "Annuler Session" : Change statut + Email notification + Libère le créneau.

### US-31 : Booking - Demande Manuelle (Gestion "Désert")
**Référence Bible :** Section 2.3 (Gestion du Désert)
**En tant que** Prospect (Client),
**Je veux** demander une prise en charge personnalisée si aucun formateur n'est trouvé dans ma zone,
**Afin de** ne pas être bloqué et de recevoir une offre sur mesure.

*Critères d'Acceptation (AC) :*
- [x] Bouton "Demander une prise en charge" visible quand le résultat de recherche est vide.
- [x] Création d'une session avec statut spécial (ex: `PENDING_ASSIGNMENT`).
- [x] Notification Email Admin ("Nouvelle demande hors zone à traiter").
- [x] Notification Email Client ("Demande reçue, réponse sous 24h").

### US-32 : Auth - Réinitialisation Mot de Passe
**Référence Bible :** Section 3.1 (Interface Publique)
**En tant que** Utilisateur,
**Je veux** pouvoir définir un nouveau mot de passe si j'ai oublié l'ancien,
**Afin de** récupérer l'accès à mon compte.

*Critères d'Acceptation (AC) :*
- [x] Flux "Mot de passe oublié" (Email avec lien/token).
- [x] Page de définition du nouveau mot de passe.

## 🟠 Sprint 6 : Finance & Reporting (L'Argent) - 🏗️ EN COURS

### US-33 : Admin - Préparation Facturation
**Référence Bible :** Section 5.1 & 5.2
**En tant que** Administrateur,
**Je veux** visualiser les sessions prêtes à être facturées avec le prix calculé,
**Afin de** préparer l'encodage comptable.

*Critères d'Acceptation (AC) :*
- [ ] Liste des sessions terminées avec preuve validée (Statut `PROOF_RECEIVED` ou `VALIDATED`).
- [ ] Calcul automatique du prix final : Base + Distance (Matrix) + Ajustement.
- [ ] Vue synthétique des données de facturation (TVA, Adresse).

### US-34 : Admin - Clôture Facturation
**Référence Bible :** Section 5.2 (Odoo Prep)
**En tant que** Administrateur,
**Je veux** marquer une session comme "Facturée",
**Afin de** notifier le client et archiver le dossier.

*Critères d'Acceptation (AC) :*
- [ ] Action "Marquer comme Facturé".
- [ ] Envoi email notification client.
- [ ] Archivage de la session (Lecture seule / Statut `INVOICED`).

### US-35 : Formateur - Reporting & Honoraires
**Référence Wireframe :** 2.3 Reporting & Honoraires
**En tant que** Formateur,
**Je veux** visualiser le récapitulatif de mes missions effectuées et l'estimation de mes gains,
**Afin de** suivre mon activité mensuelle.

*Critères d'Acceptation (AC) :*
- [ ] Page "Reporting" dans l'espace formateur.
- [ ] Sélecteur de Mois.
- [ ] KPIs : Nombre missions, Total Km, Total Honoraires (Estimé).
- [ ] Liste des missions du mois avec détail montant.

## 🔴 Corrections Post-Audit (Janvier 2026) - 🚨 PRIORITAIRE

### Bug-01 : Catalogue Vide & Recherche - ✅ TERMINE
**Symptôme :** Certaines catégories (ex: Développement) affichent "Aucune formation" malgré la présence de données en base. La recherche par mot-clé est absente.
- [x] Debugger le filtrage par `categoryId` dans `CatalogueContent.tsx`.
- [x] Implémenter la barre de recherche textuelle (Bible 3.1).
- [x] Nettoyer les doublons dans le seed (Management 101).

### Bug-02 : Liens Morts & Navigation (404)
**Symptôme :** Plusieurs liens critiques mènent vers des pages 404.
- [ ] `/register` : Créer la page d'inscription simplifiée (Bible 3.1) ou rediriger vers le checkout.
- [ ] `/profile` (Admin) : Rediriger l'admin vers `/admin/profile` ou créer la page.
- [ ] Bouton "Devenir Client" : Pointe vers `/register` (mort).

### Bug-03 : Checkout & Paiement
**Symptôme :** Le tunnel de réservation s'arrête après la sélection de date, sans étape de paiement.
- [ ] Ajouter l'étape de paiement (Stripe/Simulation) (Bible 3.1).
- [ ] Ajouter le récapitulatif avec calcul du prix HT/TTC.

### Bug-04 : Espace Formateur - Profil & Missions
**Symptôme :** Gaps avec la Bible Section 3.3.
- [ ] Ajouter les "Spécialités" (tags) et le "Tarif Journalier" dans le profil formateur.
- [ ] Ajouter le bouton d'upload pour le "Support de formation finalisé".
- [ ] Stabiliser l'appel `/auth/me` qui fetch fail parfois au premier chargement.

### Bug-05 : Logique Métier & Planning (Contraintes)
**Symptôme :** Le système permet de réserver une session même si le formateur sélectionné est déjà occupé.
- [ ] Ajouter une validation dans `processCheckout` : un formateur ne peut pas avoir deux sessions sur le même créneau (Date + Slot).
- [ ] Note : Un client **peut** réserver plusieurs formations simultanément (pour différents groupes/collaborateurs).
- [ ] Empêcher l'auto-assignation ou le forçage admin vers un formateur déjà occupé.

### Bug-06 : Participants & Emails
**Symptôme :** Les sessions créées via checkout n'ont pas de participants par défaut, et aucun email de confirmation n'est envoyé.
- [ ] Ajouter par défaut l'email du contact client à la liste des participants.
- [ ] Déclencher l'infrastructure de notification (US-16) lors d'un booking réussi.

### Bug-07 : Amélioration Seed
- [ ] Corriger `seed.ts` pour utiliser des `upsert` robustes sur les titres de formation et éviter les multiplications infinies au re-seed.

### Audit-UX-01 : Module Logistique Client
- [ ] S'assurer que le client peut éditer le lieu/participants/matériel tant que ce n'est pas verrouillé (J-7).
- [ ] Ajouter un champ "Participants" (liste email/nom) dans le tunnel de checkout ou l'espace client.

## 🔵 Sprint 7 : Infrastructure & Mise en Prod

### US-36 : Mise en Production (Production Ready)
**Contexte :** Le projet doit être déployé sur un hébergement o2switch (Node.js) et supporter une charge d'environ 120 sessions/an. L'objectif est de sécuriser l'application et de garantir sa stabilité en production.

**En tant que** DevOps / Développeur,
**Je veux** configurer l'application pour un environnement de production sécurisé et robuste,
**Afin de** prévenir les failles de sécurité et assurer le bon fonctionnement sur l'infrastructure cible.

*Critères d'Acceptation (AC) :*

1.  **Sécurité Applicative** :
    - [ ] Mise en place de **Helmet** (En-têtes HTTP sécurisés).
    - [ ] Configuration **CORS** dynamique (via variables d'environnement).
    - [ ] Activation du **Rate Limiting** (Throttler).

2.  **Configuration & Environnement** :
    - [ ] Validation stricte des variables d'environnement (Joi/Zod).
    - [ ] Désactivation des logs de debug en production.

3.  **Procédure de Déploiement (o2switch)** :
    - [ ] Documentation déploiement cPanel/Node.js.
    - [ ] Gestion persistance dossier `uploads`.
    - [ ] Script migrations Prisma en prod.

4.  **Build & Optimisation** :
    - [ ] Optimisation build (`pnpm prune --prod`).

## ⚪ Backlog : Fonctionnalités Avancées & Post-MVP

### US-37 : Tech - Import Calendrier (iCal In)
*(Ex-US-29)*
**Référence Bible :** Section 2.3 (Flux Entrant)
**En tant que** Système,
**Je veux** lire l'agenda personnel du formateur,
**Afin de** ne pas lui proposer de missions sur ses créneaux occupés.

*Critères d'Acceptation (AC) :*
- [ ] Champ URL iCal dans le profil Formateur.
- [ ] Tâche planifiée de synchronisation.

### US-38 : Conformité RGPD (Anonymisation)
**Référence Bible :** Section 6.2
**En tant que** DPO (Data Protection Officer),
**Je veux** que les données personnelles des participants soient anonymisées automatiquement après 24 mois,
**Afin de** respecter la législation et les règles internes.

*Critères d'Acceptation (AC) :*
- [ ] Tâche Cron quotidienne.
- [ ] Suppression des noms/emails des participants pour les sessions de plus de 24 mois.

### US-Data-01 : Enrichissement Modèle Formation - ✅ TERMINE
- [x] Mise à jour du modèle Prisma, migrations, DTOs et entités.

