import React, { useState, useEffect, useMemo } from "react";
import { FaQuoteRight, FaFilePdf } from "react-icons/fa";
import { BibtexModal } from "./BibtexModal";

export const ModalPaperList = ({ isOpen, onClose, papers }) => {
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [isBibtexOpen, setIsBibtexOpen] = useState(false);

  useEffect(() => {
    if (papers.length > 0) {
      setSelectedPaperId(papers[0].id);
    }
  }, [papers]);

  // ✅ 関連度順にソート
  const sortedPapers = useMemo(() => {
    return [...papers].sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
  }, [papers]);

  if (!isOpen) return null;

  const selectedPaper = sortedPapers.find((p) => p.id === selectedPaperId);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-3xl w-[90%] shadow-2xl text-left relative overflow-y-auto max-h-[90vh]"
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

        <h2 className="text-xl font-semibold tracking-tight text-gray-900 text-center mb-6">
          推薦論文
        </h2>

        {/* タイトル一覧（関連度順） */}
        <div className="flex flex-col gap-2 mb-6">
          {sortedPapers.map((paper) => (
            <button
              key={paper.id}
              onClick={() => setSelectedPaperId(paper.id)}
              className={`text-left px-4 py-2 rounded-lg transition font-medium ${
                paper.id === selectedPaperId
                  ? "bg-sky-100 text-sky-800"
                  : "hover:bg-gray-100 text-gray-800"
              }`}
            >
              {paper.title}
              {/* ↓ 表示したければスコア表示も */}
              <span className="ml-2 text-xs text-gray-400">(一致度：{paper.relevanceScore})</span>
            </button>
          ))}
        </div>

        {/* 詳細表示（略） */}
        {selectedPaper && (
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-700">詳細情報</h3>
              <div className="flex gap-2">
                {selectedPaper.bibtex && (
                  <button
                    onClick={() => setIsBibtexOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-400 rounded-md hover:text-[#aac2de] transition text-xs"
                  >
                    <FaQuoteRight />
                  </button>
                )}
                {selectedPaper.pdf && (
                  <a
                    href={selectedPaper.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#aac2de] text-white rounded-md hover:bg-[#90b4d4] transition text-sm"
                  >
                    <FaFilePdf />
                    PDF
                  </a>
                )}
              </div>
            </div>

            <p><strong>Title:</strong> {selectedPaper.title}</p>
            <p><strong>Author:</strong> {selectedPaper.author}</p>
            <p><strong>Year:</strong> {selectedPaper.year}</p>
            <p><strong>Conferencce:</strong> {selectedPaper.conference}</p>
            <p><strong>Core-Rank:</strong> {selectedPaper["core-rank"]}</p>
            <p><strong>Book:</strong> {selectedPaper.book}</p>

            <div>
              <p className="font-semibold text-gray-700 mb-1">Abstract:</p>
              <div className="mt-1 max-h-[200px] overflow-y-auto bg-gray-50 p-3 rounded-lg text-sm text-gray-800 border">
                {selectedPaper.abstract}
              </div>
            </div>
          </div>
        )}

        {/* BibTeXモーダル */}
        {selectedPaper && selectedPaper.bibtex && isBibtexOpen && (
          <BibtexModal
            bibtex={selectedPaper.bibtex}
            onClose={() => setIsBibtexOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
