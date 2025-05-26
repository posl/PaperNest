import httpx
import pandas as pd
import re
import difflib
import os

# Crossref API URL（タイトル検索用）
API_URL = "https://api.crossref.org/works"

# メタデータを取得する関数
def fetch_metadata(title: str) -> dict:
    metadata = fetch_metadata_from_title(title)
    print(f"Metadata fetched: {metadata}")

    if "error" in metadata:
        return metadata

    doi = metadata.get("doi")
    bibtex = None
    core_rank = "Unknown"
    acronym = "unknown"

    if doi:
        bibtex = fetch_bibtex_from_doi(doi)
        print(f"BibTeX fetched: {bibtex}")

        # bibtexのフィールドから会議かジャーナルかを判定
        entry_type = extract_bibtex_type(bibtex)

        # コアランクと会議略称（bibtex整形用）を取得
        core_rank, acronym = get_core_rank_and_acronym(metadata.get("conference", ""), entry_type)

        # ラベルの書き換え
        if metadata.get("authors") and metadata.get("year"):
            for author in metadata["authors"]:
                if author != '':
                    bibtex = rewrite_bibtex_label(bibtex, metadata["authors"][0], metadata["year"], acronym)
                    break

    final_metadata = {
        "title": metadata.get("title"),
        "authors": metadata.get("authors"),
        "year": metadata.get("year"),
        "conference": metadata.get("conference"),
        "bibtex": bibtex,
        "citations": metadata.get("citations"),
        "core_rank": core_rank
    }

    return final_metadata

# タイトルからCrossref APIを使ってメタデータ取得
def fetch_metadata_from_title(title: str) -> dict:
    params = {
        "query.title": title,
        "rows": 5,
        "sort": "score" #一致度の高いもの5件
    }

    headers = {
        "User-Agent": "MyResearchBot/1.0"
    }

    try:
        response = httpx.get(API_URL, params=params, headers=headers, timeout=10)
        response.raise_for_status()

        data = response.json()
        items = data.get("message", {}).get("items", [])

        # 会議・ジャーナル論文を優先して選ぶ
        for item in items:
            if item.get("type") != "posted-content":  # arXiv等ではない
                return {
                    "title": item.get("title", [None])[0],
                    "authors": [f"{a.get('given', '')} {a.get('family', '')}".strip() for a in item.get("author", [])],
                    "year": item.get("issued", {}).get("date-parts", [[None]])[0][0],
                    "conference": item.get("container-title", [None])[0],
                    "citations": item.get("is-referenced-by-count"),
                    "doi": item.get("DOI")
                }

        # フォールバック（すべて posted-content だった場合）
        if items:
            item = items[0]
            return {
                "title": item.get("title", [None])[0],
                "authors": [f"{a.get('given', '')} {a.get('family', '')}".strip() for a in item.get("author", [])],
                "year": item.get("issued", {}).get("date-parts", [[None]])[0][0],
                "conference": item.get("container-title", [None])[0],
                "citations": item.get("is-referenced-by-count"),
                "doi": item.get("DOI")
            }
        else:
            return {"error": "No data found for the given title."}

    except httpx.RequestError as e:
        return {"error": f"Request failed: {e}"}

# DOIからBibTeXを取得
def fetch_bibtex_from_doi(doi: str) -> str:
    headers = {
        "User-Agent": "MyResearchBot/1.0"
    }

    url = f"https://api.crossref.org/works/{doi}/transform/application/x-bibtex"

    try:
        response = httpx.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error fetching BibTeX via DOI: {e}")
        return None

# BibTeXエントリのタイプを抽出（@article, @inproceedingsなど）
def extract_bibtex_type(bibtex: str) -> str:
    match = re.match(r"@(\w+)\{", bibtex)
    if match:
        return match.group(1).lower()
    return ""

# コアランクと会議略称を返す関数
def get_core_rank_and_acronym(conference_name: str, entry_type: str) -> tuple[str, str]:
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # 会議の場合はconference_core_rank.csv，ジャーナルの場合はjournal_core_rank.csvを読み込む
    csv_path = os.path.join(base_dir, "conference_core_rank.csv") if entry_type == "inproceedings" else os.path.join(base_dir, "journal_core_rank.csv")
    try:
        df = pd.read_csv(csv_path)
        titles = df['Title'].dropna().astype(str)

        # Title列を検索して会議名と一致すれば取得
        matched_row = df[titles.str.lower() == conference_name.lower()]
        if not matched_row.empty:
            row = matched_row.iloc[0]
            return row.get('Rank', 'Unknown'), row.get('Acronym', 'unknown')

        # Titleとの類似度が高いものを取得
        close_matches = difflib.get_close_matches(conference_name, titles, n=1, cutoff=0.7)
        if close_matches:
            best_match = close_matches[0]
            print(f"[INFO] 類似タイトルでマッチしました: {best_match}")
            row = df[df['Title'] == best_match].iloc[0]
            return row.get('Rank', 'Unknown'), row.get('Acronym', 'unknown')
        else:
            return "Not found", "unknown"

    except Exception as e:
        print(f"Error loading rank CSV: {e}")
        return "Error", "unknown"

# BibTeXラベルを筆頭著者+年+会議略称に書き換える
def rewrite_bibtex_label(bibtex_str: str, author: str, year: int, acronym: str) -> str:
    if not bibtex_str:
        return bibtex_str
    # ここが原因
    last_name = author.strip().split()[-1]
    new_label = f"{last_name}{year}{acronym}"

    # @type{oldlabel, を @type{newlabel, に置換
    return re.sub(r'(@\w+\{)[^,]+', r'\1' + new_label, bibtex_str, count=1)

# メイン関数（テスト用）
if __name__ == "__main__":
    title = "Using Gameplay Videos for Detecting Issues in Video Games"
    # タイトルからメタデータを取得
    metadata = fetch_metadata(title)
    print(f"\nFinal metadata with core rank:\n{metadata}")
