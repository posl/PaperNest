import React from "react";
import { Separator } from "../components/ui/separator";
import { Avatar } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { PlusIcon } from "lucide-react";

export const Header = ({ isMenuOpen, setIsMenuOpen, tabs, selectedTabId, setSelectedTabId, handleAddTab }) => {
    return (
        <header className="w-full h-[118px] bg-[#b9e3ff3d] flex px-[40px]">
          <div className="flex items-center p-0">
            <img
              className="h-[31px] mr-0 p-0"
              alt="Logo"
              src="https://c.animaapp.com/f9osxd0I/img/image-4@2x.png"
            />
            <Separator orientation="vertical" className="h-[51px] mx-4" />
            <div className="h-[78px] pt-2.5 text-[#00269a] text-[40px] leading-[60px] [font-family:'Italiana',Helvetica] font-normal">
              UNTKT
            </div>
            {/* <img
              className="w-[452px] h-[86px] ml-[121px]"
              alt="Rectangle"
              src="https://c.animaapp.com/f9osxd0I/img/rectangle-9.svg"
            /> */}
          </div>

          <div className="flex items-center px-20 gap-[var(--variable-collection-spacing-m)]">
          {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={`font-body-text text-black text-[length:var(--body-text-font-size)] ${
                selectedTabId === tab.id ? "bg-gray-200" : ""
                }`}
                onClick={() => setSelectedTabId(tab.id)}
              >
              {tab.name}
              </Button>
            ))}
            <Button
              className="bg-[#dddddd] rounded-lg shadow-button-shadow p-3.5"
              onClick={handleAddTab}
            >
              <PlusIcon className="w-6 h-6 text-white" />
            </Button>
          </div>

          {/* <Avatar className="w-[60px] h-[60px] bg-[#2c6ee999] rounded-[30px]" onClick={onClick} /> */}
          <div className="flex items-center ml-auto">
            <Avatar
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-[60px] h-[60px] bg-[#3528be99] rounded-full cursor-pointer mr-[5px]"
            />
          </div>
            {isMenuOpen && (
                <>
                {/* 背景クリック用のオーバーレイ */}
                <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-[30px] top-[120px] w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
                    <ul className="py-2">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">プロフィール</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">設定</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ログアウト</li>
                    </ul>
                </div>
            </>

            )}

        </header>
    );
};