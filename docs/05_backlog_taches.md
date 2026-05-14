# 📋 Backlog Produit & Suivi Technique - Form-Act

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
- [x] Le composant accepte et affiche correctement un tableau de fil d'Ariane.
- [x] Le composant accepte et positionne correctement un badge de statut à côté du titre.
- [x] Les pages existantes utilisant `AdminHeader` (Dashboard, Clients Liste) ne sont pas cassées (rétrocompatibilité).

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
- [x] La page `/admin/clients/[id]` est un Server Component (`console.log` s'affiche dans le terminal serveur).
- [x] Aucun "Flash of Loading Content" n'est visible pour les données initiales (le HTML arrive pré-rempli).
- [x] La modification et la sauvegarde des données client fonctionnent toujours.

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
- [x] Toutes les pages citées utilisent `AdminHeader`.
- [x] L'apparence visuelle (titres, alignements) est strictement identique d'une page à l'autre.
- [x] La navigation (fil d'Ariane + bouton retour) est fonctionnelle partout.

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
- [x] Tous les tableaux de l'admin ont le même look & feel (hauteur de ligne, font-weight des headers, hover effects).
- [x] Le code est simplifié en utilisant les composants UI partagés plutôt que des classes CSS répétées.

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
    - [x] Textes Légaux : Mentions Légales, CGV, Confidentialité (Pages dédiées).
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
## 🛑 1. Bugs Prioritaires (À corriger)

### Bug-10 : Admin - Erreur 500 lors de l'envoi d'une offre
**Symptôme :** Erreur "Internal Server Error" (500) au clic sur "Envoyer l'offre au client".
- [x] Analyser les logs backend (Cause probable : calcul `priceTtc` ou `EmailService`).
- [x] Corriger la gestion des types Decimal/Number dans `sendOffer`.
- [x] Ajouter un feedback d'erreur explicite côté UI.

### Bug-11 : Admin - Dysfonctionnement du filtre "Demandes"
**Symptôme :** Le clic sur le bloc Bento "Demandes" (status=PENDING) n'affiche pas le bon libellé de vue et ne filtre pas correctement les sessions.
- [x] Harmoniser le code de statut entre le frontend (`PENDING`) et le backend (`PENDING_APPROVAL`).
- [x] Mettre à jour `SessionsListPage` pour qu'il reconnaisse le paramètre `status` dans le libellé de la vue active.
- [x] Vérifier que les statistiques du Bento correspondent bien aux filtres appliqués.

### Bug-12 : Admin - Perte de la catégorie lors de l'édition d'une formation
**Symptôme :** Dans la liste des formations, la catégorie est bien affichée. Cependant, lors de l'ouverture du formulaire de modification, le champ "Catégorie" revient à "Sélectionner..." (vide).
- [x] Vérifier le mapping du champ `categoryId` dans le `defaultValue` du formulaire `FormationForm`.
- [x] S'assurer que la liste des catégories est chargée avant l'initialisation des valeurs du formulaire.
- [x] Vérifier si le composant `Select` (UI) reçoit bien la valeur initiale.

---

## 🏗️ 2. Roadmap : Optimisations & Evolutions (En cours)

### US-06 : Admin - Textes Légaux (Finalisation)
**En tant que** Administrateur,
**Je veux** pouvoir éditer les pages de textes légaux,
**Afin de** respecter les obligations juridiques.
- [x] Textes Légaux : Mentions Légales, CGV, Confidentialité (Gestion des pages dédiées via CMS).

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
- [x] Toggle "Actif / Inactif" sur la fiche formateur.
- [ ] Si Inactif : Impossible de se connecter.
- [ ] Si Inactif : Exclu des résultats de recherche pour les nouvelles sessions.
- [x] Si Inactif : Conservé dans l'historique des sessions passées.

### US-15 : Admin - Édition Textes Emails (CMS)
**Référence :** Demande Client
**En tant que** Administrateur,
**Je veux** modifier le contenu des emails automatiques (Offre, Validation, Relance),
**Afin de** personnaliser ma communication sans développeur.
*Critères d'Acceptation (AC) :*
- [x] Section "Modèles d'Emails" dans l'admin.
- [x] Liste des templates editables (Sujet + Corps).
- [x] Support des variables dynamiques (ex: `{{client_name}}`).

### Tech-02 : UI - Standardisation Header Admin
**But :** Harmoniser les en-têtes des pages d'administration.
- [x] Créer un composant réutilisable `AdminHeader`.
- [x] Props : `badge`, `title`, `description`, `backButton`, `children` (actions).
- [x] Remplacer les en-têtes "en dur" dans les pages Admin.

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
