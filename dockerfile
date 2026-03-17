FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/backend/package*.json ./apps/backend/

RUN npm install

COPY packages/shared ./packages/shared
RUN cd packages/shared && npx tsc

COPY apps/backend ./apps/backend
RUN cd apps/backend && npm run build

FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages/shared/dist ./packages/shared/dist
COPY --from=base /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=base /app/apps/backend/dist ./apps/backend/dist
COPY --from=base /app/apps/backend/package.json ./apps/backend/package.json

EXPOSE 3000


CMD ["node", "apps/backend/dist/apps/backend/src/main.js"]