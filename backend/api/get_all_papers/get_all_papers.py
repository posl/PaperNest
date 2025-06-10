from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.models import Paper, User
from backend.database.database import get_db
from backend.schema.schema import PaperSchema
from backend.utils.security import get_current_user

router = APIRouter()

@router.get("/get_all_papers", response_model=list[PaperSchema])
def get_all_papers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        papers = db.query(Paper).filter(Paper.user_id == current_user.id).all()
        response = [PaperSchema.model_validate(p) for p in papers]
        return response
    except Exception as e:
        print(f"データベースからの取得中にエラーが発生しました: {e}")
        raise HTTPException(status_code=500, detail="データの取得中にエラーが発生しました．")