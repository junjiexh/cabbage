# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy source code first
COPY . .

# Download dependencies and build
RUN go mod tidy && \
    go mod download && \
    go mod verify && \
    CGO_ENABLED=0 GOOS=linux go build -o /app/server ./cmd/api

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]
