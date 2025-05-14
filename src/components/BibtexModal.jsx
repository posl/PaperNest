import React from "react";
import { FaQuoteRight, FaRegCopy } from "react-icons/fa";

export const BibtexModal = ({ bibtex, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-[90%] max-w-3xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center transition"
        >
          ×
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-4">BibTeX</h3>

        <textarea
          readOnly
          className="w-full h-[300px] p-4 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-none"
          value={bibtex}
        />

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              navigator.clipboard.writeText(bibtex);
              alert("BibTeXをコピーしました！");
            }}
            className="inline-flex items-center gap-2 bg-gray-300 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-400 transition text-sm"
          >
            <FaRegCopy />
            copy
          </button>
        </div>
      </div>
    </div>
  );
};
