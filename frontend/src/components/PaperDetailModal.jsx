import React, { useState } from "react";
import { Button } from "./ui/button";
import { EditForm } from "./EditForm";
import { FaFilePdf } from "react-icons/fa";
import { BibtexModal } from "./BibtexModal";
import { FaQuoteRight } from "react-icons/fa";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";


export const PaperDetailModal = ({
  selectedRow,
  isEditing,
  editedData,
  onClose,
  onStartEdit,
  onSave,
  onCancelEdit,
  onInputChange,
  onDelete,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
}) => {
  const [isBibtexOpen, setIsBibtexOpen] = useState(false);
  

  if (!selectedRow) return null;

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
          className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition"
          onClick={onClose}
        >
          ×
        </button>



        {/* タイトル */}
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-600 border-b border-gray-200 pb-4">論文詳細情報</h2>

        {/* 内容 */}
        {isEditing ? (
          <div className="bg-white rounded-2xl p-8 w-[1100px] h-[550px] flex flex-col overflow-hidden">
            <EditForm
              editedData={editedData}
              handleInputChange={onInputChange}
              onSave={onSave}
              onCancel={onCancelEdit}
              onDelete={() => setIsDeleteModalOpen(true)}
            />
            {isDeleteModalOpen && (
                <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    onDelete(); // ← handleDeleteRow() を呼び出す
                    setIsDeleteModalOpen(false);
                }}
                />
            )}
            
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
              <div className="resize-y border p-4 rounded-lg bg-gray-50 text-base whitespace-pre-wrap h-[300px] overflow-y-auto">
                {selectedRow.abstract || "N/A"}
              </div>
            </div>

            {/* PDF & BibTeXボタン */}
            <div className="flex justify-end gap-4 mt-8">
            {/* Editテキストリンク */}
            {!isEditing && (
            <button
                onClick={onStartEdit}
                className="inline-flex px-3 py-2 text-sky-700 rounded-md hover:bg-gray-100 will-change-transform hover:shadow-md hover:scale-105 transition-transform hover:text-sky-900 font-semibold"
            >
                Edit
            </button>
            )}
              {/* <Button
                className="flex items-center gap-2 px-3 py-1.5 text-gray-500 rounded-md hover:bg-white hover:text-[#aac2de] transition font-semibold text-xs"
                onClick={() => setIsBibtexOpen(true)}
              >
                <FaQuoteRight />
                
              </Button> */}
              <button
                onClick={() => setIsBibtexOpen(true)}
                className="gap-2 px-3 py-2 text-gray-500 rounded-full hover:text-gray-600 hover:shadow-md will-change-transform hover:scale-105 transition-transform hover:bg-gray-100"
                >
                <FaQuoteRight />
                </button>
              <Button
                className="bg-[#aac2de] text-white px-3 py-2 rounded-md text-sm shadow-md hover:bg-[#90b4d4] will-change-transform hover:scale-105 hover:brightness-105 transition-all"
                onClick={openPdf}
              >
                <FaFilePdf />
                PDF
              </Button>


            </div>
          </div>
        )}
      </div>

      {/* BibTeXモーダル */}
      {isBibtexOpen && (
        <BibtexModal
          isOpen={isBibtexOpen}
          onClose={() => setIsBibtexOpen(false)}
          bibtex={selectedRow.bibtex}
        />
      )}
    </div>
  );
};
