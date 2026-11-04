FROM node:24-bookworm-slim AS build
WORKDIR /srv/nation
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY apps ./apps
COPY packages ./packages
COPY scripts ./scripts
COPY deploy/railway/source-contract.json ./deploy/railway/source-contract.json
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim
WORKDIR /srv/nation
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /srv/nation ./
USER node
CMD ["node","scripts/staging-service.mjs","web"]
