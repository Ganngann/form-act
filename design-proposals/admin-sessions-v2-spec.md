# Spécifications Techniques : Page Sessions Administrateur (V2)

Ce document décrit les composants techniques et les fonctionnalités spécifiques de la page de gestion des sessions pour les administrateurs.

## 1. Zone des Indicateurs Opérationnels (Bento Stats)
*   **Emplacement** : Partie supérieure de la page.
*   **Fonctionnalité** : Filtres globaux avec **indicateur visuel actif** .
    *   **Assignations** : Sessions au statut `CONFIRMED` sans `trainerId`.
    *   **Logistique (J-14)** : Sessions au statut `CONFIRMED` programmées dans les **14 prochains jours** dont le dossier logistique est marqué comme incomplet.
    *   **Émargements** : Sessions terminées (`date < now`) sans `proofUrl`.
    *   **À Facturer** : Sessions avec `proofUrl` validé mais sans `billedAt`.

## 2. Système d'Archivage Dédié
*   **Règle de Transfert** : Dès qu'une session possède une date de facturation (`billedAt` non nul), elle disparaît du workspace "Administration" pour éviter la surcharge visuelle.
*   **Accès** : Un lien dédié **"Archives"** dans la navigation principale permet d'accéder à l'historique complet.
*   **Interface Archives** : Vue tabulaire dense optimisée pour la recherche historique (filtrage par année, numéro de facture, client).

## 3. Barre de Statut de Vue
*   **Emplacement** : Zone intermédiaire entre les statistiques et la liste des résultats.
*   **Fonctionnalité** : 
    *   **Indicateur Dynamique** : Affiche le nom du filtre actif (ex: "VUE : ASSIGNATIONS REQUISES").
    *   **Recherche Contextuelle** : Champ de saisie pour filtrage textuel (Nom formation, Client, Formateur) s'ajoutant au filtre actif.

## 4. Structure des Cartes Session (Prop 01 : Le Radar Opérationnel)
Chaque carte est divisée en zones distinctes pour maximiser la vitesse de lecture et de décision.

*   **Zone A : Indicateur d'Urgence (Le Radar)**
    *   **Emplacement** : Bloc latéral gauche coloré.
    *   **Donnée** : Affiche `J-X` (nombre de jours avant le début de la session). 
    *   **Couleur Dynamique** : S'assombrit ou s'illumine selon la proximité de la date (ex: Rouge/Flash pour `J < 3`).
*   **Zone B : Identité et Contexte**
    *   **Données** : Titre de la formation (gras), Nom du Client (secondaire), et Nom du Formateur.
    *   **État Spécifique** : Si aucun formateur n'est assigné, affiche "À ASSIGNER" en évidence, sinon afficher le nom du formateur.
*   **Zone C : Pipeline Tactique & Message d'Action**
    *   **Indicateurs** : 5 pastilles (`Steps`) : Info, Formateur, Logistique, Présence, Facture.
    *   **Message Contextuel** : Juste au-dessus ou à côté du pipeline, un texte explicite indique le point de blocage ou la prochaine action (ex: "⚠️ LOGISTIQUE À FINALISER").
*   **Zone D : Synthèse Financière**
    *   **Données** : Montant Total HT.
    *   **Fonction** : Permet de prioriser les dossiers à haute valeur ajoutée.
*   **Zone E : Commande de Gestion**
    *   **Action** : Lien "GÉRER →" vers le détail du dossier.

## 5. États Visuels des Étapes (Pipeline Steps)
Les 5 étapes du pipeline adoptent des états colorimétriques stricts :
*   **Gris (`Default`)** : Étape non entamée.
*   **Orange (`Active`/`Alert`)** : Étape en cours ou bloquante (ex: J-14 atteint sans logistique complète).
*   **Vert (`Done`)** : Étape validée et finalisée.

