# 📋 Backlog Produit - Form-Act

Ce document centralise toutes les tâches du projet. Il a été réorganisé pour prioriser la stabilité et la conformité métier (Bible) avant l'extension fonctionnelle.

## 🚨 Sprint Actuel : Ajustements & Tunnel de Vente (Terminé ✅)

### US-01 : Sélection Automatique Formateur (UX)
**Référence :** Retour Démo 18/02
**En tant que** Admin,
**Je veux** que le système pré-remplisse le formateur s'il est le seul disponible/compétent,
**Afin de** réduire les clics inutiles (80% des cas).

*Critères d'Acceptation (AC) :*
- [x] Pré-sélection automatique dans le formulaire de création/modification si 1 seul candidat.
- [x] Possibilité de modifier manuellement.

### US-02 : Flux Demandeur - Demande de Formation
**Référence :** Retour Démo 18/02
**En tant que** Client,
**Je veux** envoyer une demande sans réservation immédiate,
**Afin de** recevoir une offre tarifaire précise avant de m'engager.

*Critères d'Acceptation (AC) :*
- [x] Remplacement bouton "Réserver" par "Envoyer une demande".
- [x] Statut initial : `PENDING_APPROVAL` (Demande en attente).
- [x] Email de confirmation de réception.

### US-03 : Admin - Proposition Tarifaire
**Référence :** Retour Démo 18/02
**En tant que** Admin,
**Je veux** définir un prix pour une demande client,
**Afin de** lui soumettre une offre.

*Critères d'Acceptation (AC) :*
- [x] Notification "Nouvelle Demande".
- [x] Interface de saisie du prix (HTVA/TTC) sur la session.
- [x] Bouton "Envoyer l'offre" -> Notification Client.
- [x] Statut : `OFFER_SENT`.

### US-04 : Client - Validation Offre
**Référence :** Retour Démo 18/02
**En tant que** Client,
**Je veux** valider l'offre reçue,
**Afin de** confirmer la session.

*Critères d'Acceptation (AC) :*
- [x] Vue "Validation Offre" avec récapitulatif prix.
- [x] Bouton "Accepter l'offre".
- [x] Passage au statut `CONFIRMED`.

### US-05 : Admin - Gestion Subsides FormTS
**Référence :** Retour Démo 18/02
**En tant que** Admin,
**Je veux** valider moi-même l'éligibilité aux subsides,
**Afin de** garder le contrôle financier.

*Critères d'Acceptation (AC) :*
- [x] Retrait case "Demander subside" côté Client.
- [x] Ajout toggle "Subside IN COMPANY accepté" côté Admin.
- [x] Affichage lecture seule pour le Client.

### US-06 : Admin - Gestion Complète du Contenu (CMS Home & Global)
**Référence :** Demande Client (Parcours du site)
**En tant que** Administrateur,
**Je veux** pouvoir éditer **l'intégralité** des textes de la page d'accueil et les configurations globales,
**Afin de** maîtriser totalement le message marketing sans toucher au code.

*Critères d'Acceptation (AC) :*
- **1. Configuration Globale (Header/Footer)**
    - [x] Identité : Nom du site, Logo, Favicon.
    - [x] Coordonnées : Email, Téléphone, Adresse (affichés dans le Footer).
    - [ ] Textes Légaux : Mentions Légales, CGV, Confidentialité (Pages dédiées).
- **2. Edition Page Accueil (Hero, Promo, Arguments, Preuve, CTA)**
    - [x] Création des formulaires d'édition pour chaque bloc.
    - [x] Persistance en base.
    - [x] Rafraîchissement immédiat côté site public.

### US-07 : Footer (Pied de Page)
**Référence :** Demande Client (Parcours du site)
**En tant que** Visiteur,
**Je veux** avoir accès aux informations légales et pratiques en bas de chaque page,
**Afin de** naviguer en toute confiance.

*Critères d'Acceptation (AC) :*
- [x] Création du composant global `Footer`.
- [x] Liens vers : "Mentions Légales", "CGV", "Politique de Confidentialité".
- [x] Coordonnées de contact (Adresse, Email).
- [x] Copyright dynamique (Année).

