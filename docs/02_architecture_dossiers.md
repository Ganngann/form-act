# 📂 Structure du Projet (Target Architecture)

Ce document définit l'organisation stricte des fichiers. L'IA doit s'y conformer pour éviter la dispersion du code.

## 0. Racine Monorepo (pnpm)

```text
/
├── apps/                             # Applications (Deployables)
│   ├── api/                          # Backend NestJS
│   └── web/                          # Frontend Next.js
├── packages/                         # Librairies partagées
│   └── shared-types/                 # DTOs, Enums, Interfaces (Partagé Back/Front)
│       └── src/
│           ├── index.ts
│           └── dto/
├── pnpm-workspace.yaml               # Config Monorepo
├── package.json                      # Scripts globaux
└── turbo.json (Optionnel)            # Cache de build
```

## 1. Backend (NestJS) - `apps/api`

L'architecture est modulaire. Chaque module métier (Reservation, Auth, Catalog) est isolé.

```text
apps/api/src/
├── modules/
│   ├── reservation/
│   │   ├── actions/                  # Logique Métier (1 fichier = 1 action)
│   │   │   ├── create-reservation.action.ts
│   │   │   ├── cancel-reservation.action.ts
│   │   │   └── validate-logistics.action.ts
│   │   ├── controllers/              # Routes API (HTTP)
│   │   │   └── reservation.controller.ts
│   │   ├── dtos/                     # Validation des entrées (Zod/ClassValidator)
│   │   │   └── create-reservation.dto.ts
│   │   └── reservation.module.ts
│   ├── auth/
│   └── catalog/
├── shared/                           # Code partagé (Utils, Guards, Decorators)
│   ├── guards/
│   │   └── roles.guard.ts
│   └── decorators/
│       └── current-user.decorator.ts
├── prisma/
│   └── schema.prisma                 # Définition de la Base de Données
└── main.ts
```

## 2. Frontend (Next.js) - `apps/web`

Organisation par "Features" plutôt que par type de fichier technique.

```text
apps/web/src/
├── app/                              # Next.js App Router (Pages)
│   ├── (public)/                     # Routes publiques
│   │   ├── login/page.tsx
│   │   └── catalogue/page.tsx
│   └── (dashboard)/                  # Routes protégées
│       ├── client/page.tsx
│       └── admin/page.tsx
├── features/                         # Composants Métier (Le cœur du front)
│   ├── booking/
│   │   ├── components/
│   │   │   ├── BookingCalendar.tsx
│   │   │   └── LogisticsForm.tsx
│   │   └── hooks/
│   │       └── useBookingProcess.ts
│   └── catalog/
├── components/ui/                    # Composants UI Génériques (Boutons, Inputs)
│   ├── button.tsx
│   └── card.tsx
├── lib/                              # Configuration & Utils
│   ├── api-client.ts                 # Client API typé
│   └── utils.ts
└── styles/
    └── globals.css
```

## 3. Tests & Config

```text
/
├── tests/                            # Tests End-to-End (Playwright)
│   ├── e2e/
│   │   ├── booking-flow.spec.ts
│   │   └── admin-dashboard.spec.ts
├── .github/workflows/                # CI/CD
│   └── ci.yml
├── package.json
└── README.md
```
