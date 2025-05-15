import React from "react";
import { Button } from "../components/ui/button";
import { Icon } from '@iconify/react';

export const ConfirmDeleteModal = ({ isOpen, onCancel, onConfirm }) => {
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
            onClick={onConfirm}
        >
            削除する
        </Button>
        </div>
    </div>
    </div>

  );
};
