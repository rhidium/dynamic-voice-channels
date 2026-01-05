FROM node:24-alpine AS base
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app
COPY prisma/ prisma/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
RUN corepack prepare pnpm@10.4.1 --activate \
  && corepack enable \
  && apk add --no-cache openssl

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
COPY prisma.config.ts /app/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm db:generate

# 
# START Client
# 

FROM base AS build-client
RUN  --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . /app/
WORKDIR /app
RUN  pnpm run build

FROM base AS client
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build-client /app/dist /app/dist
COPY --from=build-client /app/locales /app/locales
COPY --from=build-client /app/rhidium /app/rhidium
COPY --from=build-client /app/generated /app/generated
# =========================
WORKDIR /app/rhidium
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm db:generate
WORKDIR /app
# =========================
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
ENTRYPOINT ["/app/docker-entrypoint.sh"]
