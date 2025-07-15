from sqlalchemy import Column, String, Integer, JSON, UniqueConstraint, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.database.database import Base


class Paper(Base):
    __tablename__ = "papers"

    paper_id = Column(String, primary_key=True)
    title = Column(String, nullable=True)
    authors = Column(JSON)  # Store as JSON array
    year = Column(Integer)
    conference = Column(String)
    bibtex = Column(String)
    citations = Column(Integer)
    core_rank = Column(String)
    pdf_url = Column(String, nullable=False)
    category = Column(String)
    summary = Column(String)
    hash = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_count = Column(Integer, nullable=True)
    uploader = relationship("User", back_populates="papers", passive_deletes=True)

    __table_args__ = (
        UniqueConstraint("user_id", "category", "hash", name="uq_user_category_hash"),
        Index("idx_user_category", "user_id", "category"),
    )

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    elementary_school = Column(String)
    hashed_password = Column(String)
    papers = relationship("Paper", back_populates="uploader", cascade="all, delete-orphan")