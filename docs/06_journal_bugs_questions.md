# 🐛 Journal des Bugs & Questions Ouvertes

Ce document centralise les points de friction, les bugs connus et les questions en attente de réponse métier.

## ❓ Questions Ouvertes (À trancher)

| ID       | Question         | Contexte                                                          | Statut        | Proposition / Piste                                  |
| :------- | :--------------- | :---------------------------------------------------------------- | :------------ | :--------------------------------------------------- |
| **Q-03** | **Design Login** | L'US-04 parle de création compte rapide vs Espace Client complet. | ⚪ À préciser | Utiliser composants Shadcn standards pour l'instant. |

## 🐞 Bugs Connus (Non résolus)

_(Aucun bug signalé pour l'instant)_

## ✅ Archivé / Résolu

| ID          | Sujet                   | Décision Prise                                                                | Date       |
| :---------- | :---------------------- | :---------------------------------------------------------------------------- | :--------- |
| **ARCH-01** | **Architecture Repo**   | Utilisation d'un **Monorepo pnpm** avec déploiement séparé (Hybride).         | 16/01/2026 |
| **ARCH-02** | **Base de Données Dev** | Utilisation de **SQLite** en local pour faciliter le setup IA (vs MariaDB).   | 16/01/2026 |
| **Q-01**    | **Conflit Ports**       | **API=4000**, **Web=3000** pour éviter EADDRINUSE en local.                   | 16/01/2026 |
| **Q-02**    | **Thème UI**            | **Light Mode** (Clair) par défaut pour un rendu professionnel.                | 16/01/2026 |
| **Tech**    | **Authentification**    | Utilisation de **JWT** (Stateless) pour faciliter la communication API/Front. | 16/01/2026 |
