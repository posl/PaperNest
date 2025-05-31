from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.models.models import User
from backend.schema.schema import UserCreate, UserOut
from backend.utils.security import hash_password

router = APIRouter()

@router.post("/register/user", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="そのユーザネームはすでに使用されています．")

    hashed_pw = hash_password(user_data.password)
    new_user = User(username=user_data.username, elementary_school=user_data.elementary_school, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user