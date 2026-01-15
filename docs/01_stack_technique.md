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
*   **Base de Données** : **MariaDB** (MySQL). Standard o2switch.
*   **ORM** : **Prisma**.
    *   *Pourquoi ?* Génère des types TS automatiquement depuis la DB. Si l'IA invente un champ, le code ne compile pas.

### 1.2. Frontend (Interface)
*   **Framework** : **Next.js** (App Router).
*   **Langage** : **TypeScript**.
*   **UI Library** : **Tailwind CSS** + **Shadcn/ui** (Composants pré-construits robustes, faciles à manipuler pour une IA).

---

## 2. Stratégie Anti-Régression & Qualité

Pour empêcher l'IA de supprimer des fonctionnalités ou de casser l'existant.

### 2.1. Tests End-to-End (E2E) Obligatoires
*   **Outil** : **Playwright**.
*   **Règle d'Or** : **"No Test, No Commit"**.
    *   Chaque fonctionnalité critique (Réservation, Login, Upload) doit avoir un scénario de test associé.
    *   L'IA doit lancer `npx playwright test` avant de proposer une validation. Si ça rougeoie, elle doit corriger.

### 2.2. Architecture "Atomic Design" (Petits Fichiers)
Pour éviter que l'IA ne se perde dans des fichiers géants et tronque du code.
*   **Backend** : Pattern **CQRS** simplifié ou **Action-Based**.
    *   1 Fichier = 1 Action métier (ex: `create-reservation.action.ts`).
    *   Taille max fichier : ~150 lignes.
*   **Frontend** : Composants atomiques.
    *   Pas de `Page.tsx` de 1000 lignes. On découpe en `BookingForm.tsx`, `CalendarView.tsx`, etc.

### 2.3. Sécurité par Design
*   **IDs** : Utilisation exclusive d'**UUID** (ex: `123e4567-e89b...`) pour toutes les entités (Clients, Sessions). *Interdiction des auto-incréments (1, 2, 3) exposés.*
*   **Permissions** : Politique **"Deny by Default"**.
    *   Chaque route API doit avoir un décorateur `@Roles('ADMIN')` ou `@Roles('CLIENT')` explicite.

---

## 3. Infrastructure & Déploiement (o2switch)

*   **Hébergement** : **o2switch** (Offre Unique).
*   **Méthode** : Node.js via **cPanel Setup Node.js App**.
*   **CI/CD** : **GitHub Actions**.
    *   Pipeline strict : `Lint` -> `TypeCheck` -> `Test E2E` -> `Deploy`.
    *   Si l'IA pousse un code qui ne compile pas, le déploiement est bloqué automatiquement.

---

## 4. Services Tiers (Liste Blanche)

L'IA ne doit utiliser QUE ces services validés :
*   **Emails** : **SMTP o2switch** via **Nodemailer** (Suffisant pour le volume < 1000 mails/an). *SendGrid/Brevo en option future si besoin.*
*   **Maps** : **Google Maps Platform**.
*   **Dates** : **Day.js** (Plus léger que Moment.js).
*   **Validation** : **Zod** (Pour valider les entrées API et les formulaires).
