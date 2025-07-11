from functools import lru_cache

from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

from backend.config.config import EMBEDDINGS_MODEL, VECTOR_STORE_DIR


@lru_cache(maxsize=1)
def get_vector_store() -> FAISS:
    if VECTOR_STORE_DIR.exists():
        try:
            return FAISS.load_local(
                VECTOR_STORE_DIR,
                HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL),
                allow_dangerous_deserialization=True,
            )
        except Exception as e:
            raise RuntimeError(f"FAISS の読み込みに失敗しました: {e}")
    else:
        raise FileNotFoundError(
            f"Vector store directory {VECTOR_STORE_DIR} does not exist. 初期化してください。"
        )
