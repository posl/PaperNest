from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from backend.config import UPLOAD_DIR

router = APIRouter()  # インスタンス作成


# PDFを開く
@router.get("/uploaded/{paper_id}.pdf")
async def get_pdf(paper_id: str):
    pdf_path = UPLOAD_DIR / f"{paper_id}.pdf"

    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF not found.")

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{paper_id}.pdf",
        headers={"Content-Disposition": f"inline; filename={paper_id}.pdf"},
    )
