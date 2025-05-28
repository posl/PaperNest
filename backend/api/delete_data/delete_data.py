import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.models import Paper
from backend.database.database import get_db
from backend.schema.schema import PaperDeleteResponseSchema
from backend.config import UPLOAD_DIR

router = APIRouter()

@router.delete("/papers/delete/{paper_id}", response_model=PaperDeleteResponseSchema)
def delete_paper(paper_id: str, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.paper_id == paper_id).first()
    
    if not paper:
        raise HTTPException(status_code=404, detail="指定された論文は見つかりませんでした．")
    
    # PDFファイル削除処理
    pdf_path = os.path.join(UPLOAD_DIR, f"{paper_id}.pdf")
    if os.path.exists(pdf_path):
        try:
            os.remove(pdf_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDFファイルの削除中にエラーが発生しました: {e}")
    
    # データベースから削除
    db.delete(paper)
    db.commit()
    
    return PaperDeleteResponseSchema(message="論文の削除が完了しました．")