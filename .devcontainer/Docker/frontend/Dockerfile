ARG NODE_VER
FROM node:${NODE_VER}

WORKDIR /workspace/frontend

RUN mkdir -p node_modules && chown -R node:node /workspace/frontend

USER node

# ポートを3000に変更
ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["sh", "-c", "cd /workspace/frontend && npm install && npm run dev -- --host 0.0.0.0 --port 3000"]