FROM python:3.10-slim

WORKDIR /workspace/backend

RUN apt-get update && \
    apt-get install -y git curl build-essential libgl1 && \
    rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/workspace

# requirements を先にコピーして pip install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリ全体をコピー
COPY backend/. ./

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
