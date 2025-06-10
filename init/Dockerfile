FROM golang:1.21-alpine as builder

WORKDIR /build
COPY . .
RUN go mod download
RUN go build -o init-app ./main.go

FROM alpine:3.18

WORKDIR /app
COPY --from=builder /build/init-app .

CMD ["./init-app"]
