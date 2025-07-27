# import os
import hashlib
import uuid
import asyncio
from typing import Dict, Tuple

import fitz
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables.base import RunnableBinding
from langchain_core.vectorstores.base import VectorStoreRetriever
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from pypdf import PdfReader
from sqlalchemy.orm import Session

from backend.api.db_register.db_register import register_paper
from backend.api.db_register.get_paper_title import get_paper_title
from backend.api.db_register.metadata_fetcher import fetch_metadata
from backend.config.config import (
    BASE_URL,
    CHAT_MODEL,
    EMBEDDINGS_MODEL,
    GROQ_API_KEY,
    UPLOAD_DIR,
    VECTOR_STORE_DIR,
)
from backend.database.database import get_db
from backend.models.models import Paper, User
from backend.schema.schema import PaperSchema, UploadPDFResponseSchema
from backend.utils.security import get_current_user
from backend.utils.vector_store import get_vector_store
from backend.utils.tranalate import translate

router = APIRouter()  # インスタンス作成

# os.environ["TOKENIZERS_PARALLELISM"] = "false"

# GroqのAPI keyを取得
groq_chat = ChatGroq(groq_api_key=GROQ_API_KEY, model_name=CHAT_MODEL)

system_prompt = "You are a helpful assistant. Please respond based on the content of the paper PDF.\n\n{context}"
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)

embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL)

# ベクトルデータベースをロード
# def load_vector_store() -> FAISS:
#     if os.path.exists(VECTOR_STORE_DIR):
#         vector_store = FAISS.load_local(
#             VECTOR_STORE_DIR, embeddings, allow_dangerous_deserialization=True
#         )
#     else:
#         documents = [
#             Document(
#                 page_content="",
#                 metadata={"paper_id": "", "user_id": "", "category": ""},
#             )
#         ]
#         vector_store = FAISS.from_documents(documents, embeddings)

#     return vector_store

# PDFファイルを保存する関数
def save_pdf(pdf_bytes, copy_pdf_path):
    if not UPLOAD_DIR.exists():
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    with open(copy_pdf_path, "wb") as f:
        f.write(pdf_bytes)

# PDFファイルからテキストを抽出
def read_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page_num in range(len(reader.pages)):
        page = reader.pages[page_num]
        text += page.extract_text()
    return text


# PDFのテキストを分割
def split_pdf_text(pdf_text: str) -> Tuple[list, int]:
    # チャンク間でoverlappingさせながらテキストを分割
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=3000,
        chunk_overlap=50,
    )
    # テキストを分割
    splited_text = text_splitter.split_text(pdf_text)
    chunk_count = len(splited_text)
    return splited_text, chunk_count


# テキストを埋め込みベクトルに変換
def embedding_text(
    splited_text: list, pdf_id: str, user_id: int, category: str
) -> FAISS:
    documents = [
        Document(
            page_content=text,
            metadata={"paper_id": pdf_id, "user_id": user_id, "category": category},
        )
        for text in splited_text
    ]

    doc_ids = [f"{pdf_id}_{i}" for i in range(len(splited_text))]
    index = FAISS.from_documents(documents, embedding=embeddings, ids=doc_ids)
    return index


# FaissのRetrieverを取得
def get_retriever(index: FAISS) -> VectorStoreRetriever:
    retriever = index.as_retriever(search_kwargs={"k": 6})
    return retriever


