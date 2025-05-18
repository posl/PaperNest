import os
import uuid
from typing import Dict

import uvicorn
from dotenv import load_dotenv
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Depends
from fastapi.responses import FileResponse
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables.base import RunnableBinding
from langchain_core.vectorstores.base import VectorStoreRetriever
from langchain_groq import ChatGroq
from pypdf import PdfReader
import fitz
import hashlib
from sqlalchemy.orm import Session

from backend.api.db_register.db_register import register_paper
from backend.api.db_register.metadata_fetcher import fetch_metadata
from backend.models.models import Paper
from backend.database.database import get_db, engine, Base
from backend.config import BASE_URL, UPLOAD_DIR, VECTOR_STORE_DIR
from backend.schema.schema import UploadPDFResponseSchema, PaperSchema

router = APIRouter()  # インスタンス作成


memory_storage: Dict[str, bytes] = {}  # PDFの保存場所

# GroqのAPI keyを取得
load_dotenv()
groq_api_key = os.environ["GROQ_API_KEY"]
groq_chat = ChatGroq(
    groq_api_key=groq_api_key,
    model_name="llama3-70b-8192",
)

system_prompt = "You are a helpful assistant. Please respond based on the content of the paper PDF.\n\n{context}"
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)


# ベクトルデータベースをロード
def load_vector_store() -> FAISS:
    embedding = HuggingFaceEmbeddings(
        model_name="oshizo/sbert-jsnli-luke-japanese-base-lite"
    )
    if os.path.exists(VECTOR_STORE_DIR):
        vector_store = FAISS.load_local(
            VECTOR_STORE_DIR,
            embedding,
            allow_dangerous_deserialization=True,
        )
    else:
        # vector_store = FAISS(
        #     [],
        #     embedding,
        # )
        documents = [Document(page_content="", metadata={"source": ""})]
        vector_store = FAISS.from_documents(documents, embedding)

    return vector_store


# PDFファイルからテキストを抽出
def read_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    # print(reader.pages[0].extract_text())
    text = ""
    for page_num in range(len(reader.pages)):
        page = reader.pages[page_num]
        text += page.extract_text()
    return text


# PDFのテキストを分割
def split_pdf_text(pdf_text: str) -> list:
    # チャンク間でoverlappingさせながらテキストを分割
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=50,
    )
    # テキストを分割
    splited_text = text_splitter.split_text(pdf_text)
    return splited_text


# テキストを埋め込みベクトルに変換
def embedding_text(splited_text: list, pdf_id: str) -> FAISS:
    embeddings = HuggingFaceEmbeddings(
        model_name="oshizo/sbert-jsnli-luke-japanese-base-lite"
    )
    # metadataにPDFのURLを追加
    documents = [
        Document(page_content=text, metadata={"source": pdf_id})
        for text in splited_text
    ]
    index = FAISS.from_documents(documents, embedding=embeddings)
    return index


# FaissのRetrieverを取得
def get_retriever(index: FAISS) -> VectorStoreRetriever:
    retriever = index.as_retriever(search_kwargs={"k": 6})
    return retriever


