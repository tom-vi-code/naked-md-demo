# ------------------------------------------------------------------
# Crunch Fitness – Next.js frontend
# ------------------------------------------------------------------
# NOTE: next.config.mjs must include  output: 'standalone'  for the
# standalone build to work.  Example:
#
#   /** @type {import('next').NextConfig} */
#   const nextConfig = { output: 'standalone' };
#   export default nextConfig;
# ------------------------------------------------------------------

FROM node:20-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_WS_BACKEND_URL
ENV NEXT_PUBLIC_WS_BACKEND_URL=$NEXT_PUBLIC_WS_BACKEND_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
