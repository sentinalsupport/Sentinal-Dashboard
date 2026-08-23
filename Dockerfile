FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY apps/dashboard/package.json ./apps/dashboard/package.json
COPY apps/bot/package.json ./apps/bot/package.json
COPY packages ./packages
RUN pnpm install
COPY . .
RUN pnpm --filter dashboard build || true
RUN pnpm --filter bot build || true
EXPOSE 3000
CMD ["pnpm", "--filter", "dashboard", "start"]
