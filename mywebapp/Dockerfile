FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5200

CMD ["sh", "-c", "node dist/migrate.js --dbhost=db --dbuser=app --dbpass=app_password --dbname=mywebapp_db && node dist/index.js --dbhost=db --dbuser=app --dbpass=app_password --dbname=mywebapp_db --port=5200"]