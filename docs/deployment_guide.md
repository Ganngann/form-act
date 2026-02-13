# Guide de Déploiement Validé (o2switch)

Ce guide décrit la méthode **MANUELLE** qui a été testée et validée le 16/01/2026 pour le projet Form-Act. C'est la seule méthode garantie pour l'instant.

---

## 1. Prérequis Local (Sur ton PC)

1.  Assure-toi de lancer les commandes depuis la racine du projet (`d:\Projects\form-act`).
2.  Le fichier `apps/web/next.config.js` doit être **standard** (SANS `output: 'standalone'`).
3.  Le fichier `apps/web/server.js` (Custom Server) doit être présent dans le code source pour stabiliser le lancement Front.

---

## 2. API / Backend (NestJS)

### 2.1. Build & Packaging

1.  Lancer le build :
    ```bash
    pnpm build --filter api
    ```
2.  Créer une archive **`api.zip`** contenant :
    - Le dossier `apps/api/dist`
    - Le fichier `apps/api/package.json`
    - Le dossier `apps/api/prisma`

### 2.2. Mise en ligne (o2switch)

1.  **cPanel > Setup Node.js App** :
    - **Root** : `api`
    - **URL** : `api.votre-domaine.com` (ou sous-dossier)
    - **Startup File** : `dist/main.js`
    - Créer l'app.
2.  **Gestionnaire de Fichiers** :
    - Aller dans le dossier `api`.
    - Uploader et extraire `api.zip`.
3.  **Finalisation** :
    - Retourner dans "Setup Node.js App".
    - Cliquer sur **Run NPM Install**.
    - Cliquer sur **Start App**.

---

## 3. Site Web / Frontend (Next.js)

### 3.1. Build & Packaging

1.  Lancer le build :
    ```bash
    pnpm build --filter web
    ```
2.  Créer une archive **`web.zip`** contenant le contenu de `apps/web` **SAUF** `node_modules` :
    - Dossier `.next`
    - Dossier `public`
    - Fichier `package.json`
    - Fichier `next.config.js`
    - Fichier `server.js` (Indispensable !)

### 3.2. Mise en ligne (o2switch)

1.  **cPanel > Setup Node.js App** :
    - **Root** : `web`
    - **URL** : `votre-domaine.com`
    - **Startup File** : `server.js`
    - Créer l'app.
2.  **Gestionnaire de Fichiers** :
    - Aller dans le dossier `web`.
    - Supprimer les fichiers par défaut (`app.js`, etc.).
    - Uploader et extraire `web.zip`.
3.  **Finalisation** :
    - Retourner dans "Setup Node.js App".
    - Cliquer sur **Run NPM Install**.
    - Cliquer sur **Start App**.

---

## 4. Base de Données & Persistance

Pour finaliser la connexion (Prod) :

1.  Créer une base MySQL dans cPanel.
2.  Ajouter `DATABASE_URL` dans les variables d'environnement de l'app API.
3.  Connectez-vous en SSH pour jouer les migrations :
    ```bash
    cd api
    npx prisma migrate deploy
    ```
