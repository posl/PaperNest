ARG NODE_VER=20
FROM node:${NODE_VER} AS build

WORKDIR /workspace/frontend

# package.json だけ先にコピーして依存関係インストール
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --legacy-peer-deps

# ソースコード全コピー（index.html 含む）
COPY frontend/. ./

# Vite ビルド
RUN npm run build

# 本番用 nginx
FROM nginx:stable-alpine
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
