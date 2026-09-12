# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS web-build
WORKDIR /build/web
COPY web/package.json web/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY web/ ./
ARG VITE_API_BASE_URL=/api
RUN VITE_API_BASE_URL="${VITE_API_BASE_URL}" yarn build

FROM golang:1.25.5-alpine AS server-build
WORKDIR /build/server
COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server/ ./
RUN CGO_ENABLED=0 go build -mod=readonly -trimpath -ldflags="-s -w" -o /out/go-admin .

FROM alpine:3.22 AS runtime
RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S -g 10001 app \
    && adduser -S -D -H -u 10001 -G app app \
    && mkdir -p /app/config \
    && chown -R app:app /app
WORKDIR /app
ENV TZ=Asia/Shanghai \
    MYAPP_SERVER_DEV=false \
    MYAPP_SERVER_HOST=0.0.0.0 \
    MYAPP_SERVER_PORT=8080
COPY --from=server-build --chown=app:app /out/go-admin ./go-admin
COPY --from=web-build --chown=app:app /build/server/dist ./dist
USER app
EXPOSE 8080
ENTRYPOINT ["/app/go-admin"]
CMD ["--config", "/app/config/config.yaml"]
