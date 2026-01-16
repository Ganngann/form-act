# Form-Act

Bienvenue sur le projet **Form-Act**.

**Form-Act** est une plateforme de gestion dédiée à la logistique de formation. Elle vise à transformer un processus artisanal (emails, Excel) en un écosystème digital fluide, centralisant les interactions entre l'Administrateur, les Clients (Entreprises) et les Formateurs (Prestataires).

## 🚀 Vision & Objectifs

L'objectif principal est de réduire de 80% les échanges manuels et de fiabiliser la logistique des sessions de formation.

*   **Automatisation** : Relances automatiques pour la logistique (lieux, participants).
*   **Responsabilisation** : Le client saisit lui-même ses données (participants, accessibilité).
*   **Synchronisation** : Gestion intelligente des agendas formateurs (iCal bidirectionnel).
*   **Territorialité** : Algorithme d'attribution basé sur la géographie (Zones de Prédilection vs Expertise).

## 📚 Documentation

La documentation complète du projet se trouve dans le dossier `docs/` :

*   [**📖 Bible Métier**](docs/00_bible_metier.md) : Référentiel unique des règles métier, flux et rôles (RACI).
*   [**🛠 Stack Technique**](docs/01_stack_technique.md) : Choix technologiques, architecture et standards de développement (IA-Proof).
*   [**📂 Architecture Dossiers**](docs/02_architecture_dossiers.md) : Structure des fichiers et conventions de nommage.
*   [**🎨 Wireframes Fonctionnels**](docs/03_wireframes_fonctionnels.md) : Maquettes et parcours utilisateurs.
*   [**🎓 Guide Workflow**](docs/04_guide_workflow.md) : Procédures de travail.
*   [**📋 Backlog Tâches**](docs/05_backlog_taches.md) : Suivi de l'avancement du projet.
*   [**🤖 Brief IA (AGENT.md)**](AGENT.md) : Instructions spécifiques pour l'assistant IA.

## 🛠 Stack Technique

Le projet repose sur une stack moderne, robuste et typée (**Node.js + TypeScript**) pour garantir la fiabilité et faciliter la maintenance par IA.

### Backend
*   **Framework** : [NestJS](https://nestjs.com/) (Architecture modulaire)
*   **Langage** : TypeScript (Strict Mode)
*   **Base de Données** : MariaDB (MySQL) via [Prisma ORM](https://www.prisma.io/)
*   **Hébergement** : o2switch (Node.js App)

### Frontend
*   **Framework** : [Next.js](https://nextjs.org/) (App Router)
*   **Langage** : TypeScript
*   **UI** : [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/)

### Qualité & Sécurité
*   **E2E Testing** : Playwright ("No Test, No Commit")
*   **Validation** : Zod
*   **Dates** : Day.js
*   **Architecture** : Atomic Design / Action-Based

## 🚦 Installation & Démarrage

*(Cette section sera complétée au fur et à mesure de l'initialisation du code)*

1.  **Prérequis** : Node.js (LTS), MariaDB.
2.  **Installation des dépendances** :
    ```bash
    npm install
    ```
3.  **Configuration** :
    *   Dupliquer `.env.example` en `.env`.
    *   Configurer la connexion BDD (`DATABASE_URL`).
4.  **Lancement (Dev)** :
    ```bash
    npm run dev
    ```

## 📝 Licence

Tous droits réservés.