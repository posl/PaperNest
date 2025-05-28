from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.models import Paper
from backend.database.database import get_db
from backend.schema.schema import ResearchThemeUpdateRequestSchema, ResearchThemeUpdateResponseSchema

router = APIRouter()

@router.put("/research_theme/update", response_model=ResearchThemeUpdateResponseSchema)
def update_research_theme(request: ResearchThemeUpdateRequestSchema, db: Session = Depends(get_db)):
    # value1（旧テーマ名）に一致するデータを取得
    papers_to_update = db.query(Paper).filter(Paper.category == request.value1).all()
    
    if not papers_to_update:
        raise HTTPException(status_code=404, detail="該当する研究テーマが見つかりませんでした．")
    
    # 一括で更新
    for paper in papers_to_update:
        paper.category = request.value2
    
    db.commit()

    return ResearchThemeUpdateResponseSchema(message="研究テーマ名の更新が完了しました．")