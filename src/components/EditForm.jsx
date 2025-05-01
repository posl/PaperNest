import React from "react";
import { Button } from "./ui/button";

export const EditForm = ({ editedData, handleInputChange, onSave, onCancel }) => {
  return (
    <div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Title:</label>
        <input
          type="text"
          name="title"
          value={editedData.title || ""}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Author:</label>
        <input
          type="text"
          name="author"
          value={editedData.author || ""}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Year:</label>
        <input
          type="text"
          name="year"
          value={editedData.year || ""}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Conference:</label>
        <input
          type="text"
          name="conference"
          value={editedData.conference || ""}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Core-rank:</label>
        <input
          type="text"
          name="core-rank"
          value={editedData["core-rank"] || ""}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Book:</label>
        <input
          type="text"
          name="book"
          value={editedData.book || ""}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Abstract:</label>
        <textarea
          name="abstract"
          value={editedData.abstract || ""}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded h-48 overflow-y-auto"
          rows="4"
        />
      </div>
      <div className="absolute bottom-4 right-4 flex gap-4">
        <Button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={onCancel}
        >
          キャンセル
        </Button>
        <Button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={onSave}
        >
          保存
        </Button>
      </div>
    </div>
  );
};