# ===== Build Stage =====
FROM node:20 AS build
WORKDIR /workspace/frontend

COPY Docker/frontend/package*.json ./
RUN npm ci

COPY Docker/frontend ./
RUN npm run build

# ===== Production Stage =====
FROM nginx:alpine
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html

# Nginxデフォルト設定を上書き（必要なら）
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
