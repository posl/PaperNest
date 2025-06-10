from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.models import Paper, User
from backend.database.database import get_db
from backend.schema.schema import ResearchThemeUpdateRequestSchema, ResearchThemeUpdateResponseSchema
from backend.utils.security import get_current_user

router = APIRouter()

@router.put("/research_theme/update", response_model=ResearchThemeUpdateResponseSchema)
def update_research_theme(request: ResearchThemeUpdateRequestSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # value1（旧テーマ名）に一致するデータを取得
    papers_to_update = db.query(Paper).filter(Paper.category == request.old_research_theme, Paper.user_id == current_user.id).all()
    
    if not papers_to_update:
        raise HTTPException(status_code=404, detail="該当する研究テーマが見つかりませんでした．")
    
    # 一括で更新
    for paper in papers_to_update:
        paper.category = request.new_research_theme
    
    db.commit()

    return ResearchThemeUpdateResponseSchema(message="研究テーマ名の更新が完了しました．")