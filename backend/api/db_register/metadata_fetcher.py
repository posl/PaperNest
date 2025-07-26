import httpx
import pandas as pd
import re
from difflib import SequenceMatcher
import os

# API URL（タイトル検索用）
CROSSREF_API_URL = "https://api.crossref.org/works"
OPENALEX_API_URL = "https://api.openalex.org/works"

# メタデータを取得する関数
async def fetch_metadata(title: str) -> dict:
    metadata, openalex = await fetch_metadata_from_crossref(title)
    # print(f"Metadata fetched: {metadata}")

    if "error" in metadata:
        return metadata, openalex

    bibtex = None
    core_rank = "Unknown"
    acronym = "unknown"
    if not openalex:
        doi = metadata.get("doi")

        if doi:
            bibtex = await fetch_bibtex_from_doi(doi)
            # print(f"BibTeX fetched: {bibtex}")

            # bibtexのフィールドから会議かジャーナルかを判定
            entry_type = extract_bibtex_type(bibtex)

            # コアランクと会議略称（bibtex整形用）を取得
            core_rank, acronym = get_core_rank_and_acronym(metadata.get("conference", ""), entry_type)

            # ラベルの書き換え
            if metadata.get("authors") and metadata.get("year"):
                for author in metadata["authors"]:
                    if author != '':
                        bibtex = rewrite_bibtex_label(bibtex, metadata["authors"][0], metadata["year"], acronym)
                        if acronym != "unknown":
                            metadata["conference"] = acronym
                        break

    else:
        bibtex = fetch_bibtex_openalex(metadata)

    final_metadata = {
        "title": metadata.get("title"),
        "authors": metadata.get("authors"),
        "year": metadata.get("year"),
        "conference": metadata.get("conference"),
        "bibtex": bibtex,
        "citations": metadata.get("citations"),
        "core_rank": core_rank
    }

    return final_metadata, openalex


def preprocess(text: str) -> str:
    # 英数字のみを抽出（スペースや記号を削除）
    return re.sub(r'[^a-zA-Z0-9]', '', text.lower())

def preprocess_not_lower(text: str) -> str:
    # 英数字のみを抽出（スペースや記号を削除）
    return re.sub(r'[^a-zA-Z0-9]', '', text)

# 類似度計算（完全一致に近い比較）
def similarity(t1: str, t2: str) -> float:
    return SequenceMatcher(None, preprocess(t1), preprocess(t2)).ratio()

# OpenAlex fallback
async def fetch_metadata_from_openalex(title: str, similarity_threshold: float) -> dict:
    params = {
        "search": title,
        "per-page": 3
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(OPENALEX_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])

        if not results:
            return {"error": "No data found in OpenAlex."}

        best_item = None
        best_score = -1.0

        for item in results:
            item_title = item.get("title", "")
            # print(f"[OpenAlex] Evaluating item: {item_title}")
            score = similarity(title, item_title)
            # print(f"[OpenAlex] Similarity score for '{item_title}': {score}")

            if (
                score > best_score or
                (score == best_score and best_item and is_newer_openalex(item, best_item))
            ):
                best_item = item
                best_score = score

        if best_item and best_score >= similarity_threshold:
            return {
                "title": best_item.get("title"),
                "authors": [a.get("author", {}).get("display_name", "") for a in best_item.get("authorships", [])],
                "year": best_item.get("publication_year"),
                "conference": best_item.get("host_venue", {}).get("display_name"),
                "citations": best_item.get("cited_by_count"),
                "doi": best_item.get("doi")
            }
        else:
            return {"error": "No matching paper in OpenAlex."}

    except httpx.RequestError as e:
        return {"error": f"OpenAlex request failed: {e}"}
    
def is_newer_openalex(item1, item2):
    # "publication_date": "2023-05-15"
    date1 = item1.get("publication_date", "")
    date2 = item2.get("publication_date", "")
    return date1 > date2

