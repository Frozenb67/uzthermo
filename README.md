# UzThermo — Plumbing, Heating & Climate Systems Store

Multi-page e-commerce site + admin dashboard for boilers, gas heaters, pipes, fittings, pumps
and radiators. Layout/menu flow inspired by bosch-tashkent.uz, upgraded with interactive
calculator widgets, deep catalog navigation, an installer marketplace, and a full CMS.

## Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons, Framer Motion, Zustand
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT

## Structure

```
uzthermo/
├── frontend/     Next.js app (pages, components, Zustand stores)
└── backend/      Express API (models, controllers, routes, middleware)
```

See `frontend/app` for all 6+ pages (home, catalog, product detail, tools hub, installers,
compare, admin) and `backend/models` for the 5 Mongoose schemas (User, Category, Product,
Order, Installer).

## Status

This is a scaffolded skeleton: every route/component file exists with a one-line purpose
comment, ready to be filled in. Fully implemented so far:

- All 5 Mongoose schemas (`backend/models/*.js`)
- `BoilerCalculatorWidget.jsx` — real-time boiler kW sizing widget
- Express bootstrap (`server.js`, `config/db.js`)
- Build/dev tooling (`package.json`, Tailwind, PostCSS, Next config)

## Getting started

```bash
# backend
cd backend
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, TELEGRAM_BOT_TOKEN
npm install
npm run dev

# frontend
cd frontend
npm install
npm run dev
```

Note: route files under `backend/routes/*.js` and controllers under `backend/controllers/*.js`
are currently stubs (comment only) — they need `express.Router()` implementations wired to the
models before `server.js` will boot cleanly.
