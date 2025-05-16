from pathlib import Path

TOP_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = TOP_DIR / "upload"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
VECTOR_STORE_DIR = Path(__file__).resolve().parent.parent / "faiss_index"

BASE_URL = "http://127.0.0.1:8000"
