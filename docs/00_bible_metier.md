# 📖 Bible du Projet : Plateforme Form-Act

Ce document constitue le **référentiel unique, exhaustif et définitif** pour la conception et le développement de la plateforme Form-Act. Il intègre l'intégralité des informations, règles métier, flux de données et spécifications techniques définies dans les documents de travail précédents.

---

## 1. Gouvernance et Concepts Métier

### 1.1. Vision et Objectifs Stratégiques
Sous l'impulsion de l'Administrateur, la plateforme vise à transformer un processus artisanal (échanges de mails, appels, fichiers Excel) en un écosystème digital fluide.
*   **Automatisation** : Réduire de 80% les échanges mails manuels pour la logistique.
*   **Responsabilisation** : Transférer la saisie des données logistiques et des participants au client final (le client devient acteur).
*   **Fiabilité** : Éliminer les erreurs de planning et les oublis de facturation.
*   **Flexibilité** : Permettre à l'Admin (L'Administrateur) d'intervenir manuellement sur chaque étape critique.
*   **Centralisation** : Créer un point de contact unique pour les clients et les formateurs.

### 1.2. Matrice des Droits et Responsabilités (RACI)

| Fonctionnalité | Client (Entreprise) | Formateur (Prestataire) | Admin (L'Administrateur) |
| :--- | :---: | :---: | :---: |
| **Consulter le catalogue** | ✅ | ✅ | ✅ |
| **Réserver une session** | **D** (Demandeur) | ❌ | **V** (Validateur de l'offre) |
| **Éditer infos facturation** | **R** (Édition libre) | ❌ | **I** (Consultation) |
| **Gérer disponibilités** | ❌ | **R** (iCal/Manuel) | **I** (Supervision) |
| **Modifier prix session** | ❌ | ❌ | **R** (Responsable) |
| **Remplir formulaire logistique** | **R** (Obligatoire) | **I** (Consultation) | **A** (Modification) |
| **Encoder participants** | **R** (Obligatoire) | ❌ | **A** (Modification) |
| **Télécharger liste présence vierge** | ❌ | ✅ | ✅ |
| **Uploader liste présence signée** | ❌ | **R** (Obligatoire) | **A** (Validation) |
| **Marquer comme "Facturé"** | **I** (Notification) | ❌ | **R** (Responsable) |
| **Annuler une session** | ❌ (via contact) | ❌ (via contact) | ✅ |

*(R : Responsable de l'action | A : Autorité de forçage | I : Informé)*

---

## 2. Moteur de Réservation & Intelligence d'Agenda

### 2.1. Typologie des Formations & Formats
Chaque formation du catalogue possède deux attributs majeurs qui dictent le comportement de l'algorithme :

#### A. L'Attribut de Durée
*   **Format "Demi-journée" (AM ou PM)** :
    *   Durée standard : 3h à 4h.
    *   Créneaux types : 08h30-12h30 ou 13h30-17h30.
    *   **Règle** : Ce format autorise le *même* client à réserver les deux plages (AM et PM) du *même* formateur le *même* jour (ex: deux groupes différents).
*   **Format "6 heures" (Journée complète)** :
    *   Créneau type : 09h00-16h00.
    *   **Règle** : Bloque informatiquement l'intégralité de la journée (AM + PM). Aucune autre prestation ne peut être intercalée.

#### B. L'Attribut d'Attribution Métier
*   **Standards (S)** : Formations "génériques" (ex: Bureautique).
    *   **Règle** : Le système propose les formateurs rattachés à la **Zone de Prédilection** (trajet court).
*   **Expertise (E)** : Formations "spécifiques" nécessitant une certification.
    *   **Règle** : Le lien est nominatif (Formation ID -> Formateur ID). Si un expert est requis, ses contraintes de zone sont celles de la **Zone d'Expertise** (trajet long accepté).

### 2.2. Algorithme de Territorialité (Double Système de Zones)
Le système gère la visibilité des formateurs via une matrice de régions (Provinces belges + Bruxelles) :
1.  **Zone de Prédilection (Rayon Court)** : Zones où le formateur accepte d'aller quotidiennement pour des formations standards. Objectif : Rentabilité et confort.
2.  **Zone d'Expertise (Rayon Étendu)** : Zones où le formateur accepte d'aller uniquement pour ses spécialités.
3.  **Logique d'héritage** : Toute zone "Prédilection" est incluse d'office dans "Expertise".
4.  **Auto-Sélection (UX)** : Si, pour une session donnée, un *seul* formateur est disponible et compétent dans la zone, il est **pré-sélectionné automatiquement** pour éviter un clic inutile (80% des cas). Le client peut le modifier si d'autres options existent.

### 2.3. Catégorisation des Formations (Thèmes)
Pour faciliter la recherche dans le catalogue public, les formations sont regroupées par **Catégories** (ex: Bureautique, Management, Soft Skills).
*   Cette notion de Catégorie (Thème) est distincte de la notion technique "Expertise vs Standard" (Niveau).
*   Le filtre principal du catalogue repose sur ces Catégories.
4.  **Gestion du "Désert" Géographique** : Si une demande client tombe dans une zone non couverte par les experts disponibles :
    *   Le système ne bloque pas.
    *   Il propose un bouton **"Demander une prise en charge personnalisée"**.
    *   Cela crée une **Session "Non Attribuée"** dans le dashboard Admin.
    *   Le client reçoit une notification : "Votre demande est bien enregistrée, nous recherchons le meilleur expert pour votre zone. Vous serez recontacté sous 24h."
    *   L'Admin devra utiliser la fonction de **Forçage** pour assigner un formateur (qui pourra être hors zone).

### 2.3. Disponibilité & Synchronisation
*   **Exclusivité Quotidienne (Verrouillage Inter-Clients)** : Un formateur réservé par le Client A est **invisible** pour le Client B sur toute la journée J. Cela protège contre les retards et temps de trajet.
*   **Synchronisation iCal (Bidirectionnelle)** :
    *   **Flux Entrant (In)** : La plateforme lit les agendas perso (Google/Outlook) toutes les 15-30 min. Tout événement "Occupé" bloque la réservation.
    *   **Flux Sortant (Out)** : La plateforme génère un flux .ics pour le formateur. Chaque mission s'ajoute à son agenda avec les détails logistiques en description.

---

## 3. Architecture & Parcours Utilisateurs

### 3.1. Interface Publique (Frontend)
*   **Accueil** : Moteur de recherche (Thème uniquement) + Lien "Accès / Inscription Client".
*   **Catalogue** : Grille des formations triées par Thème.
*   **Inscription Spontanée** : Formulaire dédié permettant de créer un compte client sans passer commande immédiatement.
*   **Tunnel de Réservation (Fil d'Ariane)** :
    1.  **Formation** : Sélection dans le catalogue.
    2.  **Localisation** : Choix de la Province (Indispensable pour filtrer les formateurs et calcul frais).
    3.  **Intervenant** : Choix du formateur.
        *   *Auto-sélection* : Pré-rempli si candidat unique.
        *   *Cas "Aucun formateur"* : Proposition de demande manuelle.
    4.  **Date** : Calendrier temps réel.
    5.  **Identification** : Création de compte simplifiée.
        *   Récupération auto des données.
    6.  **Action** : Bouton **"Envoyer ma demande"** (Pas de réservation directe).
        *   Le statut de la session devient `PENDING_APPROVAL`.
        *   Le client reçoit un accusé de réception : "Nous préparons votre offre".

### 3.1.Bis Workflow de Validation (Nouveau Flux)
Une fois la demande envoyée, le processus se déplace dans l'Espace Client :
1.  **Proposition Admin** : L'Admin reçoit la demande, vérifie la faisabilité et encode le **Prix Final** (Offre).
2.  **Notification Client** : Le client reçoit un email "Votre offre pour [Formation] est disponible".
3.  **Validation Client** : Sur son dashboard, le client clique sur **"Accepter l'offre"**.
    *   Le statut passe à `CONFIRMED`.
    *   La session est définitivement bloquée dans l'agenda du formateur.

### 3.2. Espace Client (Tableau de Bord)
*   **Dashboard** : Timeline des sessions (À venir, En attente d'infos, Terminée). Notifications urgentes.
*   **Profil Facturation** : Interface autonome pour modifier N° TVA, Adresse, Email comptable. Historisation des changements.
*   **Fiche Session (Module Logistique)** : Formulaire interactif pour saisir le Lieu, le Matériel et les Participants.

### 3.3. Espace Formateur (Bureau Mobile)
*   **Agenda** : Vue calendrier, saisie des congés/jours off.
*   **Mes Missions** : Liste des prestations. Détail avec adresse cliquable (GPS) et pack logistique.
*   **Centre Documentaire** : Zone d'upload (Drag & Drop) pour la liste de présence signée (Preuve de prestation).
*   **Reporting** : Estimation des honoraires du mois.
*   **Mon Profil** : Édition autonome de la Bio et de la Photo.

### 3.4. Panneau Administrateur (L'Administrateur)
*   **Gestion des Formateurs (Onboarding & Offboarding)** : Création manuelle des comptes. Activation/Désactivation des accès (Soft Delete pour conserver l'historique). Configuration Zones/Compétences.
*   **Master Calendar** : Vue globale de l'occupation de toute l'équipe.
*   **Gestion Catalogue** : Création formations, liaisons Experts/Zones.
*   **Gestion du "Forçage"** :
    *   Assigner un formateur marqué "Indisponible".
    *   Assigner un formateur hors de sa zone.
    *   Modifier lieu/participants après le verrouillage J-7.
*   **Odoo Prep** : File d'attente des sessions terminées prêtes à facturer.
*   **Paramètres Généraux (CMS)** : Interface de gestion de l'identité du site (Logo, Nom, Textes d'accueil, Mentions légales).

---

## 4. Moteur d'Automatisations & Matrice de Communication

Le système applique une logique de "Harcèlement bienveillant" pour garantir la complétion des dossiers sans intervention humaine.

### 4.1. Matrice des Notifications (Workflow)

| Temps | Déclencheur | Destinataire | Objet / Action |
| **Temps** | Déclencheur | Destinataire | Objet / Action |
| :--- | :--- | :--- | :--- |
| **H0** | Demande Client | Admin | **Nouvelle Demande**. "Session à chiffrer pour X". |
| **H+X** | Offre Admin | Client | **Offre Disponible**. "Validez votre formation pour confirmer". |
| **T0** | Validation Client | Tous | **Confirmation**. Récapitulatif + Invitation Calendrier. |
| **T+48h** | Logistique vide | Client | **Relance Logistique**. Lien vers formulaire Lieu/Matériel. |
| **J-30** | Date | Client | **Envoi Descriptif**. PDF du programme détaillé pour affichage interne. |
| **J-21** | Date | Formateur | **Rappel Mission**. Récapitulatif : Lieu, accès, matériel prévu. |
| **J-15** | Participants vides | Client | **Alerte Participants**. Rappel encodage noms (Critique pour J-7). |
| **J-9** | Participants vides | Client | **Alerte Critique**. "Sans réponse sous 48h, une liste vierge sera envoyée". |
| **J-7** | Date | Formateur | **Pack Documentaire**. Envoi de la liste de présence générée (PDF) à imprimer. **Verrouillage des données**. |
| **J+1** | Preuve manquante | Formateur | **Rappel Clôture**. Demande d'upload de la liste signée (Rappel quotidien). |
| **Fin** | Clic "Facturé" | Client | **Notification Facture**. "Votre facture est disponible sur Odoo". |

### 4.2. Règles de Verrouillage
*   **Verrou J-7** : À 7 jours de la prestation, le client ne peut plus modifier le Lieu ni les Participants. Cela garantit que le PDF reçu par le formateur est à jour. Toute modification tardive doit passer par L'Administrateur.

---

## 5. Gestion Financière & Aide à la Facturation

### 5.1. Algorithme de Calcul du Prix Final
Le prix n'est figé qu'au moment de la facturation.
$$Prix_{Final} = (Prix_{Catalogue} \pm Ajustement_{Admin}) + Frais_{Déplacement} + Options$$

*   **Prix Catalogue** : Base définie dans la fiche formation.
*   **Ajustement Admin** : Champ libre pour L'Administrateur (Remise commerciale, Majoration location salle, Tarif ASBL).
*   **Frais de Déplacement** : Calculé selon règle globale (Km via API Google Maps ou Forfait Zone).
*   **Options** : Matériel payant, supports imprimés, etc.

### 5.2. Interface "Odoo Prep"
Assistant de saisie pour Odoo (pas d'API directe).
*   **Critères d'entrée** : Date passée + Liste de présence uploadée.
*   **Vue par dossier** :
    *   **Identité** : Nom Entreprise + N° TVA (Vérifié).
    *   **Facturation** : Adresse de facturation à jour.
    *   **Communication** : Texte généré (ex: "Formation [Nom] - [Date] - [Formateur]").
    *   **Finances** : Montant HTVA ventilé.
*   **Action "Marquer comme Facturé"** :
    *   Archive la session.
    *   Envoie la notification au client.
    *   Passe la session en lecture seule (Archive immuable).

---

## 6. Spécifications Techniques, Données & Sécurité

### 6.1. Dictionnaire des Données Logistiques (Le Formulaire Client)
Ce formulaire est dynamique et s'adapte au type de formation.

| Champ | Type | Obligatoire | Impact |
| :--- | :--- | :---: | :--- |
| **Adresse Prestation** | Texte / Google Maps | Oui | Base du calcul des frais de déplacement. |
| **Matériel Vidéo** | Checkbox | Oui | Projecteur / Écran TV / Besoin apport formateur. |
| **Matériel Écrit** | Checkbox | Oui | Flipchart / Marqueurs / Tableau blanc. |
| **Connexion Wi-Fi** | Radio | Oui | Accès invité requis ? |
| **Logistique Accès** | Texte | Non | Étage, ascenseur, code porte, parking réservé. |
| **Participants** | Liste Objets | Oui | [Prénom, Nom, Email]. |

*Note : La gestion des subsides FormTS n'est plus demandée au client. C'est un champ **Admin-Only** ("Subside IN COMPANY accepté") visible en lecture seule sur le récapitulatif.*

### 6.2. Sécurité & RGPD
*   **Données Participants** : Sensibles. Accessibles uniquement par le formateur assigné et l'Admin. Anonymisation automatique (suppression noms/emails) après **24 mois** (Délai légal audit FormTS).
*   **Données Formateurs** : L'adresse personnelle (domicile) n'est jamais affichée au client. Seule la distance km est visible.
*   **Sauvegardes** : Backup quotidien de la base de données.
*   **SSL** : Obligatoire pour toutes les transactions.

### 6.3. Infrastructure Technique
*   **Emails** : Utilisation du service SMTP de l'hébergeur (o2switch) pour la phase de lancement.
*   **Cartographie** : API Google Maps (Places & Distance Matrix) pour la précision des adresses et des frais.
