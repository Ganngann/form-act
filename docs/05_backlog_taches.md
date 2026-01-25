# 📋 Backlog Produit - Form-Act

Ce document centralise toutes les tâches du projet. Il a été réorganisé pour prioriser la stabilité et la conformité métier (Bible) avant l'extension fonctionnelle.

## 🚨 Sprint Actuel : Stabilisation & Conformité (Priorité Immédiate)
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
- [ ] Corriger `seed.ts` pour utiliser des `upsert` robustes sur les titres de formation et éviter les multiplications infinies au re-seed.

### Tech-01 : Refactorisation Dialog UI (Dette Technique)
- [ ] Le composant `apps/web/src/components/ui/dialog.tsx` est une implémentation "maison" simplifiée qui n'utilise pas les primitives complètes de `@radix-ui/react-dialog` (Portal, Overlay). Il faudrait le migrer vers l'implémentation standard shadcn/ui pour garantir une accessibilité et une gestion du focus optimales.

---

## 🚧 Sprint Suivant : Finance & Administration
*Objectif : Implémenter le flux financier (Facturation & Reporting) une fois les opérations fiabilisées.*

### US-33 : Admin - Préparation Facturation
**Référence Bible :** Section 5.1 (Calcul Prix) & 5.2 (Odoo Prep)
**En tant que** Administrateur,
**Je veux** visualiser les sessions terminées et ajuster le prix final,
**Afin de** préparer l'encodage comptable dans Odoo.

*Critères d'Acceptation (AC) :*
- [ ] Liste des sessions terminées avec preuve validée (`PROOF_RECEIVED` ou `VALIDATED`).
- [ ] Calcul automatique du prix : Base + Distance (Matrix) + Options.
- [ ] **Champ "Ajustement Admin"** éditable (Positif ou Négatif) pour figer le Prix Final (Bible 5.1).
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
- [ ] Sécurité : Helmet, CORS dynamique, Rate Limiting.
- [ ] Env : Validation stricte des variables (Joi/Zod).
- [ ] Procédure : Documentation déploiement o2switch, Persistance `uploads`.

### US-Seed-Final : Consolidation Données
- [ ] Vérifier que le seed de production contient les formations et catégories finales validées par le métier.

---

## 🧊 Frigo / V2 (Post-MVP)
*Fonctionnalités "Confort" identifiées dans la Bible mais non bloquantes pour le lancement.*

### US-37 : Tech - Import Calendrier (iCal In)
**Référence Bible :** Section 2.3
- [ ] Lecture de l'agenda personnel du formateur pour bloquer les disponibilités.

### US-38 : Conformité RGPD (Anonymisation)
**Référence Bible :** Section 6.2
- [ ] Tâche Cron quotidienne pour supprimer les données participants après 24 mois.

---

## 🗄️ Archives (Terminé)

### Sprints 1 à 5 + Corrections Post-Audit (Terminées)

*(Liste des tâches terminées conservée pour historique)*

- [x] **US-00 à US-04** (Sprint 1 : Fondations)
- [x] **US-10 à US-15** (Sprint 2 : Logistique & Admin)
- [x] **US-16 à US-20** (Sprint 3 : Automations)
- [x] **US-21 à US-28** (Sprint 4 : UX)
- [x] **US-29** : Client - Gestion Profil & Facturation
- [x] **US-30** : Admin - Gestion des Sessions
- [x] **US-31** : Booking - Demande Manuelle
- [x] **US-32** : Auth - Réinitialisation Mot de Passe
- [x] **Bug-01** : Catalogue Vide & Recherche
- [x] **Bug-02** : Liens Morts
- [x] **Bug-04** : Espace Formateur
- [x] **Bug-05** : Logique Métier & Planning
- [x] **Bug-06** : Participants & Emails (Partie Infra Notifs)
- [x] **US-Data-01** : Enrichissement Modèle
