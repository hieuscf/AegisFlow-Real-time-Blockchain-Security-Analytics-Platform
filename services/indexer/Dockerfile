# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Build — compile static Go binary
# -----------------------------------------------------------------------------
FROM golang:1.22-alpine AS builder

WORKDIR /src

RUN apk add --no-cache ca-certificates git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -trimpath -ldflags="-s -w" -o /out/indexer ./cmd

# -----------------------------------------------------------------------------
# Runtime — minimal image
# -----------------------------------------------------------------------------
FROM alpine:3.20

RUN apk add --no-cache ca-certificates \
    && addgroup -S -g 10001 aegis \
    && adduser -S -u 10001 -G aegis aegis

WORKDIR /app

COPY --from=builder /out/indexer /app/indexer

USER aegis

ENTRYPOINT ["/app/indexer"]
