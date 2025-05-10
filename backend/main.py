from fastapi import FastAPI
from backend.db_register.get_pdf import router as get_pdf_router
from backend.get_all_papers.get_all_papers import router as get_all_papers_router

app = FastAPI()

app.include_router(get_pdf_router)
app.include_router(get_all_papers_router)
