# 🚀 Guide de Déploiement (Staging) - Form-Act

Ce document détaille la procédure de mise en production sur l'hébergement mutualisé **o2switch**.

Les informations sensibles (mots de passe, clés API) ne sont PAS stockées ici. Elles doivent être configurées directement sur le serveur via les variables d'environnement (`.env`).

## 📋 Informations du Serveur

- **Hébergement** : o2switch
- **Panel** : cPanel / Setup Node.js App

| Application | URL Publique | Dossier sur le Serveur |
| :--- | :--- | :--- |
| **Backend (API)** | `https://api.formact.[VOTRE_ID].universe.wf` | `form-act-api` |
| **Frontend (Web)** | `https://formact.[VOTRE_ID].universe.wf` | `form-act-front` |

---

## 1. Préparation (Local)

Si ce n'est pas déjà fait, générez les fichiers de production :

```bash
pnpm run build
```

Cela va créer :
- `apps/web/.next/standalone` (Frontend - Serveur Autonome)
- `apps/web/.next/static` (Assets Frontend)
- `apps/web/public` (Images Frontend)
- `dist/apps/api` (Backend - Serveur Compilé)

---

## 2. Transfert des Fichiers (FileZilla / SCP)

Connectez-vous à votre espace hébergement et transférez les fichiers vers les dossiers correspondants.

### 🟢 A. Pour le Backend (API)
**Destination** : `/home/[USER]/form-act-api`

1.  Videz le dossier (sauf `node_modules` si vous voulez gagner du temps, mais c'est mieux de repartir à zéro la première fois).
2.  Copiez **le contenu** de `apps/api` (votre code source, package.json, etc.) vers le serveur.
    *   ⚠️ **Important** : Assurez-vous d'envoyer le dossier `dist` (qui vient d'être généré) et le dossier `prisma`.
3.  Renommez `prisma/schema.mysql.prisma` en `prisma/schema.prisma` sur le serveur (pour qu'il devienne le fichier de référence).

### 🔵 B. Pour le Frontend (Web)
**Destination** : `/home/[USER]/form-act-front`

1.  Videz le dossier.
2.  Copiez **le contenu** de `apps/web/.next/standalone` vers le dossier du serveur.
3.  Copiez le dossier `apps/web/.next/static` vers le sous-dossier `.next/static` sur le serveur.
4.  Copiez le dossier `apps/web/public` vers le dossier `public` sur le serveur.

---

## 3. Configuration des Variables (.env)

Créez (ou modifiez) le fichier `.env` à la racine de chaque dossier **sur le serveur**. NE COMMITTEZ JAMAIS CE FICHIER.

### 🟢 API (`/form-act-api/.env`)

```env
# Remplacer xxxxx par votre mot de passe DB o2switch
DATABASE_URL="mysql://[DB_USER]:[DB_PASSWORD]@localhost:3306/[DB_NAME]"

PORT=3001
JWT_SECRET="[SHH_SECRET_DE_PROD]"

# URL du Front pour autoriser les requêtes (CORS)
FRONTEND_URL="https://formact.[VOTRE_ID].universe.wf"

# Config SMTP
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=noreply@formact.[VOTRE_ID].universe.wf
SMTP_PASS=[EMAIL_PASSWORD]
SMTP_FROM="Form-Act <noreply@formact.[VOTRE_ID].universe.wf>"
```

### 🔵 Web (`/form-act-front/.env`)

```env
PORT=3000
# URL de l'API pour que le Front puisse communiquer avec
NEXT_PUBLIC_API_URL="https://api.formact.[VOTRE_ID].universe.wf"
```

---

## 4. Installation & Démarrage (Terminal SSH/cPanel)

Depuis le terminal de cPanel (ou via SSH), lancez ces commandes :

### 🟢 Installation Backend

```bash
cd form-act-api

# 1. Installer les dépendances de prod
npm install --production

# 2. Générer le client Prisma (optionnel si postinstall tourne)
npx prisma generate

# 3. Mettre à jour la Base de Données (Migration)
npx prisma db push
```

### 🔵 Installation Frontend

```bash
cd form-act-front

# Normalement pas besoin d'install, le standalone est autonome.
# Si besoin : npm install
```

---

## 5. Activation

Retournez dans l'interface **"Setup Node.js App"** de cPanel et cliquez sur **Redémarrer (Restart)** pour les deux applications.

- API : Vérifiez `https://api.formact.[VOTRE_ID].universe.wf`
- Web : Vérifiez `https://formact.[VOTRE_ID].universe.wf`
