from fastapi import FastAPI
from backend.database.database import engine
from backend.models.models import Base

from backend.api.auth.register import router as register_router
from backend.api.auth.login import router as login_router
from backend.api.auth.refresh import router as refresh_router
from backend.api.auth.get_user_info import router as get_user_info_router
from backend.api.auth.change_password import router as change_password_router
from backend.api.auth.delete_user import router as delete_user_router
from backend.api.auth.reset_password.verify_user import router as verify_user_router
from backend.api.auth.reset_password.reset_password import router as reset_password_router
from backend.api.auth.change_user_name import router as change_user_name_router
from backend.api.db_register.upload_pdf import router as upload_pdf_router
from backend.api.get_all_papers.get_all_papers import router as get_all_papers_router
from backend.api.vector_search.vector_search import router as vector_search_router
from backend.api.update_data.update_data import router as update_data_router
from backend.api.delete_data.delete_data import router as delete_data_router
from backend.api.update_research_theme.update_research_theme import router as update_research_theme_router
from backend.api.delete_research_theme.delete_research_theme import router as delete_research_theme_router
from fastapi.middleware.cors import CORSMiddleware

# テーブル作成（初回のみ必要）
Base.metadata.create_all(bind=engine)

app = FastAPI()

# 👇 CORSを設定：Reactからのアクセスを許可する
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ← ReactのURL
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
app.include_router(get_all_papers_router)
app.include_router(vector_search_router)
app.include_router(update_data_router)
app.include_router(delete_data_router)
app.include_router(update_research_theme_router)
app.include_router(delete_research_theme_router)



