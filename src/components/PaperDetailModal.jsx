import React from "react";
import { Button } from "../components/ui/button";
import { EditForm } from "./EditForm";
import { FaFilePdf, FaRegCopy } from "react-icons/fa";

export const PaperDetailModal = ({
  selectedRow,
  isEditing,
  editedData,
  onClose,
  onStartEdit,
  onSave,
  onCancelEdit,
  onInputChange,
}) => {
  if (!selectedRow) return null;

  const handleCopyBibtex = () => {
    if (selectedRow.bibtex) {
      navigator.clipboard.writeText(selectedRow.bibtex);
      alert("BibTeXをコピーしました！");
    } else {
      alert("BibTeX情報がありません");
    }
  };

  const openPdf = () => {
    if (selectedRow.pdf) {
      window.open(selectedRow.pdf, "_blank");
    } else {
      alert("PDFのURLがありません");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-2xl shadow-2xl w-[1200px] max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition"
          onClick={onClose}
        >
          ×
        </button>

        {/* タイトル */}
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">論文詳細情報</h2>

        {/* 内容 */}
        {isEditing ? (
          <div className="bg-white rounded-2xl p-8 w-[1100px] h-[550px] flex flex-col overflow-hidden">
            <EditForm
              editedData={editedData}
              handleInputChange={onInputChange}
              onSave={onSave}
              onCancel={onCancelEdit}
            />
          </div>
        ) : (
          <div className="space-y-4 text-gray-800 px-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <p><strong>Title:</strong> {selectedRow.title}</p>
              <p><strong>Author:</strong> {selectedRow.author || "N/A"}</p>
              <p><strong>Year:</strong> {selectedRow.year || "N/A"}</p>
              <p><strong>Conference:</strong> {selectedRow.conference || "N/A"}</p>
              <p><strong>Core-rank:</strong> {selectedRow["core-rank"] || "N/A"}</p>
              <p><strong>Book:</strong> {selectedRow.book || "N/A"}</p>
            </div>

            {/* Abstract */}
            <div className="mt-6">
              <p className="font-semibold text-lg mb-1">Abstract:</p>
              <div className="resize-y border p-4 rounded-lg bg-gray-50 text-base whitespace-pre-wrap max-h-[900px] overflow-y-auto">
                {selectedRow.abstract || "N/A"}
              </div>
            </div>



            {/* BibTeX表示とコピー */}
            {selectedRow.bibtex && (
              <div className="mt-6">
                <p className="font-semibold text-lg mb-1">BibTeX:</p>
                <div className="relative">
                  <textarea
                    readOnly
                    className="resize-y w-full p-4 border rounded-lg bg-gray-50 text-sm font-mono resize-none max-h-[200px] overflow-y-auto"
                    value={selectedRow.bibtex}
                  />
                  <Button
                    className="absolute top-2 right-2 px-3 py-1 text-sm rounded-md flex items-center gap-2 bg-gray-300 text-gray-600 hover:bg-sky-700 transition"
                    onClick={handleCopyBibtex}
                  >
                    <FaRegCopy />
                  </Button>
                </div>
              </div>
            )}

            {/* 編集ボタン & PDFボタン */}
            <div className="flex justify-between items-center mt-6">
            {/* 左端：PDFボタン */}
            <Button
                className="bg-[#aac2de] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#90b4d4] transition"
                onClick={openPdf}
            >
                <FaFilePdf />
                PDF
            </Button>

            {/* 右端：編集ボタン */}
            <Button
                className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition"
                onClick={onStartEdit}
            >
                編集
            </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
