FROM node:24.14.0-alpine

WORKDIR /app

COPY apps/server/package*.json ./apps/server/

COPY shared ./shared

WORKDIR /app/apps/server
RUN npm install

COPY apps/server/ ./

RUN npx prisma generate

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "run", "start"]