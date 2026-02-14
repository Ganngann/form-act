# 🚀 Guide de Déploiement (Staging/Prod) - Form-Act

Ce guide détaille les étapes pour déployer le projet sur **o2switch** (cPanel).

## 1. Préparation des Fichiers (Local)

Le projet est configuré pour gérer deux environnements :
- **Local** : SQLite (`schema.prisma`)
- **Production** : MySQL/MariaDB (`schema.mysql.prisma`)

### Générer le Build

Lancez cette commande à la racine du projet pour créer les versions optimisées :

```bash
pnpm run build
```

Cela va générer :
1.  `apps/web/.next/standalone` : Le serveur Frontend optimisé.
2.  `apps/web/.next/static` : Les fichiers statiques (images, CSS, JS).
3.  `dist/apps/api` : Le serveur Backend compilé (si vous utilisez le build global, sinon il faut builder l'api spécifiquement).

> **Note** : Pour l'API, assurez-vous que le dossier `dist` est bien présent dans `apps/api`.

---

## 2. Configuration sur o2switch (cPanel)

### A. Base de Données (MySQL)

1.  Allez dans **"Bases de données MySQL"**.
2.  Créez une nouvelle base : `formact_db`.
3.  Créez un utilisateur : `formact_user`.
4.  Liez l'utilisateur à la base avec **TOUS les privilèges**.
5.  Notez le mot de passe.

### B. Application Backend (Node.js)

1.  Allez dans **"Setup Node.js App"**.
2.  Créez une application :
    *   **Node.js version** : 20.x (Recommandé).
    *   **App Mode** : `Production`.
    *   **App Root** : `api`.
    *   **Application URL** : `api.form-act.be`.
    *   **Startup File** : `dist/main.js`.
3.  Cliquez sur **Create**.

### C. Application Frontend (Node.js)

1.  Créez une **seconde** application Node.js :
    *   **App Root** : `web`.
    *   **Application URL** : `app.form-act.be` (ou votre domaine principal).
    *   **Startup File** : `server.js`.
2.  Cliquez sur **Create**.

---

## 3. Transfert des Fichiers

Utilisez FileZilla (ou le Gestionnaire de fichiers cPanel) pour envoyer les fichiers.

### Pour l'API (`/api`)

Copiez le contenu de `apps/api` vers le dossier `api` sur le serveur, **SAUF** `node_modules`.
Assurez-vous d'inclure :
- `dist/`
- `prisma/` (avec `schema.mysql.prisma`)
- `package.json`
- `.env` (Créez-le avec les infos de Prod)

### Pour le Web (`/web`)

Copiez le contenu du build standalone :
1.  Copiez tout le contenu de `apps/web/.next/standalone/` vers le dossier `web` sur le serveur.
2.  Copiez le dossier `apps/web/.next/static` vers `web/.next/static`.
3.  Copiez le dossier `apps/web/public` vers `web/public`.

---

## 4. Installation & Démarrage (SSH ou Terminal cPanel)

Connectez-vous au terminal.

### Backend (API)

```bash
cd api
# Installer les dépendances de prod
npm install --production

# Générer le client Prisma pour MySQL
npm run generate:prod

# Appliquer la structure de la DB (Migration)
npx prisma db push --schema=./prisma/schema.mysql.prisma
```

### Frontend (Web)

```bash
cd web
# Normalement le standalone contient déjà tout, mais parfois un install est nécessaire
# Node server.js devrait suffire
```

---

## 5. Variables d'Environnement (.env)

Créez le fichier `.env` dans chaque dossier (`api` et `web`) sur le serveur.

**API (`/api/.env`)** :
```env
DATABASE_URL="mysql://formact_user:MOT_DE_PASSE@localhost:3306/formact_db"
FRONTEND_URL="https://app.form-act.be"
JWT_SECRET="VOTRE_SECRET_PROD"
PORT=3001
# SMTP configs...
```

**Web (`/web/.env`)** :
```env
NEXT_PUBLIC_API_URL="https://api.form-act.be"
PORT=3000
```

---

## 6. Redémarrage

Retournez dans **"Setup Node.js App"** et cliquez sur **"Restart"** pour les deux applications.
