FROM golang:1.23-alpine AS builder

WORKDIR /build
COPY . .
RUN go mod download
RUN go build -o app-backend ./main.go

FROM alpine:3.18

WORKDIR /app
COPY --from=builder /build/app-backend .

EXPOSE 8080
CMD ["./app-backend"]
