import React, { useState, useEffect, useMemo } from "react";
import { FaQuoteRight, FaFilePdf } from "react-icons/fa";
import { BibtexModal } from "./BibtexModal";

export const ModalPaperList = ({ isOpen, onClose, papers }) => {
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [isBibtexOpen, setIsBibtexOpen] = useState(false);

  useEffect(() => {
    if (papers.length > 0) {
      setSelectedPaperId(papers[0].paper_id);
    }
  }, [papers]);

  // ✅ 関連度順にソート
  const sortedPapers = useMemo(() => {
    return [...papers].sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));
  }, [papers]);

  if (!isOpen) return null;

  const selectedPaper = sortedPapers.find((p) => p.paper_id === selectedPaperId);

  return (
<div
  className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
  onClick={onClose}
>
  <div
    className="bg-white rounded-2xl max-w-3xl w-[90%] h-[720px] shadow-2xl text-left relative flex flex-col overflow-hidden"
    onClick={(e) => e.stopPropagation()}
  >
    {/* 閉じるボタン */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition"
      aria-label="閉じる"
    >
      ×
    </button>

    {/* タイトル */}
    <div className="pt-10 pb-4 px-6 text-center border-b">
      <h2 className="text-xl font-semibold tracking-tight text-gray-900">
        推薦論文
      </h2>
    </div>

    {/* 中身：スクロールエリア */}
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
      {/* タイトル一覧 */}
      <div className="flex flex-col gap-2">
        {sortedPapers.map((paper) => (
          <button
            key={paper.paper_id}
            onClick={() => setSelectedPaperId(paper.paper_id)}
            className={`text-left px-4 py-2 rounded-lg transition font-medium ${
              paper.paper_id === selectedPaperId
                ? "bg-sky-100 text-sky-800"
                : "hover:bg-gray-100 text-gray-800"
            }`}
          >
            {paper.title}
            <span className="ml-2 text-xs text-gray-400">
              (一致度：{paper.similarity.toFixed(1)})
            </span>
          </button>
        ))}
      </div>

      {/* 詳細エリア */}
      {selectedPaper && (
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md space-y-3 overflow-y-auto max-h-[430px]">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">詳細情報</h3>
            <div className="flex gap-2">
              {selectedPaper.bibtex && (
                <button
                  onClick={() => setIsBibtexOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-400 rounded-md hover:text-[#aac2de] transition text-sm"
                >
                  <FaQuoteRight />
                </button>
              )}
              {selectedPaper.pdf_url && (
                <a
                  href={selectedPaper.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#aac2de] text-white rounded-md text-sm hover:bg-[#90b4d4] hover:scale-105 hover:brightness-105 transition-all"
                >
                  <FaFilePdf />
                  PDF
                </a>
              )}
            </div>
          </div>

          <p><strong>Title:</strong> {selectedPaper.title}</p>
          <p><strong>Author:</strong> {selectedPaper.authors?.join(", ")}</p>
          <p><strong>Year:</strong> {selectedPaper.year}</p>
          <p><strong>Conferencce:</strong> {selectedPaper.conference}</p>
          <p><strong>Core-Rank:</strong> {selectedPaper.core_rank}</p>
          <p><strong>Citation:</strong> {selectedPaper.citations}</p>

          <div>
            <p className="font-semibold text-gray-700 mb-1">Abstract:</p>
            <div className="mt-1 max-h-[200px] overflow-y-auto bg-gray-50 p-3 rounded-lg text-sm text-gray-800 border">
              {selectedPaper.summary}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
  );
};
