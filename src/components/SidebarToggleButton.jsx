import React from "react";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import { Icon } from "@iconify/react";

export const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  filterOptions,
  selectedColumns,
  handleCheckboxChange,
  handleApplyFilters,
}) => {
  return (
    <>
      {/* 開くボタン（サイドバーが閉じているときのみ表示） */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow hover:opacity-80 transition"
        >
          <Icon icon="quill:hamburger-sidebar" width="24" height="22" color="#000" />
        </button>
      )}

      {/* スライドサイドバー */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[300px] bg-[#f7faff] border-r border-gray-200 px-6 py-4 shadow-md rounded-r-2xl z-40 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 閉じるボタン */}
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 p-1 hover:opacity-80 transition"
        >
          <Icon icon="lucide:chevron-left" width="24" height="24" color="#000" />
        </button>

        {/* チェックボックスリスト */}
        <div className="space-y-4 mt-12">
          {filterOptions.map((option) => (
            <label
              key={option.id}
              htmlFor={option.id}
              className="flex items-center space-x-3 text-gray-800 font-medium text-base"
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
          onClick={handleApplyFilters}
          className="mt-8 w-full bg-sky-600 text-white font-semibold py-2 rounded-lg hover:bg-sky-700 transition"
        >
          反映させる
        </Button>
      </aside>
    </>
  );
};
