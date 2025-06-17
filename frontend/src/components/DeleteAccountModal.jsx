import React from "react";
import { Button } from "./ui/button";
import { Icon } from "@iconify/react";

export const DeleteAccountModal = ({
  isOpen,
  onCancel,
  onConfirm,
  deletePassword,
  setDeletePassword
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl ring-1 ring-gray-300 w-[400px]">
        <h2 className="text-base font-medium text-gray-800 mb-3">
          <Icon icon="mdi:account-remove-outline" className="inline-block mr-2 text-red-600" />
          アカウントを削除してもよろしいですか？
        </h2>
        <p className="text-sm text-gray-600 mb-4">この操作は取り消せません。</p>
        <input
          type="password"
          placeholder="パスワードを入力"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          className="w-full px-3 py-2 mb-4 border rounded-lg border-gray-300"
        />
        <div className="flex justify-end gap-3">
          <Button
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md"
            onClick={onCancel}
          >
            キャンセル
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-500 px-4 py-2 rounded-md"
            onClick={onConfirm}
          >
            削除する
          </Button>
        </div>
      </div>
    </div>
  );
};
