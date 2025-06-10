// src/components/ui/modal.jsx
import React from "react";

export function Modal({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <h2 className="text-lg font-bold text-gray-800 mb-4">{title}</h2>
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center transition"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
