# backend/Dockerfile
# ======================================================
# Mục đích: Đóng gói Backend Express + TypeScript thành Docker image
# ======================================================

# ----- Stage 1: Build Stage - Biên dịch TypeScript sang JavaScript -----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy file cấu hình trước để tận dụng Docker cache layer
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# Copy source code và biên dịch
COPY src ./src
RUN npm run build

# ----- Stage 2: Production Stage - Image tối giản để chạy -----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Chỉ cài dependencies cần thiết cho production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy code đã build từ stage 1
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]
