from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.utils.security import verify_password, hash_password, get_current_user
from backend.schema.schema import PasswordChangeRequest, PasswordChangeResponse
from backend.models.models import User

router = APIRouter()

@router.put("/change/password", response_model=PasswordChangeResponse)
def change_password(
    request: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(request.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="パスワードが違います．")

    current_user.hashed_password = hash_password(request.new_password)
    db.commit()
    return PasswordChangeResponse(message="パスワードを変更しました．")