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
