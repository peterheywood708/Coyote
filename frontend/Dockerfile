FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM busybox:1.37 AS runner
COPY --from=builder /app/dist .
CMD ["busybox", "httpd", "-f", "-v", "-p", "8080"]