---

## 🐛 Nouveaux Bugs Signalés (À investiguer)

### Bug-10 : Admin - Erreur 500 lors de l'envoi d'une offre
**Symptôme :** Erreur "Internal Server Error" (500) au clic sur "Envoyer l'offre au client".
- [ ] Analyser les logs backend (Cause probable : calcul `priceTtc` ou `EmailService`).
- [ ] Corriger la gestion des types Decimal/Number dans `sendOffer`.
- [ ] Ajouter un feedback d'erreur explicite côté UI.
 
### Bug-11 : Admin - Dysfonctionnement du filtre "Demandes"
**Symptôme :** Le clic sur le bloc Bento "Demandes" (status=PENDING) n'affiche pas le bon libellé de vue et ne filtre pas correctement les sessions.
- [ ] Harmoniser le code de statut entre le frontend (`PENDING`) et le backend (`PENDING_APPROVAL`).
- [ ] Mettre à jour `SessionsListPage` pour qu'il reconnaisse le paramètre `status` dans le libellé de la vue active.
- [ ] Vérifier que les statistiques du Bento correspondent bien aux filtres appliqués.
 
### Bug-12 : Admin - Perte de la catégorie lors de l'édition d'une formation
**Symptôme :** Dans la liste des formations, la catégorie est bien affichée. Cependant, lors de l'ouverture du formulaire de modification, le champ "Catégorie" revient à "Sélectionner..." (vide).
- [ ] Vérifier le mapping du champ `categoryId` dans le `defaultValue` du formulaire `FormationForm`.
- [ ] S'assurer que la liste des catégories est chargée avant l'initialisation des valeurs du formulaire.
- [ ] Vérifier si le composant `Select` (UI) reçoit bien la valeur initiale.


### US-08 : Inscription Spontanée Client
**Référence :** Demande Client (Parcours du site)
**En tant que** Prospect Client,
**Je veux** créer mon compte sans devoir initier une demande de formation,
**Afin de** préparer mes informations de facturation et accéder à mon espace personnel.

*Critères d'Acceptation (AC) :*
- [x] Formulaire d'inscription accessible publiquement via `/register`.
- [x] Collecte des informations de base (Nom, Email, Mot de passe).
- [x] Redirection vers le Dashboard Client après inscription.

---

## 🏗️ Prochain Sprint : Optimisation & Services Additionnels

