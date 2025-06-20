from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_huggingface.embeddings import HuggingFaceEmbeddings

from backend.api.auth.change_password import router as change_password_router
from backend.api.auth.change_user_name import router as change_user_name_router
from backend.api.auth.delete_user import router as delete_user_router
from backend.api.auth.get_user_info import router as get_user_info_router
from backend.api.auth.login import router as login_router
from backend.api.auth.refresh import router as refresh_router
from backend.api.auth.register import router as register_router
from backend.api.auth.reset_password.reset_password import (
    router as reset_password_router,
)
from backend.api.auth.reset_password.verify_user import router as verify_user_router
from backend.api.db_register.upload_pdf import router as upload_pdf_router
from backend.api.db_register.view_pdf import router as view_pdf_router
from backend.api.delete_data.delete_data import router as delete_data_router
from backend.api.delete_research_theme.delete_research_theme import (
    router as delete_research_theme_router,
)
from backend.api.get_all_papers.get_all_papers import router as get_all_papers_router
from backend.api.query.pdf_query import router as pdf_query_router
from backend.api.update_data.update_data import router as update_data_router
from backend.api.update_research_theme.update_research_theme import (
    router as update_research_theme_router,
)
from backend.api.vector_search.vector_search import router as vector_search_router
from backend.config.config import EMBEDDINGS_MODEL, VECTOR_STORE_DIR
from backend.database.database import engine
from backend.models.models import Base


def initialize_vector_store():
    if not VECTOR_STORE_DIR.exists():
        VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
        print("ベクトルストア初期化中...")
        embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL)
        documents = [
            Document(
                page_content="",
                metadata={"paper_id": "", "user_id": "", "category": ""},
            )
        ]
        vector_store = FAISS.from_documents(documents, embeddings)
        vector_store.save_local(VECTOR_STORE_DIR)
        print("ベクトルストア初期化完了")


@asynccontextmanager
async def startup_event(app: FastAPI):
    initialize_vector_store()
    yield


# テーブル作成（初回のみ必要）
Base.metadata.create_all(bind=engine)
print("データベースのテーブルを作成しました。")

app = FastAPI(lifespan=startup_event)

# 👇 CORSを設定：Reactからのアクセスを許可する
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",          # 開発用
        "http://192.168.35.242",          # 本番用 (ポート80で公開してるのでポート番号なしでOK)
        "http://192.168.35.242:80",       # 念のため明示的にも追加
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(register_router)
app.include_router(login_router)
app.include_router(refresh_router)
app.include_router(get_user_info_router)
app.include_router(change_password_router)
app.include_router(delete_user_router)
app.include_router(verify_user_router)
app.include_router(reset_password_router)
app.include_router(change_user_name_router)
app.include_router(upload_pdf_router)
app.include_router(view_pdf_router)
app.include_router(get_all_papers_router)
app.include_router(vector_search_router)
app.include_router(pdf_query_router)
app.include_router(update_data_router)
app.include_router(delete_data_router)
app.include_router(update_research_theme_router)
app.include_router(delete_research_theme_router)
