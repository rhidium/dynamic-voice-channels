FROM node:24-alpine AS base
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY rhidium/package.json ./rhidium/
RUN corepack prepare pnpm@10.4.1 --activate \
  && corepack enable \
  && apk add --no-cache openssl

FROM base AS prod-deps
COPY prisma.config.ts ./
COPY prisma/ ./prisma/
COPY rhidium/prisma.config.ts ./rhidium/
COPY rhidium/.husky/ ./rhidium/.husky/
COPY rhidium/prisma/ ./rhidium/prisma/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm db:generate
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter rhidium db:generate

# 
# START Client
# 

FROM base AS build-client
COPY . .
RUN  --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN  pnpm run build

FROM base AS client
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build-client /app/dist /app/dist
COPY --from=build-client /app/locales /app/locales
COPY --from=build-client /app/rhidium /app/rhidium
COPY --from=build-client /app/generated /app/generated
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
