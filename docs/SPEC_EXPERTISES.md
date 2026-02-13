# Spécifications Fonctionnelles : Gestion des Expertises

Ce document décrit les règles métier et l'implémentation requise pour la gestion des "Expertises" dans la plateforme Form-Act.

## 1. Définition Métier

Contrairement à une "Catégorie" (thématique) ou à un "Tag", une **Expertise** n'est pas une entité autonome. C'est un **statut particulier d'une Formation**.

- **Formation Standard** : Peut être dispensée par tout formateur compétent dans la zone géographique.
- **Formation Expertise** : Produit "Premium" ou technique qui ne peut être dispensé que par une liste restreinte de formateurs certifiés/autorisés.

## 2. Modèle de Données

### 2.1. Modifications requises

- **Suppression** : L'entité `Expertise` (table de référence) doit être supprimée.
- **Ajout sur `Formation`** :
  - `isExpertise` (Boolean) : Drapeau indiquant si la formation est une expertise.
  - Relation `trainers` (Many-to-Many) : Liste blanche des formateurs autorisés à dispenser cette formation spécifique.

### 2.2. Relation Formateur

Le formateur ne déclare plus "J'ai l'expertise Management". C'est la formation "Management Avancé" qui déclare "Je peux être donnée par le Formateur X".

## 3. Algorithme d'Attribution (Dispatcher)

Le cœur du système de réservation (`DispatcherService`) doit appliquer la logique suivante lors de la recherche de formateurs disponibles pour une session :

### Cas A : Formation Standard (`isExpertise = false`)

1.  **Qui ?** Tout formateur actif.
2.  **Quelle Zone ?** Le formateur doit couvrir la zone de la session via sa **Zone de Prédilection** (courte distance).
3.  _Note_ : C'est le comportement par défaut actuel.

### Cas B : Formation Expertise (`isExpertise = true`)

1.  **Qui ?** Uniquement les formateurs présents dans la liste `trainers` liée à la formation (Whitelist).
2.  **Quelle Zone ?** Le formateur doit couvrir la zone de la session via sa **Zone d'Expertise** (longue distance).
    - _Rappel_ : Une zone de prédilection est toujours incluse dans la zone d'expertise (Héritage).

## 4. Interfaces Administrateur

### 4.1. Création/Édition de Formation

L'écran de gestion d'une formation doit évoluer pour inclure :

- Une case à cocher **"Est une expertise ?"**.
- Si coché : Un sélecteur multiple (Checkboxes ou Multi-select) affichant tous les formateurs pour définir les **"Formateurs habilités"**.

### 4.2. Profil Formateur

Le profil formateur n'a plus besoin de gérer des "Tags d'expertise". Il se concentre uniquement sur la définition géographique :

- Zones de Prédilection.
- Zones d'Expertise (Rayon d'action étendu).

## 5. Migration des Données Existantes

1.  Identifier les formations actuellement liées à une "Expertise" (ancienne table).
2.  Passer leur flag `isExpertise` à `true`.
3.  Pour chaque formation, récupérer les formateurs qui avaient le même tag "Expertise".
4.  Créer les liens `Formation <-> Formateur` correspondants.
5.  Supprimer l'ancienne table `Expertise`.
