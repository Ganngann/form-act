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
- [ ] Le comportement du widget de réservation reste identique pour l'utilisateur final (Iso-fonctionnel).
- [ ] La sélection de zone, formateur et date reste fluide et réactive.

**Critères Qualité & Technique :**
- [ ] **Refactoring** : Découper `booking-widget.tsx` (actuellement > 250 lignes) en sous-composants (`ZoneSelector`, `TrainerSelector`, `CalendarView`) respectant la limite de ~150 lignes.
- [ ] **Clean Code** : Extraire la logique d'état et de fetch dans un Custom Hook `useBookingLogic`.
- [ ] **Tests Frontend** : Ajouter au moins un test (E2E Playwright ou Unit React Testing Library) couvrant le scénario nominal (Sélection Zone -> Formateur -> Date).
- [ ] **Environnement** : Nettoyer les URL API hardcodées (utiliser variable d'env).

### US-04 : Tunnel de Réservation (Checkout V1)
**En tant que** Visiteur,
**Je veux** finaliser ma réservation en créant mon compte via mon N° TVA,
**Afin de** valider ma commande.

**Critères Business (AC) :**
- [ ] Un formulaire demande le N° TVA au visiteur.
- [ ] **Auto-complétion** : Le système pré-remplit le Nom de l'entreprise et l'Adresse via API externe (VIES/BCE).
- [ ] **Mode Dégradé** : Si l'API TVA échoue ou si le client le souhaite, la saisie manuelle est possible.
- [ ] La validation du formulaire crée le compte utilisateur (Client) et enregistre la session en base de données.
- [ ] L'utilisateur est redirigé vers une page de succès/confirmation.

**Critères Qualité & Technique :**
- [ ] Utilisation de Zod pour la validation stricte des données (Format TVA BE, champs requis).
- [ ] Gestion robuste des erreurs API (ne pas bloquer le tunnel si VIES est down).
- [ ] Test E2E validant la création d'une réservation complète.

---

## 🟡 Sprint 2 : Espace Formateur & Logistique

### US-Tech-02 : Moteur de Notifications (Cron Jobs)
**Objectif :** Implémenter le "Harcèlement bienveillant" (Bible 4.1) pour automatiser la logistique.

**Critères Business (AC) :**
- [ ] Le système envoie automatiquement les emails aux échéances définies (J-30, J-7, J+1).
- [ ] Chaque envoi est tracé/historisé pour preuve.

**Critères Qualité & Technique :**
- [ ] Architecture : Utilisation de **NestJS Schedule** (Cron) ou **Bull** (Queue) pour gérer les tâches de fond.
- [ ] **Planification** :
    - [ ] Job Quotidien vérifiant les sessions à J-30 (Envoi Ressources).
    - [ ] Job Quotidien vérifiant les sessions à J-7 (Verrouillage + PDF).
    - [ ] Job Quotidien vérifiant les sessions terminées J+1 (Relance Preuve).
- [ ] **Logger** : Création d'une entité/table `NotificationLog` pour stocker les envois.

### US-Auth-01 : Gestion de Compte & Sécurité (Future)
**Objectif :** Compléter le cycle d'authentification initié en US-04.
- [ ] "Mot de passe oublié" (Envoi lien reset via Nodemailer).
- [ ] Validation de l'email (Double Opt-in, optionnel pour MVP mais recommandé).
- [ ] Gestion de session sécurisée (JWT/Cookies).

### US-Tech-03 : Synchronisation Calendrier (iCal)
**Objectif :** Gestion bi-directionnelle des agendas (Bible 2.3).
- [ ] **In (Import)** : Parser les iCal formateurs toutes les 30min pour bloquer les slots.
- [ ] **Out (Export)** : Exposer une URL `.ics` par formateur avec ses missions.

### US-05 : Dashboard Formateur
- [ ] Vue "Mes Missions".
- [ ] Accès aux détails logistiques.
- [ ] **Profil** : Édition Bio et Photo.

### US-06 : Upload Liste de Présence
- [ ] Drag & Drop fichier PDF/Image (Relié stockage S3/Disque).
- [ ] Stockage sécurisé.

---

## 🔴 Sprint 3 : Administration & Facturation

### US-07 : Vue Master Calendar (Admin)
- [ ] Vue globale ressources (FullCalendar).
- [ ] Drag & Drop modifications.

### US-08 : Odoo Prep (Pré-facturation)
- [ ] Liste sessions terminées + Preuve.
- [ ] Calculateur Prix Final (API Google Distance Matrix).

### US-09 : Gestion Formateurs (Onboarding)
- [ ] CRUD Formateurs (Création manuelle).
- [ ] Attribution Zones & Compétences.
