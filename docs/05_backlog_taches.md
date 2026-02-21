# 📋 Backlog Produit - Form-Act

Ce document centralise toutes les tâches du projet. Il a été réorganisé pour prioriser la stabilité et la conformité métier (Bible) avant l'extension fonctionnelle.

## 🚨 Sprint Actuel : Standardisation Admin (En cours 🚧)

Ce sprint vise à corriger les inconsistances d'interface et d'architecture identifiées dans l'administration.

### US-01 : Standardisation du composant `AdminHeader`
**Objectif :** Faire évoluer le composant `AdminHeader` pour qu'il puisse remplacer tous les en-têtes "custom" actuellement dispersés dans l'application, en supportant nativement les fils d'Ariane et les badges de statut.

**Spécifications Techniques :**
1.  Modifier `apps/web/src/components/admin/AdminHeader.tsx`.
2.  Ajouter une prop optionnelle `breadcrumbs`:
    ```typescript
    interface BreadcrumbItem {
      label: string;
      href?: string; // Si absent, c'est l'élément actif (non cliquable)
    }
    breadcrumbs?: BreadcrumbItem[];
    ```
3.  Ajouter une prop optionnelle `statusBadge`:
    ```typescript
    statusBadge?: React.ReactNode; // Pour passer un <StatusBadge /> ou un <Badge />
    ```
4.  Ajouter une prop optionnelle `actions` (remplace `children` pour plus de clarté, mais garder `children` pour la rétrocompatibilité ou le déprécier) :
    ```typescript
    actions?: React.ReactNode; // Boutons d'action à droite (ex: "Modifier", "Supprimer")
    ```
5.  **Mise en page :**
    *   Si `breadcrumbs` est présent, l'afficher au-dessus du titre (style : texte petit, gris, séparateurs `/`).
    *   Si `statusBadge` est présent, l'afficher à droite du titre ou sur la même ligne selon l'espace disponible (responsive).

*Critères d'Acceptation (AC) :*
- [ ] Le composant accepte et affiche correctement un tableau de fil d'Ariane.
- [ ] Le composant accepte et positionne correctement un badge de statut à côté du titre.
- [ ] Les pages existantes utilisant `AdminHeader` (Dashboard, Clients Liste) ne sont pas cassées (rétrocompatibilité).

### US-02 : Migration de la Page Détail Client vers un Server Component
**Objectif :** Corriger l'architecture de la page `/admin/clients/[id]` qui est actuellement un Client Component chargeant ses données via `useEffect`, ce qui est inconsistant avec le reste de l'app.

**Tâches :**
1.  **Transformer la page :**
    *   Renommer `AdminClientDetailPage` en `ClientDetailPage`.
    *   Supprimer `"use client"`.
    *   Remplacer `useParams` par la prop `params`.
    *   Remplacer le `fetch` dans `useEffect` par un appel `fetch` direct dans le composant `async`.
    *   Gérer les cas d'erreur (404) avec la fonction `notFound()` de Next.js.
2.  **Extraire l'interactivité :**
    *   Créer un nouveau composant client `ClientEditForm` (dans `components/admin/clients/`).
    *   Y déplacer toute la logique de formulaire (state `formData`, `isEditing`, `handleSave`).
    *   La page Server Component passe les données initiales (`initialData`) à ce formulaire.
3.  **Gestion des Audit Logs :**
    *   Parser le JSON `auditLog` côté serveur (dans la page) et passer le tableau typé au composant d'affichage (qui peut rester un composant UI simple).

