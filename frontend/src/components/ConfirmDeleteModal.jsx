import React from "react";
import { Button } from "./ui/button";
import { Icon } from '@iconify/react';

export const ConfirmDeleteModal = ({ isOpen, onCancel, selectedRow, refreshPapers, setTableData, onCloseDetail }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl shadow-xl ring-1 ring-gray-300 w-[340px]">
        <h2 className="text-base font-medium text-gray-800 mb-3">
        <Icon icon="twemoji:warning" className="inline-block mr-2" />
        この項目を削除してもよろしいですか？
        </h2>
        <p className="text-sm text-gray-600 mb-6">
        この操作は取り消せません。
        </p>
        <div className="flex justify-end gap-3">
        <Button
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md"
            onClick={onCancel}
        >
            キャンセル
        </Button>
        <Button
            className="bg-neutral-800 text-white hover:bg-neutral-700 px-4 py-2 rounded-md"
            onClick={async () => {
              // 1. API で削除
              console.log("ConfirmDeleteModal: deleting", selectedRow && selectedRow.paper_id);
              try {
                const token = localStorage.getItem("token");
                const response = await fetch(
                  `http://localhost:8000/papers/delete/${selectedRow.paper_id}`,
                  {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` },
                  }
                );
                if (!response.ok) {
                  console.error("Failed to delete paper:", await response.text());
                }
              } catch (error) {
                console.error("Error deleting paper:", error);
              }
              // 2. 一覧を再取得して更新
              if (typeof refreshPapers === "function" && typeof setTableData === "function") {
                console.log("ConfirmDeleteModal: refreshing papers");
                const refreshed = await refreshPapers();
                if (Array.isArray(refreshed)) {
                  setTableData(refreshed);
                }
              }
              // 3. 親の詳細モーダルを閉じる
              if (typeof onCloseDetail === "function") {
                onCloseDetail();
              }
              // 4. この ConfirmDeleteModal を閉じる
              onCancel();
            }}
        >
            削除する
        </Button>
        </div>
    </div>
    </div>

  );
};
