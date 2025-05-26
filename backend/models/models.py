from sqlalchemy import Column, String, Integer, JSON, UniqueConstraint
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

    __table_args__ = (
        UniqueConstraint("category", "hash", name="uq_category_hash"),
    )