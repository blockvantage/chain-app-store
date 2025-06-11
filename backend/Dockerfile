FROM golang:1.23-alpine AS builder

WORKDIR /build
COPY . .
RUN go mod download
RUN go build -o app-backend ./main.go

FROM alpine:3.18
RUN apk add --no-cache sqlite
WORKDIR /app
COPY --from=builder /build/app-backend .

# Create required directories with correct permissions
RUN mkdir -p /data/images && \
    mkdir -p /data && \
    touch /data/appstore.db && \
    chown -R nobody:nobody /data && \
    chmod -R 777 /data

# Switch to non-root user
USER nobody

EXPOSE 8080
CMD ["./app-backend"]
