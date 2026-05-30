FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json .npmrc* ./
RUN npm ci --legacy-peer-deps

COPY . .

ARG NEXT_PUBLIC_DJANGO_URL=http://django:8000
ENV NEXT_PUBLIC_DJANGO_URL=$NEXT_PUBLIC_DJANGO_URL

# Cap the Node heap so `next build` can't balloon past the box's RAM budget. Forces
# earlier GC; keeps the build under ~700 MB on a 1 GB host. Builder stage only —
# the runtime server.js does not inherit this.
ENV NODE_OPTIONS="--max-old-space-size=640"

RUN npm run build


FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
