import React, { useState, useEffect } from "react";

export const ModalPaperList = ({ isOpen, onClose, papers }) => {
  const [selectedPaperId, setSelectedPaperId] = useState(null);

  // 最初の1件を自動で選択
  useEffect(() => {
    if (papers.length > 0) {
      setSelectedPaperId(papers[0].id);
    }
  }, [papers]);

  if (!isOpen) return null;

  const selectedPaper = papers.find(p => p.id === selectedPaperId);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-2xl w-[90%] shadow-xl text-left relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">関連論文 5 選</h2>

        {/* タイトル一覧 */}
        <ul className="space-y-2 mb-6">
          {papers.map((paper) => (
            <li key={paper.id}>
              <button
                onClick={() => setSelectedPaperId(paper.id)}
                className={`underline transition text-left ${
                  paper.id === selectedPaperId
                    ? "text-blue-800 font-semibold"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                {paper.title}
              </button>
            </li>
          ))}
        </ul>

        {/* 詳細表示 */}
        {selectedPaper && (
          <div className="bg-gray-100 p-4 rounded-md border border-gray-300 space-y-2">
            <h3 className="text-lg font-semibold">詳細情報</h3>
            <p><strong>タイトル:</strong> {selectedPaper.title}</p>
            <p><strong>著者:</strong> {selectedPaper.author}</p>
            <p><strong>発表年:</strong> {selectedPaper.year}</p>
            <p><strong>会議名:</strong> {selectedPaper.conference}</p>
            <p><strong>Coreランク:</strong> {selectedPaper["core-rank"]}</p>
            <p><strong>書籍:</strong> {selectedPaper.book}</p>
            <div>
              <strong>概要:</strong>
              <div className="mt-1 max-h-[200px] overflow-y-auto bg-white p-2 rounded border border-gray-200">
                {selectedPaper.abstract}
              </div>
            </div>

            {/* ✅ PDFリンクボタン */}
            {selectedPaper.pdf && (
            <div className="mt-4 text-right">
                <a
                href={selectedPaper.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-purple-200 text-black rounded hover:bg-purple-300 transition"
                >
                📄 PDFを見る
                </a>
            </div>
            )}
          </div>
        )}

        {/* 閉じるボタン */}
        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-3xl font-bold px-2"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};
