from db_register.get_pdf import analyze_pdf_from_bytes
from db_register.metadata_fetcher import fetch_metadata
from db_register.db_register import register_paper
from pydantic import BaseModel

# レスポンススキーマ
class UploadPDFResponseSchema(BaseModel):
    success: bool
    message: str
    pdf_url: str

def main():
    pdf = "/Users/yukitoi/Desktop/develop/UNTKT/backend/pdf/Web_application_for_automatic_code_generator_using_a_structured_flowchart.pdf"
    category = "category1"
    with open(pdf, "rb") as f:
        pdf_bytes = f.read()
        pdf_info = analyze_pdf_from_bytes(pdf_bytes)
        print(pdf_info)
    # pdf_info = {"pdf_url": "hoge", "title": "fuga", "summary": "hogefuga"} # テスト用
    title = pdf_info["title"]
    # title = "Using Gameplay Videos for Detecting Issues in Video Games" # テスト用
    if title is not None:
        metadata = fetch_metadata(title)
    else:
        metadata = {
            "title": None,
            "authors": None,
            "year": None,
            "conference": None,
            "bibtex": None,
            "citations": None,
            "core_rank": None,
        }
    metadata.update(pdf_info)
    metadata["category"] = category
    suc_or_fai = "failure"
    suc_or_fai = register_paper(metadata)
    if suc_or_fai == "failure":
        response = UploadPDFResponseSchema(
            success=False,
            message="登録中にエラーが発生しました．",
            pdf_url=pdf_info["pdf_url"]
        )
    elif suc_or_fai == "success":
        # 個別の項目が取得できているかチェック
        missing_fields = []
        if metadata.get("title") is None:
            missing_fields.append("タイトル")
        if metadata.get("authors") is None or not metadata["authors"]:
            missing_fields.append("著者情報")
        if metadata.get("year") is None:
            missing_fields.append("出版年")
        if metadata.get("conference") is None:
            missing_fields.append("会議/ジャーナル名")
        if metadata.get("bibtex") is None:
            missing_fields.append("BibTeX")
        if metadata.get("citations") is None:
            missing_fields.append("被引用数")
        if metadata.get("core_rank") in ["Unknown", "Not found", "Error"]:
            missing_fields.append("COREランク")

        # 失敗項目がある場合は、それを列挙してメッセージを作成
        if missing_fields:
            failed_info = ", ".join(missing_fields)
            response = UploadPDFResponseSchema(
                success=False,
                message=f"{failed_info} の取得に失敗しました。",
                pdf_url=pdf_info["pdf_url"]
            )
        else:
            response = UploadPDFResponseSchema(
                success=True,
                message="PDFの登録が完了しました。",
                pdf_url=pdf_info["pdf_url"]
            )

    print(response)

if __name__ == "__main__":
    main()
