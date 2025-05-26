from sqlalchemy.orm import Session
from backend.database.database import SessionLocal
from backend.models.models import Paper

# from metadata_fetcher import fetch_metadata

def register_paper(metadata: dict) -> str:
    db: Session = SessionLocal()

    try:
        paper = Paper(
            paper_id=metadata.get("pdf_id"),
            title=metadata.get("title"),
            authors=metadata.get("authors"),
            year=metadata.get("year"),
            conference=metadata.get("conference"),
            bibtex=metadata.get("bibtex"),
            citations=metadata.get("citations"),
            core_rank=metadata.get("core_rank"),
            pdf_url=metadata.get("pdf_url"),
            category=metadata.get("category"),
            summary=metadata.get("summary"),
            hash=metadata.get("hash"),
        )

        db.add(paper)
        db.commit()

        return "success"

    except Exception as e:
        db.rollback()
        print(f"[ERROR] 登録中にエラーが発生しました: {e}")
        return "failure"

    finally:
        db.close()


# if __name__ == "__main__":
#     title = "Using Gameplay Videos for Detecting Issues in Video Games"
#     metadata = fetch_metadata(title)

#     metadata["pdf_url"] = "http://example.com/paper.pdf"
#     metadata["category"] = "ゲームバグ検出"
#     metadata["summary"] = "この論文はゲームプレイ映像を用いてバグ検出を行う手法を提案しています。"

#     response = register_paper(metadata)
#     print(json.dumps(response.model_dump(), indent=2, ensure_ascii=False))
