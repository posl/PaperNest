FROM python:3.10-slim

WORKDIR /workspace/backend

RUN apt-get update && \
    apt-get install -y git curl build-essential libgl1 && \
    rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/workspace

# Copy requirements and install during build
COPY Docker/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Command to run the application
CMD ["sh", "-c", "cd /workspace && python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"]
