# 📋 Backlog Produit & Suivi Technique - Form-Act

## 🛑 1. Bugs Prioritaires (À corriger)

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

---

## 🏗️ 2. Roadmap : Optimisations & Evolutions (En cours)

### US-06 : Admin - Textes Légaux (Finalisation)
**En tant que** Administrateur,
**Je veux** pouvoir éditer les pages de textes légaux,
**Afin de** respecter les obligations juridiques.
- [ ] Textes Légaux : Mentions Légales, CGV, Confidentialité (Gestion des pages dédiées via CMS).

### US-10 : Téléchargement Liste Participants (Admin/Formateur)
**Référence :** Demande Client
**En tant que** Formateur ou Administrateur,
**Je veux** télécharger la liste des participants formattée (Liste d'émargement),
**Afin de** la faire signer le jour J ou d'en disposer pour gestion.
*Critères d'Acceptation (AC) :*
- [x] Bouton "Télécharger Liste Émargement (PDF)" sur le détail de la mission (Espace Formateur).
- [x] Bouton "Télécharger Liste" sur la fiche session (Espace Admin).
- [x] Le PDF doit contenir : Infos Session, Liste Noms/Prénoms, Colonne Signature.
- [x] Accessible dès que la session est confirmée.

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

## 🧊 3. Frigo / V2 (Post-MVP)
- [ ] **US-09 : Formateur - Agenda & Synchronisation (iCal In)** : Import d'agenda Google/Outlook.
- [ ] **US-35 : Formateur - Reporting & Honoraires** : Vue gains mensuels estimatifs.
- [ ] **US-38 : Conformité RGPD** : Anonymisation auto après 24 mois.

---

## 🗄️ 4. Historique des Livraisons (Archives Terminé ✅)

### Flow : Request -> Offer -> Validation (Tunnel de Vente)
- [x] **US-01** : Sélection automatique du formateur intelligent.
- [x] **US-02** : Nouveau flux "Demande de formation" (Statut `PENDING_APPROVAL`).
- [x] **US-03** : Interface Admin de proposition tarifaire (Envoi d'offre).
- [x] **US-04** : Dashboard Client : Validation et acceptation de l'offre.
- [x] **US-05** : Gestion stricte des subsides FormTS (Admin only).

### Espace Admin V2 & Finance
- [x] **Bento Dashboard** : Stats interactives (Demandes, Logistique, Facturation).
- [x] **Radar Card** : Nouvelle visualisation opérationnelle des sessions.
- [x] **US-13** : Reset intelligent des filtres de recherche.
- [x] **US-14** : Bouton de relance manuelle de la logistique client.
- [x] **US-33** : Outil de préparation à la facturation (Calcul km/matériel).
- [x] **US-34** : Clôture et archivage des sessions facturées.

### CMS, Profils & Public
- [x] **US-06** : CMS complet de la Home Page (Hero, Promo, Témoignages).
- [x] **US-07** : Footer structuré avec politique de contact.
- [x] **US-08** : Page `/register` publique pour inscription spontanée.
- [x] **US-11** : Module de changement de mot de passe (Profil).

### Maintenance & Qualité
- [x] **Bug-03** : Ajout récapitulatif estimation au checkout.
- [x] **Bug-08** : Fix liaison React Hook Form sur les experts/catégories.
- [x] **Bug-09** : Corrections cosmétiques formulaires formateurs.
- [x] **Tech-01** : Migration vers Radix UI pour les modales.
