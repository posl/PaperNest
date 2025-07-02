from backend.database.database import engine, Base
from backend.models.models import User  # 全モデルをimportしておく

Base.metadata.create_all(bind=engine)
# print("✅ テーブルを作成しました")