*Critères d'Acceptation (AC) :*
- [ ] La page `/admin/clients/[id]` est un Server Component (`console.log` s'affiche dans le terminal serveur).
- [ ] Aucun "Flash of Loading Content" n'est visible pour les données initiales (le HTML arrive pré-rempli).
- [ ] La modification et la sauvegarde des données client fonctionnent toujours.

### US-03 : Unification des En-têtes de Page
**Objectif :** Supprimer tout le code de header dupliqué/custom dans les pages de détail et utiliser le nouveau `AdminHeader` standardisé (dépend de US-01).

**Périmètre (Pages à modifier) :**
*   `/admin/trainers/[id]/page.tsx`
*   `/admin/trainers/[id]/edit/page.tsx`
*   `/admin/trainers/new/page.tsx`
*   `/admin/formations/[id]/page.tsx`
*   `/admin/formations/new/page.tsx`
*   `/admin/sessions/[id]/page.tsx`
*   `/admin/sessions/archives/page.tsx`
*   `/admin/settings/page.tsx`

**Tâches :**
1.  Pour chaque page, remplacer le bloc `div` contenant le titre, le bouton retour et le fil d'Ariane manuel par :
    ```tsx
    <AdminHeader
      title="..."
      breadcrumbs={[ { label: 'Admin', href: '/admin' }, { label: '...', href: '...' } ]}
      statusBadge={<StatusBadge ... />} // Si applicable
      actions={<Button>...</Button>}    // Si applicable
    />
    ```
2.  Supprimer les composants UI "jetables" ou les styles inline qui servaient à construire ces anciens headers.

*Critères d'Acceptation (AC) :*
- [ ] Toutes les pages citées utilisent `AdminHeader`.
- [ ] L'apparence visuelle (titres, alignements) est strictement identique d'une page à l'autre.
- [ ] La navigation (fil d'Ariane + bouton retour) est fonctionnelle partout.

### US-04 : Standardisation des Tableaux de Données
**Objectif :** Remplacer les implémentations hétérogènes de tableaux (tables HTML natives avec classes Tailwind custom) par les composants `shadcn/ui` (`Table`, `TableHeader`, `TableRow`, `TableCell`) pour assurer une cohérence visuelle avec la page Clients.

**Périmètre :**
*   `/admin/trainers/page.tsx` (Liste des formateurs)
*   `/components/admin/FormationsTable.tsx` (Liste des formations)
*   `/components/admin/CategoriesTable.tsx` (Liste des catégories)

**Tâches :**
1.  Importer les composants `Table` depuis `@/components/ui/table`.
2.  Remplacer les balises `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` par leurs équivalents UI.
3.  Vérifier que les espacements (padding), les alignements de texte et les couleurs de bordures correspondent exactement au standard défini dans la page `Clients`.

*Critères d'Acceptation (AC) :*
- [ ] Tous les tableaux de l'admin ont le même look & feel (hauteur de ligne, font-weight des headers, hover effects).
- [ ] Le code est simplifié en utilisant les composants UI partagés plutôt que des classes CSS répétées.

---

## 🏗️ Sprint Précédent : Ajustements & Tunnel de Vente (Terminé ✅)

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
- [ ] Section "Sécurité" dans le profil utilisateur.
- [ ] Formulaire : Ancien mot de passe / Nouveau mot de passe / Confirmation.
- [ ] Validation de complexité (Min 8 caractères).
- [ ] Feedback visuel "Mot de passe mis à jour".

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
- [ ] Bouton "Voir tout" ou "Réinitialiser" à côté de la barre de recherche/filtres.
- [ ] Action : Remet tous les filtres (Recherche, Statut, Date) à zéro.
- [ ] Recharge la liste complète des sessions (hors archives).

### US-14 : Admin - Relance Manuelle Logistique Client
**Référence :** Demande Client
**En tant que** Administrateur,
**Je veux** déclencher manuellement l'email de rappel logistique à un client,
**Afin de** débloquer un dossier sans attendre l'automatisme (ou en cas de non-réception).

*Critères d'Acceptation (AC) :*
- [ ] Bouton "Relancer Client (Logistique)" sur la fiche session (si logistique incomplète).
- [ ] Envoi immédiat de l'email type "Relance Logistique" (avec lien formulaire).
- [ ] Feedback visuel "Email de relance envoyé".

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
