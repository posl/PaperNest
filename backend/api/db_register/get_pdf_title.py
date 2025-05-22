from pdfminer.converter import PDFPageAggregator
from pdfminer.layout import LAParams, LTContainer, LTTextLine
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfinterp import PDFPageInterpreter, PDFResourceManager
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfparser import PDFParser


def get_objs(layout, results):
    if not isinstance(layout, LTContainer):
        return
    for obj in layout:
        if isinstance(obj, LTTextLine):
            results.append(
                {
                    "text": obj.get_text(),
                    "height": obj.height,
                    "y0": obj.y0,  # 座標を追加
                }
            )
        get_objs(obj, results)


def get_pdf_title(path):
    with open(path, "rb") as f:
        parser = PDFParser(f)
        document = PDFDocument(parser)
        laparams = LAParams(all_texts=True)
        rsrcmgr = PDFResourceManager()
        device = PDFPageAggregator(rsrcmgr, laparams=laparams)
        interpreter = PDFPageInterpreter(rsrcmgr, device)
        page = next(PDFPage.create_pages(document))
        interpreter.process_page(page)
        layout = device.get_result()
        results = []
        get_objs(layout, results)

    # 最大高さの取得
    max_height = max(results, key=lambda x: x["height"])["height"]
    threshold = 0.1  # 高さの誤差許容

    # ページ上部の20%以内にあるもののみ抽出（座標は通常0が下、yが上方向）
    page_top_y = max(r["y0"] for r in results)
    y_cutoff = page_top_y * 0.8

    # フィルタ条件を厳しくする
    title_lines = [
        r
        for r in results
        if abs(r["height"] - max_height) < threshold
        and r["y0"] > y_cutoff
        and len(r["text"].strip()) >= 10  # 10文字以上など、ノイズ除去
    ]

    # y座標で上から下に並べる（順序調整）
    title_lines.sort(key=lambda r: -r["y0"])

    full_title = " ".join(r["text"].strip() for r in title_lines)
    print(full_title)
    return full_title.strip()


def main(path):
    get_pdf_title(path)


if __name__ == "__main__":
    # path = sys.argv[1]
    path = "../../../pdf/A Survey on Large Language Models for Code Generation.pdf"
    main(path)
