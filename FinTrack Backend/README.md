# FinTrack Backend (Django REST + JWT)

Minimal setup to run the API locally.

## Requirements
- Python 3.11+
- pip

## Quick Start
```bash
cd "FinTrack Backend"
python -m venv .venv
.venv\Scripts\activate  # (Windows PowerShell) or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt

# Copy env example and edit if needed
copy env.example .env  # Windows
# cp env.example .env  # macOS/Linux

python manage.py migrate
python manage.py runserver
```

Backend will run at http://localhost:8000

## Auth
- JWT endpoints:
  - POST `/api/auth/token/` (username, password)
  - POST `/api/auth/token/refresh/`
  - POST `/api/auth/token/verify/`

## Main APIs (overview)
- Accounts: `/api/accounts/register/`, `/api/accounts/me/`, `/api/accounts/logout/`
- Expenses: `/api/expenses/` (GET, POST), `/api/expenses/{id}/` (GET, PATCH/PUT, DELETE), `/api/expenses/categories/`
- Subscriptions: `/api/subscriptions/` (GET, POST), `/api/subscriptions/{id}/` (GET, PATCH/PUT, DELETE), `/api/subscriptions/calendar/`
- Profile: `/api/profile/me/` (GET, PATCH)
- Settings: `/api/settings/me/` (GET, PATCH) — includes `savings_goal`
- Rewards: `/api/rewards/` — returns catalog and earned
- History: `/api/history/`
- AI: `/api/ai/chat/`, `/api/ai/receipt/parse/`, `/api/ai/receipt/commit/`

Swagger docs: `/api/docs/`

## CORS
Configured via `.env`:
```
CORS_ALLOW_ALL=True  # dev
# or
CORS_ALLOW_ALL=False
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## AI Integration (optional)
Set one provider in `.env` and restart:
```
# OpenAI
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
OPENAI_VISION_MODEL=gpt-4o-mini

# or OpenRouter
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
OPENROUTER_VISION_MODEL=openai/gpt-4o-mini
```

## Common Commands
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Notes
- Default DB is SQLite (`db.sqlite3`). Do not commit it.
- Media files are served at `/assets/` in debug mode. Do not commit `media/`.
- `.env` should not be committed; see `env.example`. 

