import React from "react";
import { Avatar } from "../ui/avatar";

export const UserMenu = ({ isMenuOpen, setIsMenuOpen }) => {
  return (
    <div className="flex items-center ml-auto relative">
      <Avatar
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-10 h-10 bg-gray-800 text-white rounded-full cursor-pointer"
      />
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute right-0 top-[60px] w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <ul className="py-2">
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">プロフィール</li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">設定</li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ログアウト</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
