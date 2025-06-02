from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.schema.schema import VerifyRequest, VerifyResponse
from backend.models.models import User

router = APIRouter()

@router.post("/reset/verify")
def verify_user(
    request: VerifyRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == request.username).first()

    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません．")

    if user.elementary_school.strip().lower() != request.elementary_school.strip().lower():
        raise HTTPException(status_code=400, detail="秘密の質問の答えが一致しません．")

    # 確認成功 → フロントに「成功」を返すだけ（ユーザー情報は返さない）
    return VerifyResponse(message="ユーザの確認が成功しました．")