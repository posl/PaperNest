from fastapi import FastAPI

from backend.api.db_register.get_pdf import router as get_pdf_router
from backend.api.get_all_papers.get_all_papers import router as get_all_papers_router
from backend.api.vector_search.vector_search import router as vector_search_router

app = FastAPI()

app.include_router(get_pdf_router)
app.include_router(get_all_papers_router)
app.include_router(vector_search_router)
