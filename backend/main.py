from fastapi import FastAPI

from backend.api.db_register.get_pdf import router as get_pdf_router
from backend.api.get_all_papers.get_all_papers import router as get_all_papers_router
from backend.api.vector_search.vector_search import router as vector_search_router
from backend.api.update_data.update_data import router as update_data_router
from backend.api.delete_data.delete_data import router as delete_data_router
from backend.api.update_research_theme.update_research_theme import router as update_research_theme_router
from backend.api.delete_research_theme.delete_research_theme import router as delete_research_theme_router

app = FastAPI()

app.include_router(get_pdf_router)
app.include_router(get_all_papers_router)
app.include_router(vector_search_router)
app.include_router(update_data_router)
app.include_router(delete_data_router)
app.include_router(update_research_theme_router)
app.include_router(delete_research_theme_router)


