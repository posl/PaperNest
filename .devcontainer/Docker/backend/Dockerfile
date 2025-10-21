FROM python:3.10-slim

WORKDIR /workspace/backend

# 基本ツールをインストール
RUN apt-get update && \
    apt-get install -y git curl build-essential libgl1-mesa-glx && \
    rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/workspace

# 依存関係をコピーして先にインストール
COPY Docker/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY . /workspace

# FastAPI起動コマンド（--reload削除）
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