# RAGチェーンを作成
def create_rag_chain(
    retriever: VectorStoreRetriever, chat: ChatGroq, prompt: ChatPromptTemplate
) -> RunnableBinding:
    question_answer_chain = create_stuff_documents_chain(chat, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    return rag_chain


# 論文の要約を生成
def generate_summary(rag_chain: RunnableBinding) -> str:
    user_input = "Read all pages of the PDF and summarize the paper. The output format is as follows.\nSummary: {summary}"
    response = rag_chain.invoke({"input": user_input})
    return response["answer"]


# 起動の確認用エンドポイント
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
    hash_value = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return hash_value

async def prepare_metadata(title: str) -> Tuple[Dict[str, str], bool]:
    openalex = False

    if title is not None:
        metadata, openalex = await fetch_metadata(title)
        # メタデータが取得できていなかった場合，タイトルを追加
        if "error" in metadata:
            metadata["title"] = title
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
    return metadata, openalex

async def prepare_summary(copy_pdf_path: str, pdf_id: str, user_id: int, category: str) -> Tuple[str, int]:
    await asyncio.sleep(0.1)  # 少し待つ

    pdf_text = read_text_from_pdf(str(copy_pdf_path))
    splited_txt, chunk_count = split_pdf_text(pdf_text)
    index = embedding_text(splited_txt, pdf_id, user_id, category)
    # print(index.similarity_search("test", k=1))

    retriever = get_retriever(index)
    rag_chain = create_rag_chain(retriever, groq_chat, prompt)
    summary = await asyncio.to_thread(generate_summary, rag_chain)
    summary = summary.replace("Summary: ", "")
    summary = await asyncio.to_thread(translate, summary, "ja")

    vector_store = get_vector_store()

    vector_store.merge_from(index)

    # ベクトルストアを保存
    vector_store.save_local(VECTOR_STORE_DIR)

    return summary, chunk_count

# PDFをアップロード
# FastAPIのエンドポイント
@router.post("/upload", response_model=UploadPDFResponseSchema)
async def upload_pdf(
    file: UploadFile = File(...),
    category: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # PDFのバリデーション
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    pdf_bytes = await file.read()

    # PDFの1ページ目からハッシュ値を計算
    pdf_hash = calculate_first_page_hash(pdf_bytes)
    if pdf_hash is None:
        raise HTTPException(status_code=400, detail="PDFが空です．")

    # 重複チェック：同じカテゴリとハッシュのPDFが既に存在するか？
    existing = (
        db.query(Paper)
        .filter_by(user_id=current_user.id, category=category, hash=pdf_hash)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="このPDFはすでに登録されています．")

    # PDFを保存
    pdf_id = str(uuid.uuid4())
    pdf_url = f"{BASE_URL}/uploaded/{pdf_id}.pdf"

    copy_pdf_path = UPLOAD_DIR / f"{pdf_id}.pdf"

    save_pdf(pdf_bytes, copy_pdf_path)

    title = get_paper_title(copy_pdf_path)

    metadata_task = asyncio.create_task(prepare_metadata(title))
    summary_task = asyncio.create_task(prepare_summary(copy_pdf_path, pdf_id, current_user.id, category))

    # 並列に実行
    (summary, chunk_count), (metadata, openalex) = await asyncio.gather(
        summary_task,
        metadata_task
    )

    metadata.update(
        {
            "pdf_id": pdf_id,
            "pdf_url": pdf_url,
            "summary": summary,
            "category": category,
            "hash": pdf_hash,
            "user_id": current_user.id,
            "chunk_count": chunk_count,
        }
    )
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
        summary=metadata.get("summary"),
        user_id=metadata.get("user_id"),
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
        if not openalex:
            if metadata.get("conference") is None:
                missing_fields.append("会議/ジャーナル名")
        if metadata.get("bibtex") is None:
            missing_fields.append("BibTeX")
        if metadata.get("citations") is None:
            missing_fields.append("被引用数")
        if not openalex:
            if metadata.get("core_rank") in ["Unknown", "Not found", "Error"]:
                missing_fields.append("COREランク")


        # 失敗項目がある場合は、それを列挙してメッセージを作成
        if missing_fields:
            failed_info = ", ".join(missing_fields)
            response = UploadPDFResponseSchema(
                success=False,
                message=f"{failed_info} の取得に失敗しました．",
                data=final_data,
            )
        else:
            response = UploadPDFResponseSchema(
                success=True,
                message="PDFの登録が完了しました．",
                data=final_data,
            )

    # print(response)
    return response


# PDFを開く
@router.get("/uploaded/{paper_id}.pdf")
async def get_pdf(paper_id: str):
    pdf_path = UPLOAD_DIR / f"{paper_id}.pdf"

    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDFが見つかりません．")

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{paper_id}.pdf",
        headers={"Content-Disposition": f"inline; filename={paper_id}.pdf"},
    )
