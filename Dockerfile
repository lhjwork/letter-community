FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# NEXT_PUBLIC_* 값은 빌드 시 번들에 인라인되므로 --build-arg 로 넘겨야 한다.
ARG NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
# GitHub Actions 빌드에는 서버의 .env.production 이 없다 → 넘겨받은 값만 .env.production.local 로(비면 기존 파일 값 유지)
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_APP_URL
RUN { [ -n "$NEXT_PUBLIC_URL" ] && echo "NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL"; [ -n "$NEXT_PUBLIC_APP_URL" ] && echo "NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL"; true; } >> .env.production.local
RUN pnpm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
USER nextjs
EXPOSE 3001
ENV PORT=3001
CMD ["node", "server.js"]
