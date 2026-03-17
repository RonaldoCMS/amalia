FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/backend/package*.json ./apps/backend/

RUN npm install

COPY packages/shared ./packages/shared
RUN cd packages/shared && npx tsc && ls dist/

COPY apps/backend ./apps/backend
RUN cd apps/backend && npm run build && ls dist/ && find /app/apps/backend/dist -name "*.js" | head -20

EXPOSE 3000

CMD ["node", "apps/backend/dist/apps/backend/src/main.js"]