# 📋 Backlog Produit - Form-Act

Ce document centralise toutes les tâches du projet. Il sert de "cerveau" pour prioriser les développements avec l'IA.

## 🟢 Sprint 1 : Fondations & Tunnel de Réservation (MVP)

### US-01 : Initialisation du Projet
- [ ] **Mise en place Stack** : Initialiser Monorepo pnpm (NestJS + Next.js).
- [ ] **Setup Design System** : Configurer `globals.css` (Variables couleurs HSL), Police `Inter`, et installer composants Shadcn de base (`button`, `card`, `input`).
- [ ] **Config DB** : Configurer Prisma pour SQLite (Dev) et préparer le switch MariaDB (Prod).
- [ ] **Script "Jules-Ready"** : Créer une commande `npm run init:project` qui installe tout et génère la DB SQLite en une fois.
- [ ] **Seeding** : Créer le script `prisma/seed.ts` pour peupler la DB avec des données de test (Formateurs, Formations).
- [ ] **CI/CD** : Configurer GitHub Actions pour le Lint et les Tests.

### US-02 : Catalogue des Formations (Public)
**En tant que** Visiteur,
**Je veux** voir la liste des formations disponibles filtrée par région,
**Afin de** choisir celle qui me convient.

*Critères d'Acceptation (AC) :*
- [ ] La page `/catalogue` affiche une grille de formations.
- [ ] Un filtre "Province" permet de masquer les formations non disponibles.
- [ ] Chaque carte affiche : Titre, Durée.
- [ ] Données mockées (fausses données) utilisées pour cette étape.

### US-03 : Fiche Formation & Calendrier
**En tant que** Visiteur,
**Je veux** voir les détails d'une formation et les dates dispos,
**Afin de** décider quand réserver.

*Critères d'Acceptation (AC) :*
- [ ] Page `/formation/[id]` fonctionnelle.
- [ ] Le calendrier affiche les jours "Libres" en vert et "Occupés" en gris.
- [ ] Clic sur une date -> Sélectionne la date pour le panier.

### US-04 : Tunnel de Réservation (Création Client)
**En tant que** Visiteur,
**Je veux** finaliser ma réservation en créant mon compte via mon N° TVA,
**Afin de** valider ma commande.

*Critères d'Acceptation (AC) :*
- [ ] Formulaire demandant le N° TVA.
- [ ] Appel API VIES/BCE pour pré-remplir (Nom, Adresse).
- [ ] Création du User (Client) et de la Session en base de données.
- [ ] Envoi email confirmation (SMTP o2switch).

---

## 🟡 Sprint 2 : Espace Formateur & Logistique

### US-05 : Dashboard Formateur
- [ ] Vue "Mes Missions".
- [ ] Accès aux détails logistiques.

### US-06 : Upload Liste de Présence
- [ ] Drag & Drop fichier PDF/Image.
- [ ] Stockage sécurisé.

---

## 🔴 Sprint 3 : Administration & Facturation

### US-07 : Vue Master Calendar (Admin)
### US-08 : Odoo Prep (Pré-facturation)
