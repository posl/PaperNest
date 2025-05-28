from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.models import Paper
from backend.database.database import get_db
from backend.schema.schema import ResearchThemeDeleteResponseSchema

router = APIRouter()

@router.delete("/research_theme/delete/{research_theme}", response_model=ResearchThemeDeleteResponseSchema)
def delete_papers_by_theme(research_theme: str, db: Session = Depends(get_db)):
    papers = db.query(Paper).filter(Paper.category == research_theme).all()
    
    if not papers:
        raise HTTPException(status_code=404, detail="指定された研究テーマに一致する論文が見つかりませんでした．")
    
    for paper in papers:
        db.delete(paper)
    
    db.commit()
    
    return ResearchThemeDeleteResponseSchema(message="研究テーマの削除が完了しました．")