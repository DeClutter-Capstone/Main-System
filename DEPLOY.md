# Deploying DeClutter to Railway

This project deploys as **two Railway services** (backend + frontend) plus a
**Postgres** plugin and a **Volume** for image storage.

## 1. Postgres

Add the **Postgres** plugin to your Railway project. It exposes a `DATABASE_URL`
variable — reference it from the backend service.

## 2. Backend service (FastAPI)

- **Root / Dockerfile:** repo root `Dockerfile` (build context = repo root).
- **Volume:** add a volume and mount it at `/data`. Images must live on a volume
  because Railway's container filesystem is wiped on every redeploy.
- **Variables:**

  | Variable | Value |
  |---|---|
  | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference the plugin) |
  | `OPENAI_API_KEY` | your OpenAI key |
  | `ALLOWED_GENERATION_EMAILS` | `moeomer67@gmail.com` (comma-separate to add more) |
  | `STORAGE_DIR` | `/data/storage` (must match the volume mount) |
  | `ALLOWED_ORIGINS` | the frontend's public URL, e.g. `https://declutter-web.up.railway.app` |
  | `SQL_ECHO` | `false` |

  Railway injects `PORT` automatically; the Dockerfile already binds to it.

## 3. Frontend service (Vite/React)

- **Root directory:** `frontend/` · **Dockerfile:** `frontend/Dockerfile`.
- **Variables** (Vite bakes these in at *build* time, so they must be set before
  the build — Railway passes service variables to the Docker build):

  | Variable | Value |
  |---|---|
  | `VITE_BACKEND_URL` | the backend's public URL, e.g. `https://declutter-api.up.railway.app` |
  | `VITE_FIREBASE_API_KEY` … `VITE_FIREBASE_MEASUREMENT_ID` | from your existing `frontend/.env.local` |

  > If you change `VITE_BACKEND_URL`, you must **rebuild** the frontend — the URL
  > is compiled into the bundle, not read at runtime.

## 4. Wire the two URLs together

1. Deploy backend → copy its public URL → set `VITE_BACKEND_URL` on the frontend.
2. Deploy frontend → copy its public URL → set `ALLOWED_ORIGINS` on the backend.
3. Add the frontend URL to **Firebase Console → Authentication → Settings →
   Authorized domains** so Google sign-in works.

## Token protection (allowlist)

Only accounts whose email (or Firebase UID) is in `ALLOWED_GENERATION_EMAILS`
can call the generate endpoint; everyone else gets HTTP 403. The list is
**fail-closed** — empty means nobody can generate. Edit the variable and redeploy
to change who's allowed.

> **Security note:** the backend currently trusts the `X-Firebase-Uid` header
> without verifying a Firebase ID token, so this allowlist stops casual/UI abuse
> but not a crafted request that forges the header. For stronger protection,
> verify the Firebase ID token server-side with `firebase-admin`.
