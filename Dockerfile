# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS web-build
WORKDIR /build/web
COPY web/package.json web/yarn.lock ./
RUN yarn install --non-interactive
COPY web/ ./
RUN yarn build

FROM golang:1.25.5-alpine AS server-build
WORKDIR /build/server
# 前端构建完成后，再开始后端构建。
COPY --from=web-build /build/server/dist ./dist
# 使用发布的 Go 依赖，不依赖本地工作区。
COPY server/ ./
RUN go mod tidy
RUN CGO_ENABLED=0 go build -mod=readonly -trimpath -ldflags="-s -w" -o /out/go-admin .

FROM alpine:3.22 AS runtime
RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S -g 10001 app \
    && adduser -S -D -H -u 10001 -G app app \
    && mkdir -p /app \
    && chown -R app:app /app
WORKDIR /app
COPY --from=server-build --chown=app:app /out/go-admin ./go-admin
COPY --from=server-build --chown=app:app /build/server/dist ./dist
COPY --chown=app:app --chmod=600 server/config.yaml ./config.yaml
USER app
EXPOSE 8080
ENTRYPOINT ["/app/go-admin"]
CMD ["--config", "/app/config.yaml"]
