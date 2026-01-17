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
- [ ] **Retrait Filtre (Catalogue)** : Supprimer le filtre "Province" de la page `/catalogue`. Le tri principal doit être par Thème.
- [ ] **Logique State** : Le `RegionFilter` ne doit plus impacter le catalogue global mais uniquement le contexte de réservation d'une formation spécifique.
- [ ] **Dispatcher** : Préparer le service pour qu'il ne soit appelé que sur demande explicite (et non plus au chargement global).

### US-03 : Fiche Formation & Calendrier
**En tant que** Visiteur,
**Je veux** voir les détails, choisir ma province et un formateur,
**Afin de** décider quand réserver.

*Critères d'Acceptation (AC) :*
- [ ] Page `/formation/[id]` fonctionnelle.
- [ ] **Sélecteur de Province** : Intégrer le choix de la province (Step 1 du tunnel). *Design à définir : Modale ou encart "Sticky"*.
- [ ] Affichage dynamique des formateurs disponibles pour la province choisie.
- [ ] Si aucun formateur : Afficher bouton "Demande de prise en charge manuelle".
- [ ] Le calendrier affiche les disponibilités du formateur sélectionné.
- [ ] Intégration de la règle "Demi-journée" vs "Journée complète".

### US-04 : Tunnel de Réservation (Création Client)
**En tant que** Visiteur,
**Je veux** finaliser ma réservation en créant mon compte via mon N° TVA,
**Afin de** valider ma commande.

*Critères d'Acceptation (AC) :*
- [ ] Formulaire demandant le N° TVA.
- [ ] Appel API VIES/BCE pour pré-remplir (Nom, Adresse).
- [ ] **Fallback** : Permettre la saisie manuelle si l'API échoue.
- [ ] Création du User (Client) et de la Session en base de données.
- [ ] **Auth** : Implémenter "Mot de passe oublié" (Nodemailer).
- [ ] Envoi email confirmation (SMTP o2switch).

---

## 🟡 Sprint 2 : Espace Formateur & Logistique

### US-Tech-02 : Moteur de Notifications (Cron Jobs)
**Objectif :** Implémenter le "Harcèlement bienveillant" (Bible 4.1).
- [ ] **Queue System** : Mettre en place NestJS Bull ou Cron.
- [ ] **Tâches Planifiées** :
    - [ ] `J-30` (Ressources).
    - [ ] `J-7` (Verrouillage + PDF).
    - [ ] `J+1` (Relance Preuve).
- [ ] **Logger** : Historiser chaque envoi dans la DB.

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
- [ ] Drag & Drop modifications (Doit trigger les emails de changement).

### US-08 : Odoo Prep (Pré-facturation)
- [ ] Liste sessions terminées + Preuve.
- [ ] **Calculateur** : Implémenter la formule `PrixCatalogue + FraisKm + Options` (Bible 5.1).
- [ ] Utilisation API Google Distance Matrix pour le calcul des frais réels.

### US-09 : Gestion Formateurs (Onboarding)
- [ ] CRUD Formateurs (Création manuelle par Admin).
- [ ] Attribution Zones & Compétences.