# RAGチェーンを作成
def create_rag_chain(
    retriever: VectorStoreRetriever, grog_chat: ChatGroq, prompt: ChatPromptTemplate
) -> RunnableBinding:
    question_answer_chain = create_stuff_documents_chain(groq_chat, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    return rag_chain


# 論文のタイトルを生成
def generate_title(rag_chain: RunnableBinding) -> str:
    user_input = "PDFの1ページ目から，論文のタイトルを取得してください．出力形式は，以下です．\nTitle: {title}"
    response = rag_chain.invoke({"input": user_input})
    return response["answer"]


# 論文の要約を生成
def generate_summary(rag_chain: RunnableBinding) -> str:
    user_input = "PDFの全ページを読んで，論文を要約してください．出力形式は，以下です．\nSummary: {summary}"
    response = rag_chain.invoke({"input": user_input})
    return response["answer"]


@router.get("/")
def read_root():
    return {"message": "Hello, FastAPI is running!"}

# 論文1ページ目からハッシュ値を生成
def calculate_first_page_hash(pdf_bytes: bytes) -> str:
    """PDFの1ページ目の内容からハッシュ値を生成"""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    if len(doc) == 0:
        return None  # 空PDF
    page = doc.load_page(0)  # 1ページ目（0-indexed）

    # ページのテキストからハッシュを取る
    text = page.get_text()
    hash_value = hashlib.sha256(text.encode('utf-8')).hexdigest()
    return hash_value

def analyze_pdf_from_bytes(pdf_bytes: bytes) -> Dict[str, str]:
    # PDFを保存
    pdf_id = str(uuid.uuid4())
    pdf_url = f"{BASE_URL}/uploaded/{pdf_id}.pdf"
    memory_storage[pdf_id] = pdf_bytes

    copy_pdf_path = UPLOAD_DIR / f"{pdf_id}.pdf"
    with open(copy_pdf_path, "wb") as f:
        f.write(pdf_bytes)

    pdf_text = read_text_from_pdf(str(copy_pdf_path))
    splited_txt = split_pdf_text(pdf_text)
    index = embedding_text(splited_txt, pdf_id)
    retriever = get_retriever(index)
    rag_chain = create_rag_chain(retriever, groq_chat, prompt)
    title = generate_title(rag_chain).replace("Title: ", "")
    if any(
        phrase in title.lower() for phrase in ["unable to extract", "unable to find"]
    ):
        title = None
    else:
        if (
            "Based on the PDF content" in title
            or "Based on the provided PDF content" in title
        ):
            if "However, I can suggest a possible title:" in title:
                title = title.split("However, I can suggest a possible title:")[
                    -1
                ].strip()
            else:
                title = None  # 適切な提案がなかった場合は None にする

    summary = generate_summary(rag_chain).replace("Summary: ", "")

    # ベクトルデータベースに論文内容を追加
    vector_store = load_vector_store()
    vector_store.merge_from(index)

    # ベクトルデータベースを保存
    vector_store.save_local(VECTOR_STORE_DIR)

    return {"pdf_id": pdf_id, "pdf_url": pdf_url, "title": title, "summary": summary}


# PDFをアップロード
# FastAPIのエンドポイント
@router.post("/upload", response_model=UploadPDFResponseSchema)
async def upload_pdf(
    file: UploadFile = File(...),
    category: str = Form(None),
    db: Session = Depends(get_db),
):
    # 初回のみテーブル作成
    Base.metadata.create_all(bind=engine)
    # PDFのバリデーション
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    pdf_bytes = await file.read()

    # PDFの1ページ目からハッシュ値を計算
    pdf_hash = calculate_first_page_hash(pdf_bytes)
    if pdf_hash is None:
        raise HTTPException(status_code=400, detail="PDFが空です．")
    
    # 重複チェック：同じカテゴリとハッシュのPDFが既に存在するか？
    existing = db.query(Paper).filter_by(category=category, hash=pdf_hash).first()
    if existing:
        raise HTTPException(status_code=409, detail="このPDFはすでに登録されています．")

    # PDFのタイトルと要約を取得
    pdf_info = analyze_pdf_from_bytes(pdf_bytes)
    # print(pdf_info)
    title = pdf_info["title"]

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
    metadata["hash"] = pdf_hash
    suc_or_fai = "failure"
    suc_or_fai = register_paper(metadata)
    final_data = PaperSchema(
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
        summary=metadata.get("summary")
    )
    final_data = final_data.model_dump()

    if suc_or_fai == "failure":
        response = UploadPDFResponseSchema(
            success=False,
            message="登録中にエラーが発生しました．",
            data=final_data,
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
                data=final_data,
            )
        else:
            response = UploadPDFResponseSchema(
                success=True,
                message="PDFの登録が完了しました。",
                data=final_data,
            )

    print(response)
    return response


# PDFを開く
@router.get("/uploaded/{paper_id}.pdf")
async def get_pdf(paper_id: str):
    # pdf_bytes = memory_storage.get(paper_id)
    # # PDFが存在しない場合はエラーを返す
    # if pdf_bytes is None:
    #     raise HTTPException(status_code=404, detail="PDF not found.")
    # # PDFを返す
    # return StreamingResponse(
    #     content=BytesIO(pdf_bytes),
    #     media_type="application/pdf",
    #     headers={"Content-Disposition": f"inline; filename={paper_id}.pdf"},
    # )
    pdf_path = UPLOAD_DIR / f"{paper_id}.pdf"

    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF not found.")

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{paper_id}.pdf",
        headers={"Content-Disposition": f"inline; filename={paper_id}.pdf"},
    )


if __name__ == "__main__":
    uvicorn.run(router, host="0.0.0.0", port=8000)
