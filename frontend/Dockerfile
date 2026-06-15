# Frontend (Vite/React) image — build context is the frontend/ directory.
#
# IMPORTANT: Vite inlines VITE_* env vars at BUILD time, not runtime. They must
# be supplied as --build-arg values (Railway: set them as service "Variables",
# which Railway passes to the Docker build). Setting them only at runtime has
# no effect — the bundle is already compiled.
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Build-time configuration (must be present before `npm run build`).
ARG VITE_BACKEND_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID \
    VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID

COPY . .
RUN npm run build

# Serve the static build. `serve` binds to $PORT (Railway-injected).
FROM node:20-alpine AS runtime
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
