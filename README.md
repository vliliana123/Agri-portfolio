# Agri — Farm lease management system

Full-stack web application for managing agricultural lease contracts, payments,
and invoicing. Built as a portfolio project to demonstrate full-stack development
with Django REST Framework and React + TypeScript.

**Domain (Romanian context):**
Landowners (*arendatori*) lease parcels of land (*terenuri*) to a farmer.
Each contract (*contract de arendă*) generates yearly payment obligations
(*plăți arendă*) that can be settled in cash, grain, or corn — often at prices
tied to the local town-hall reference price (*preț kg primărie*).

---

## ✨ Features

- **Landowner management** — CRUD with Romanian ID validation (CNP)
- **Contract management** — linked to landowners, with land parcels and addendums
- **Yearly rent tracking** — per-contract yearly obligation with status
  (unpaid / partial / fully paid)
- **Payment recording** — multi-currency (RON, wheat kg, corn kg), automatic
  status recalculation, QR-coded receipts
- **Yearly price config** — per-year reference prices for wheat and corn
- **Interval reports** — sum of payments over a date range
- **Oblio invoicing** — optional integration with the Romanian Oblio API for
  invoice emission (SPV-ready)
- **JWT auth in httpOnly cookies** — no tokens in `localStorage`

---

## 🛠️ Tech stack

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Backend   | Django 5.1, Django REST Framework, SimpleJWT, django-filter |
| Frontend  | React 19, TypeScript, MUI, Axios, React Router          |
| Database  | SQLite (demo) / MySQL (production)                      |
| Auth      | JWT (access + refresh), httpOnly cookies, bcrypt        |
| Testing   | Manual + Django checks                                  |

---

## 🚀 Quick start

**Prerequisites:** Python 3.12+, Node 18+, npm.

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# create .env from template
cp .env.example .env
# (Windows: copy .env.example .env)

# create tables + fake data
python manage.py migrate
python manage.py seed_demo

# run
python manage.py runserver
```

Backend runs on **http://localhost:8000**.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**.

### 3. Log in

- **Email:** `demo@agri.local`
- **Password:** `demo1234`

The demo dataset contains 15 landowners, 20 contracts, 30 land parcels,
25 payments (mixed statuses), and yearly price configs for 2024–2026.

---

## 🏗️ Project structure

```
Agri/
├── backend/                       Django project
│   ├── api/
│   │   ├── models.py              9 models (Users, Arendatori, Contracte,
│   │   │                          Terenuri, Aditionale, Arenda, PlatiArenda,
│   │   │                          Zone, ConfigAn)
│   │   ├── serializers.py         DRF serializers + validators
│   │   ├── views.py               ViewSets + custom actions (raport, mark-paid,
│   │   │                          emit-oblio, lista_plati, ...)
│   │   ├── auth.py                Cookie-based JWT authentication
│   │   ├── urls.py                Router registration
│   │   └── management/commands/
│   │       └── seed_demo.py       Faker-based synthetic Romanian data seeder
│   ├── config/                    Django settings, URLs, WSGI
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/                 Route-level components (Add/Edit/List)
        ├── components/            Reusable UI: tables, modals, layout
        ├── services/api.ts        Axios client + typed API functions
        ├── context/               Auth + breadcrumb contexts
        ├── hooks/                 Custom hooks (useZone, ...)
        └── types/index.ts         Shared TypeScript interfaces
```

---

## 🔒 Security

Security posture reflects an OWASP Top 10 audit:

- JWT in httpOnly + SameSite cookies (not `localStorage`)
- CORS allow-list, no `AllowAllOrigins`
- `IsAuthenticated` as default DRF permission
- Rate limiting on `/api/login/` (5/min per IP)
- Security headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`,
  `Referrer-Policy`)
- Explicit serializer `fields` — no `__all__`
- ORM everywhere (no raw SQL string concat)
- Bcrypt-hashed passwords

## 🚀 Deployment considerations

When moving from local demo to a production environment:

- Serve over HTTPS and flip cookies to `secure=True`
  (see `set_auth_cookies` in `backend/api/views.py`)
- Enable `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS`, and related headers
  in `settings.py` (already scaffolded, commented)
- Switch to a managed database (PostgreSQL / MySQL) and set `DEBUG=False`
- Generate a fresh `SECRET_KEY` and provide real DB / Oblio credentials
  via environment variables (see `.env.example`)
- Add column-level encryption for personal data (CNP, CI) —
  planned via `django-cryptography`
- Automate DB backups and configure log aggregation

---

## 📸 Screenshots

_(add screenshots to `docs/screenshots/` and reference them here)_

---

## 🗺️ Roadmap

- [ ] Column-level encryption for CNP / CI (PII at rest)
- [ ] Audit log for CRUD actions (`django-simple-history`)
- [ ] Automated tests (pytest-django + React Testing Library)
- [ ] CI on GitHub Actions
- [ ] Docker Compose for one-command spin-up

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

## 🙋 Author

Built by Liliana Vartolomei as a portfolio project. Domain modelled on real
Romanian agricultural lease workflows (with fully synthetic data).
