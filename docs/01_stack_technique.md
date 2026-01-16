# 🛠 Choix Technologiques & Stratégie de Développement - Form-Act

Ce document définit la stack technique et, surtout, les **règles de développement strictes** pour garantir la stabilité du projet dans un contexte de développement assisté par IA (Google Jules / Agents).

---

## 1. Stack Technique "IA-Proof" (Sécurité & Robustesse)

Le choix de **Node.js + TypeScript** est validé pour son typage fort qui agit comme un garde-fou contre les erreurs de l'IA.

### 1.1. Backend (API & Logique)
*   **Langage** : **TypeScript** (Strict Mode activé). *Interdiction absolue du `any`.*
*   **Runtime** : **Node.js** (Compatible o2switch).
*   **Framework** : **NestJS**.
    *   *Pourquoi ?* Son architecture imposée (Modules/Controllers/Services) empêche l'IA de disperser le code.
*   **Sécurité / Auth** : **JWT** (JSON Web Tokens). Stateless, adapté à l'architecture API/Front séparée.
*   **Base de Données** :
    *   **Dev** : **SQLite**. (Fichier local `.db` pour démarrage immédiat sans Docker, idéal pour les sessions IA éphémères).
    *   **Prod** : **MariaDB** (MySQL). Standard o2switch.
    *   *Note* : Prisma gère l'abstraction. Le changement de DB est transparent via `schema.prisma`.
*   **ORM** : **Prisma**.
    *   *Pourquoi ?* Génère des types TS automatiquement. Si l'IA invente un champ, le code ne compile pas.

### 1.2. Frontend (Interface)
*   **Framework** : **Next.js** (App Router).
*   **Langage** : **TypeScript**.
*   **UI Library** : **Tailwind CSS** + **Shadcn/ui** (Composants pré-construits robustes).
    *   *Thème* : **Light Mode** par défaut (Style "Corporate" professionnel, accents bleus).

---

## 2. Architecture Monorepo & Qualité

Pour assurer la cohérence entre le Backend et le Frontend, nous utilisons un **Monorepo** géré par **pnpm workspaces**.

### 2.1. Structure Hybride (Dev vs Prod)
*   **Développement** : Monorepo unifié pour que l'IA puisse voir et modifier l'ensemble du projet en une seule opération, et partager les types.
*   **Production (o2switch)** : Déploiement en deux applications distinctes (API et Front) pour respecter les contraintes de l'hébergeur.

### 2.2. Stratégie Anti-Régression
*   **Tests End-to-End (E2E)** :
    *   **Outil** : **Playwright**.
    *   **Règle d'Or** : **"No Test, No Commit"**.
    *   Chaque fonctionnalité critique (Réservation, Login, Upload) doit avoir un scénario de test associé.
*   **Architecture "Atomic Design"** :
    *   **Backend** : Pattern **Action-Based** (1 fichier = 1 Action métier).
    *   **Frontend** : Composants atomiques (Pas de fichiers géants).
*   **Sécurité par Design** :
    *   **IDs** : **UUID** obligatoires.
    *   **Permissions** : "Deny by Default".

---

## 3. Infrastructure & Déploiement (o2switch)

L'architecture Monorepo nécessite une stratégie de déploiement adaptée à l'hébergement mutualisé **o2switch**.

*   **Gestionnaire de Paquets** : **pnpm** (obligatoire pour les workspaces).
*   **Hébergement** : 2 Applications Node.js distinctes dans cPanel :
    1.  `api.form-act.be` (Dossier : `apps/api`)
    2.  `app.form-act.be` (Dossier : `apps/web`)
*   **CI/CD** : **GitHub Actions**.
    *   Pipeline : `Lint` -> `TypeCheck` -> `Test E2E`.
    *   **Build** : Le pipeline génère deux artefacts distincts (`dist/api` et `dist/web`) qui sont déployés indépendamment.

---

## 4. Services Tiers (Liste Blanche)

L'IA ne doit utiliser QUE ces services validés :
*   **Emails** : **SMTP o2switch** via **Nodemailer** (Suffisant pour le volume < 1000 mails/an). *SendGrid/Brevo en option future si besoin.*
*   **Maps** : **Google Maps Platform**.
*   **Dates** : **Day.js** (Plus léger que Moment.js).
*   **Validation** : **Zod** (Pour valider les entrées API et les formulaires).
