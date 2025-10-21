import os
from pathlib import Path

from dotenv import load_dotenv

TOP_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = TOP_DIR / "upload"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
VECTOR_STORE_DIR = Path(__file__).resolve().parent.parent.parent / "faiss_index"

BASE_URL = "http://127.0.0.1:8000"

EMBEDDINGS_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
CHAT_MODEL = "llama-3.3-70b-versatile"

# GroqのAPI keyを取得
load_dotenv()
GROQ_API_KEY = os.environ["GROQ_API_KEY"]