async def fetch_metadata_from_crossref(title: str, similarity_threshold=0.95) -> dict:
    params = {
        "query.title": title,
        "rows": 3,
        "sort": "score"
    }

    headers = {
        "User-Agent": "MyResearchBot/1.0"
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(CROSSREF_API_URL, params=params, headers=headers)
        response.raise_for_status()

        data = response.json()
        items = data.get("message", {}).get("items", [])

        if not items:
            # print("No items found in Crossref, using OpenAlex.")
            return await fetch_metadata_from_openalex(title, similarity_threshold), True

        best_item = None
        best_score = -1.0

        for item in items:
            item_title = item.get("title", [None])[0]
            if not item_title or item.get("type") == "posted-content":
                continue

            # print(f"[Crossref] Evaluating item: {item_title}")
            score = similarity(title, item_title)
            # print(f"[Crossref] Similarity score for '{item_title}': {score}")

            if (score > best_score or
                (score == best_score and best_item and is_newer_crossref(item, best_item))):
                best_item = item
                best_score = score

        if best_score < similarity_threshold:
            # print(f"Low similarity ({best_score}) in Crossref. Trying OpenAlex...")
            return await fetch_metadata_from_openalex(title, similarity_threshold), True

        if best_item:
            return {
                "title": best_item.get("title", [None])[0],
                "authors": [f"{a.get('given', '')} {a.get('family', '')}".strip() for a in best_item.get("author", [])],
                "year": best_item.get("issued", {}).get("date-parts", [[None]])[0][0],
                "conference": best_item.get("container-title", [None])[0],
                "citations": best_item.get("is-referenced-by-count"),
                "doi": best_item.get("DOI")
            }, False
        else:
            return {"error": "No matching paper with a valid title."}, False

    except httpx.RequestError as e:
        return {"error": f"Request failed: {e}"}, False
    
# 論文発行日の比較関数
def is_newer_crossref(item1, item2):
    """Return True if item1 is more recent than item2 (compare year, month, day)."""
    date1 = item1.get("issued", {}).get("date-parts", [[0]])[0]
    date2 = item2.get("issued", {}).get("date-parts", [[0]])[0]

    # 年・月・日の3要素に揃える（足りない部分は0で埋める）
    date1_full = tuple(date1 + [0] * (3 - len(date1)))
    date2_full = tuple(date2 + [0] * (3 - len(date2)))

    return date1_full > date2_full

# DOIからBibTeXを取得
async def fetch_bibtex_from_doi(doi: str) -> str:
    headers = {
        "User-Agent": "MyResearchBot/1.0"
    }

    url = f"https://api.crossref.org/works/{doi}/transform/application/x-bibtex"

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, headers=headers)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error fetching BibTeX via DOI: {e}")
        return None

# BibTeXエントリのタイプを抽出（@article, @inproceedingsなど）
def extract_bibtex_type(bibtex: str) -> str:
    bibtex = bibtex.lstrip()  # 先頭の空白・改行を削除
    match = re.match(r"@(\w+)\{", bibtex)
    if match:
        return match.group(1).lower()
    return ""

# コアランクと会議略称を返す関数
def get_core_rank_and_acronym(conference_name: str, entry_type: str) -> tuple[str, str]:
    base_dir = os.path.dirname(os.path.abspath(__file__))

    csv_path = os.path.join(
        base_dir,
        "conference_core_rank.csv" if entry_type == "inproceedings" else "journal_core_rank.csv"
    )

    try:
        df = pd.read_csv(csv_path)
        df = df.dropna(subset=['Title', 'Acronym'])

        normalized_conf_name = preprocess(conference_name)
        normalized_conf_name_not_lower = preprocess_not_lower(conference_name)

        for _, row in df.iterrows():
            title = preprocess(str(row['Title']))
            acronym = row['Acronym']

            if title in normalized_conf_name or acronym in normalized_conf_name_not_lower:
                return row.get('Rank', 'Unknown'), row.get('Acronym', 'unknown')

        return "Unknown", "unknown"

    except Exception as e:
        print(f"Error loading rank CSV: {e}")
        return "Error", "unknown"

# BibTeXラベルを筆頭著者+年+会議略称に書き換える
def rewrite_bibtex_label(bibtex_str: str, author: str, year: int, acronym: str) -> str:
    if not bibtex_str or acronym == "unknown":
        return bibtex_str

    last_name = author.strip().split()[-1]
    new_label = f"{last_name}{year}{acronym}"

    # @type{oldlabel, を @type{newlabel, に置換
    return re.sub(r'(@\w+\{)[^,]+', r'\1' + new_label, bibtex_str, count=1)

def fetch_bibtex_openalex(metadata: dict) -> str:
    authors = metadata.get("authors", [])
    if authors:
        first_author = authors[0]
        first_author_surname = first_author.split()[-1].lower()
    else:
        first_author_surname = "anonymous"

    year = str(metadata.get("year") or "xxxx").strip()
    title = (metadata.get("title") or "").strip()
    conference = metadata.get("conference")
    doi = (metadata.get("doi") or "").strip()

    def format_author(name: str) -> str:
        parts = name.strip().split()
        if len(parts) >= 2:
            given = " ".join(parts[:-1])
            family = parts[-1]
            return f"{family}, {given}"
        return name.strip()

    formatted_authors = [format_author(a) for a in authors]
    bibtex_authors = " and ".join(formatted_authors)

    bibtex_id = f"{first_author_surname}{year}"

    bibtex_lines = [
        f"@article{{{bibtex_id}}},",
        f"  title={{{title}}},",
        f"  author={{{bibtex_authors}}},",
        f"  year={{{year}}},"
    ]

    if conference:
        bibtex_lines.append(f"  booktitle={{{conference.strip()}}},")

    if doi:
        bibtex_lines.append(f"  doi={{{doi}}}")

    bibtex_lines.append("}")

    return "\n".join(bibtex_lines)

# メイン関数（テスト用）
if __name__ == "__main__":
    title = "Using Gameplay Videos for Detecting Issues in Video Games"
    # タイトルからメタデータを取得
    metadata = fetch_metadata(title)
    # print(f"\nFinal metadata with core rank:\n{metadata}")
