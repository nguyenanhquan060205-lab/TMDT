# frontend/Dockerfile
# ======================================================
# Mục đích: Đóng gói Frontend Next.js thành Docker image
# Dùng multi-stage + standalone output để tối ưu kích thước
# ======================================================

# ----- Stage 1: Build Stage - Build Next.js -----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy file cấu hình để cache npm install
COPY package*.json ./
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Build Next.js (sẽ tạo ra thư mục .next/standalone)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ----- Stage 2: Production Stage - Chạy Next.js standalone -----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone build (chỉ chứa những file cần thiết để chạy)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]