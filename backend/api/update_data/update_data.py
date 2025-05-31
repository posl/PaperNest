from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.models import Paper
from backend.database.database import get_db
from backend.schema.schema import PaperUpdateRequestSchema, PaperUpdateResponseSchema

router = APIRouter()

@router.put("/papers/update", response_model=PaperUpdateResponseSchema)
def update_paper_field(update_request: PaperUpdateRequestSchema, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.paper_id == update_request.paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="論文が見つかりません")

    if update_request.field not in paper.__dict__:
        raise HTTPException(status_code=400, detail="フィールドが存在しません")

    setattr(paper, update_request.field, update_request.value)
    db.commit()

    return PaperUpdateResponseSchema(message="データの更新が完了しました．")