### US-10 : Téléchargement Liste Participants (Admin/Formateur)
**Référence :** Demande Client
**En tant que** Formateur ou Administrateur,
**Je veux** télécharger la liste des participants formattée (Liste d'émargement),
**Afin de** la faire signer le jour J ou d'en disposer pour gestion.

*Critères d'Acceptation (AC) :*
- [ ] Bouton "Télécharger Liste Émargement (PDF)" sur le détail de la mission (Espace Formateur).
- [ ] Bouton "Télécharger Liste" sur la fiche session (Espace Admin).
- [ ] Le PDF doit contenir : Infos Session, Liste Noms/Prénoms, Colonne Signature.
- [ ] Accessible dès que la session est confirmée.

### US-11 : Tous - Modification du Mot de Passe
**Référence :** Demande Client
**En tant que** Utilisateur (Admin, Client, Formateur),
**Je veux** modifier mon mot de passe actuel depuis mon profil,
**Afin de** sécuriser mon compte.

*Critères d'Acceptation (AC) :*
- [x] Section "Sécurité" dans le profil utilisateur.
- [x] Formulaire : Ancien mot de passe / Nouveau mot de passe / Confirmation.
- [x] Validation de complexité (Min 8 caractères).
- [x] Feedback visuel "Mot de passe mis à jour".

### US-12 : Admin - Désactivation Formateur
**Référence :** Demande Client
**En tant que** Administrateur,
**Je veux** désactiver un formateur qui ne collabore plus avec nous,
**Afin de** l'exclure des nouvelles assignations et bloquer son accès, sans perdre l'historique.

*Critères d'Acceptation (AC) :*
- [ ] Toggle "Actif / Inactif" sur la fiche formateur.
- [ ] Si Inactif : Impossible de se connecter.
- [ ] Si Inactif : Exclu des résultats de recherche pour les nouvelles sessions.
- [ ] Si Inactif : Conservé dans l'historique des sessions passées.

### US-13 : Admin - Reset Filtres Sessions
**Référence :** Demande Client
**En tant que** Administrateur,
**Je veux** un bouton pour désactiver tous les filtres actifs sur la liste des sessions,
**Afin de** visualiser l'intégralité des dossiers en un clic.

*Critères d'Acceptation (AC) :*
- [x] Bouton "Voir tout" ou "Réinitialiser" à côté de la barre de recherche/filtres.
- [x] Action : Remet tous les filtres (Recherche, Statut, Date) à zéro.
- [x] Recharge la liste complète des sessions (hors archives).

### US-14 : Admin - Relance Manuelle Logistique Client
**Référence :** Demande Client
**En tant que** Administrateur,
**Je veux** déclencher manuellement l'email de rappel logistique à un client,
**Afin de** débloquer un dossier sans attendre l'automatisme (ou en cas de non-réception).

*Critères d'Acceptation (AC) :*
- [x] Bouton "Relancer Client (Logistique)" sur la fiche session (si logistique incomplète).
- [x] Envoi immédiat de l'email type "Relance Logistique" (avec lien formulaire).
- [x] Feedback visuel "Email de relance envoyé".

### US-15 : Admin - Édition Textes Emails (CMS)
**Référence :** Demande Client
**En tant que** Administrateur,
**Je veux** modifier le contenu des emails automatiques (Offre, Validation, Relance),
**Afin de** personnaliser ma communication sans développeur.

*Critères d'Acceptation (AC) :*
- [ ] Section "Modèles d'Emails" dans l'admin.
- [ ] Liste des templates editables (Sujet + Corps).
- [ ] Support des variables dynamiques (ex: `{{client_name}}`).

### Tech-02 : UI - Standardisation Header Admin
**But :** Harmoniser les en-têtes des pages d'administration.
- [ ] Créer un composant réutilisable `AdminHeader`.
- [ ] Props : `badge`, `title`, `description`, `backButton`, `children` (actions).
- [ ] Remplacer les en-têtes "en dur" dans les pages Admin.

---

## 🏗️ Sprint Précédent : Stabilisation & Finance (Terminé ✅)

### US-33 : Admin - Préparation Facturation
**Référence Bible :** Section 5.1 (Calcul Prix) & 5.2 (Odoo Prep)
- [x] Liste des sessions terminées avec preuve validée.
- [x] Calcul automatique du prix : Base + Distance + Options.
- [x] Champ "Ajustement Admin" éditable pour figer le Prix Final.

### US-34 : Admin - Clôture Facturation
**Référence Bible :** Section 5.2 (Odoo Prep)
- [x] Action "Marquer comme Facturé".
- [x] Envoi email notification client.
- [x] Archivage de la session (Statut `INVOICED`).

### Bugs & Corrections Post-Audit
- [x] **Bug-03 : Checkout & Récapitulatif** : Ajout étape confirmation + mention "Estimation".
- [x] **Audit-UX-01 : Module Logistique Client** : Verrouillage J-7 et édition libre avant.
- [x] **Bug-08 : Admin - Sélection Formateurs** : Fix liaison React Hook Form & Controller.
- [x] **Bug-09 : UI - Champs Formateur** : Fix chevauchement icônes (Padding).
- [x] **Tech-01 : Refactorisation Dialog UI** : Migration vers Radix UI.

---

## 🧊 Frigo / V2 (Post-MVP)
- [ ] **US-09 : Formateur - Agenda & Synchronisation (iCal In)** : Import d'agenda Google/Outlook.
- [ ] **US-35 : Formateur - Reporting & Honoraires** : Vue gains mensuels estimatifs.
- [ ] **US-38 : Conformité RGPD** : Anonymisation auto après 24 mois.

---

## 🗄️ Archives (Historique)
- [x] **Diamant Refonte Admin V2** : BentoStats, RadarCard, SearchBar, ArchivesPage.
- [x] **Sprints 1 à 5** : Fondations, Auth, Catalogue, Espace Client/Formateur.
