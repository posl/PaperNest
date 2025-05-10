from fastapi import APIRouter
from backend.models.models import Paper
from backend.database.database import SessionLocal
from backend.schema.schema import PaperSchema

router = APIRouter()

@router.get("/get_all_papers", response_model=list[PaperSchema])
def get_all_papers():
    db = SessionLocal()
    try:
        papers = db.query(Paper).all()
        response = [PaperSchema.model_validate(p) for p in papers]
        return response
    except Exception as e:
        print(f"データベースからの取得中にエラーが発生しました: {e}")
        return []
    finally:
        db.close()