import React from "react";
import { Button } from "./ui/button";

export const EditForm = ({ editedData, handleInputChange, onSave, onCancel, onDelete }) => {
  return (
    <div className="flex flex-col h-full m-4">
      {/* スクロール可能なフォーム部分 */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 text-gray-800">
        {/* 各フィールド */}
        <div>
          <label className="block font-bold mb-2">Title:</label>
          <input
            type="text"
            name="title"
            value={editedData.title || ""}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block font-bold mb-2">Author:</label>
          <input
            type="text"
            name="author"
            value={editedData.author || ""}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block font-bold mb-2">Year:</label>
          <input
            type="text"
            name="year"
            value={editedData.year || ""}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block font-bold mb-2">Conference:</label>
          <input
            type="text"
            name="conference"
            value={editedData.conference || ""}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block font-bold mb-2">Core-rank:</label>
          <input
            type="text"
            name="core-rank"
            value={editedData["core-rank"] || ""}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block font-bold mb-2">Book:</label>
          <input
            type="text"
            name="book"
            value={editedData.book || ""}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block font-bold mb-2">Abstract:</label>
          <textarea
            name="abstract"
            value={editedData.abstract || ""}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded h-48"
            rows="4"
          />
        </div>

        {/* BibTeXフィールド */}
        <div>
          <label className="block font-bold mb-2">BibTeX:</label>
          <textarea
            name="bibtex"
            value={editedData.bibtex || ""}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded h-40 font-mono text-sm"
            rows="6"
            placeholder="@article{...}"
          />
        </div>
      </div>

      {/* フッターボタン：常に画面下部に表示される */}
      <div className="border-t pt-4 pb-0 px-6 mb-0 flex justify-end gap-4 bg-white">
        <Button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={onCancel}
        >
          キャンセル
        </Button>
        <Button 
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          onClick={onDelete}
        >
          削除
        </Button>
        <Button
          className="bg-cyan-700 text-white px-4 py-2 rounded"
          onClick={onSave}
        >
          保存
        </Button>
      </div>
    </div>
  );
};
