import os
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.models.models import Paper
from backend.database.database import get_db
from backend.schema.schema import ResearchThemeDeleteResponseSchema
from backend.config import UPLOAD_DIR

router = APIRouter()

@router.delete(
    "/research_theme/delete/{research_theme}",
    response_model=ResearchThemeDeleteResponseSchema,
)
def delete_papers_by_theme(
    research_theme: str,
    user_id: int = Query(..., description="削除対象のユーザーID"),
    db: Session = Depends(get_db)
):
    # ユーザーに紐づいた指定テーマの論文だけを取得
    papers = db.query(Paper).filter(
        Paper.category == research_theme,
        Paper.user_id == user_id
    ).all()

    if not papers:
        raise HTTPException(
            status_code=404,
            detail="指定された研究テーマに一致する論文が見つかりませんでした．"
        )
    
    for paper in papers:
        # PDFファイル削除処理
        pdf_path = os.path.join(UPLOAD_DIR, f"{paper.paper_id}.pdf")
        if os.path.exists(pdf_path):
            try:
                os.remove(pdf_path)
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"PDFファイルの削除中にエラーが発生しました（paper_id: {paper.paper_id}）: {e}"
                )

        # データベースから削除
        db.delete(paper)

    db.commit()
    
    return ResearchThemeDeleteResponseSchema(
        message="研究テーマの削除が完了しました．"
    )