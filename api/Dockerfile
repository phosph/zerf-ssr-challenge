# --- Etapa 1: Builder ---
# Esta etapa compila el código TypeScript a JavaScript.
FROM node:22-alpine AS builder

# Habilitar corepack para usar pnpm (viene con Node.js)
RUN corepack enable

WORKDIR /usr/src/app

# Copiar archivos de workspace y dependencias
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY common/ ./common/
COPY api/package.json ./api/

# Instalar todas las dependencias (incluyendo devDependencies para compilar)
# pnpm necesita que el WORKDIR sea la raíz del workspace para la instalación
RUN pnpm install

# Copiar el resto del código fuente de la API
WORKDIR /usr/src/app/api
COPY api/ .

# Construir la aplicación
RUN pnpm build

# --- Etapa 2: Producción ---
# Esta etapa crea la imagen final y ligera con solo lo necesario para ejecutar.
FROM node:22-alpine
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=builder /usr/src/app/api/dist .

EXPOSE 3001

CMD ["node", "main.cjs"]
