import React from "react";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import { Icon } from '@iconify/react';

export const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  filterOptions,
  selectedColumns,
  handleCheckboxChange,
  handleApplyFilters,
}) => {
  // 全チェックされてるかどうかを判定
  const allChecked = filterOptions.every((option) =>
    selectedColumns.includes(option.id)
  );

  // 切り替え関数
  const handleToggleAll = () => {
    if (allChecked) {
      // 全部外す
      handleCheckboxChange("ALL_OFF");
    } else {
      // 全部選ぶ
      handleCheckboxChange("ALL_ON");
    }
  };

  return (
    <>
      {/* 開くボタン（サイドバーが非表示時） */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute ml-4 mt-4 top-4 p-1 hover:opacity-80 transition"
        >
          <Icon icon="quill:hamburger-sidebar" width="24" height="22" color="#000" />
        </button>
      )}

      {/* アニメーション付きサイドバー */}
      <aside
        className={`w-[300px] h-[100vh] bg-[#f7faff] border-r border-gray-200 px-6 py-4 shadow-md rounded-r-2xl relative z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* サイドバー閉じるボタン */}
        <button
          onClick={toggleSidebar}
          className="ml-0 mt-4 p-1 hover:opacity-80 transition"
        >
          <Icon
            icon="lucide:chevron-left"
            width="24"
            height="24"
            color="#000"
          />
        </button>
        
        {/* 全選択チェックボックス */}
        <div className="flex justify-end items-center mb-2 py-2">
          <button
            onClick={handleToggleAll}
            className="text-sky-700 underline hover:text-sky-900 text-xs font-medium transition"
          >
            {allChecked ? "全てを解除" : "全てを選択"}
          </button>
        </div>

        {/* チェックボックスリスト */}
        <div className="space-y-4 mt-4">
          {filterOptions.map((option) => (
            <label
              key={option.id}
              htmlFor={option.id}
              className="flex items-center space-x-3 text-gray-800 hover:text-gray-400 font-medium text-base"
            >
              <Checkbox
                id={option.id}
                className="w-5 h-5 rounded border-gray-400 accent-sky-600"
                checked={selectedColumns.includes(option.id)}
                onCheckedChange={() => handleCheckboxChange(option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {/* 適用ボタン */}
        <Button
          onClick={() => {
            if (selectedColumns.length === 0) {
              alert("最低1つは選択してください");
              return;
            }
            handleApplyFilters();
          }}
          className="mt-8 w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold py-2 rounded-lg shadow-md hover:brightness-110 hover:scale-[1.02] transition-all"
        >
          反映させる
        </Button>
      </aside>
    </>
  );
};
