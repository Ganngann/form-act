# 🎓 Guide de Gestion de Projet (Workflow IA)

Comment piloter le développement de Form-Act efficacement avec une IA générative.

## 1. Le Cycle de Développement (The Loop)

Pour chaque User Story (US) du Backlog, suivez scrupuleusement ces étapes :

1.  **CONTEXTE** : Copiez le contenu de `AGENT.md` dans le chat de l'IA.
2.  **MISSION** : Copiez l'US complète (avec les AC) depuis `docs/05_backlog_taches.md`.
    *   *Prompt : "Réalise l'US-02. Voici les critères d'acceptation..."*
3.  **REVIEW** : L'IA génère le code.
    *   Vérifiez qu'elle a créé des petits fichiers (Action-Based).
    *   Vérifiez qu'elle a créé le test E2E associé.
4.  **VALIDATION** :
    *   Lancer les tests : `npx playwright test`.
    *   Si vert : Commit.
    *   Si rouge : Copier l'erreur à l'IA -> *"Corrige ça"*.
5.  **CLÔTURE** : Mettre une croix `[x]` dans le `05_backlog_taches.md`.

## 2. Comment rédiger une bonne US pour l'IA ?

L'IA a besoin de contraintes fortes.

**❌ Mauvaise US :**
> "Faire la page de contact."
> *(Trop vague, l'IA va inventer n'importe quoi)*

**✅ Bonne US :**
> **US-10 : Page de Contact**
> **En tant que** Visiteur, **Je veux** envoyer un message à l'admin.
> **AC :**
> 1. Champs : Nom, Email, Message (Textarea).
> 2. Validation Zod : Email valide obligatoire.
> 3. Action : Envoi un mail à `admin@form-act.com` via Nodemailer.
> 4. UI : Utiliser le composant `Card` de Shadcn.

## 3. Gestion des Bugs

Si un bug est trouvé :
1.  Ne le corrigez pas "à la volée".
2.  Ajoutez une ligne dans le Backlog : `[ ] BUG : Le calendrier ne s'affiche pas sur mobile`.
3.  Traitez-le comme une mini-US (Prompt -> Code -> Test -> Valid).
