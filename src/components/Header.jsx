// import React, { useState } from "react";
// import { Separator } from "../components/ui/separator";
// import { Avatar } from "../components/ui/avatar";
// import { Button } from "../components/ui/button";
// import { PlusIcon } from "lucide-react";

// export const Header = ({ isMenuOpen, setIsMenuOpen, tabs, setTabs, selectedTabId, setSelectedTabId, handleAddTab }) => {
//   const [editingTabId, setEditingTabId] = useState(null);

//     return (
//         <header className="w-full h-[118px] bg-[#00000062] flex px-[40px]">
//           <div className="flex items-center p-0">
//             <img
//               className="h-[31px] mr-0 p-0"
//               alt="Logo"
//               src="https://c.animaapp.com/f9osxd0I/img/image-4@2x.png"
//             />
//             <Separator orientation="vertical" className="h-[51px] mx-4" />
//             <div style={{fontFamily: '"Abril Fatface", serif'}} className="h-[78px] pt-2.5 text-[#00269a] text-[40px] leading-[60px] font-normal">
//               PaperNest
//             </div>
//             {/* <img
//               className="w-[452px] h-[86px] ml-[121px]"
//               alt="Rectangle"
//               src="https://c.animaapp.com/f9osxd0I/img/rectangle-9.svg"
//             /> */}
//           </div>

//           <div className="flex items-center px-20 gap-[var(--variable-collection-spacing-m)]">
//           {tabs.map((tab) => (
//             <div key={tab.id} className="flex items-center">
//             {editingTabId === tab.id ? (
//               <input
//                 value={tab.name}
//                 onChange={(e) =>
//                   setTabs((prevTabs) =>
//                     prevTabs.map((t) =>
//                       t.id === tab.id ? { ...t, name: e.target.value } : t
//                     )
//                   )
//                 }
//                 onBlur={() => {
//                   if (tab.name.trim() === "") return;
//                   setEditingTabId(null);
//                 }}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     if (tab.name.trim() === "") return;
//                     setEditingTabId(null);
//                   }
//                 }}
//                 className="border px-2 py-1 rounded"
//                 autoFocus
//               />
//             ) : (
//               <Button
//                 variant="ghost"
//                 className={`font-body-text text-black text-[length:var(--body-text-font-size)] ${
//                   selectedTabId === tab.id ? "bg-gray-200" : ""
//                 }`}
//                 onClick={() => setSelectedTabId(tab.id)}
//                 onDoubleClick={() => setEditingTabId(tab.id)}
//               >
//                 {tab.name}
//               </Button>
//             )}
//           </div>
//         ))}
//             <Button
//               className="bg-[#dddddd] rounded-lg shadow-button-shadow p-3.5"
//               onClick={handleAddTab}
//             >
//               <PlusIcon className="w-6 h-6 text-white" />
//             </Button>
//           </div>

//           {/* <Avatar className="w-[60px] h-[60px] bg-[#2c6ee999] rounded-[30px]" onClick={onClick} /> */}
//           <div className="flex items-center ml-auto">
//             <Avatar
//                 onClick={() => setIsMenuOpen(!isMenuOpen)}
//                 className="w-[60px] h-[60px] bg-[#171718] rounded-full cursor-pointer mr-[5px]"
//             />
//           </div>
//             {isMenuOpen && (
//                 <>
//                 {/* 背景クリック用のオーバーレイ */}
//                 <div
//                 className="fixed inset-0 z-40"
//                 onClick={() => setIsMenuOpen(false)}
//                 />
//                 <div className="absolute right-[30px] top-[120px] w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
//                     <ul className="py-2">
//                     <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">プロフィール</li>
//                     <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">設定</li>
//                     <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ログアウト</li>
//                     </ul>
//                 </div>
//             </>

//             )}

//         </header>
//     );
// };

import React, { useState } from "react";
import { Separator } from "../components/ui/separator";
import { Avatar } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { PlusIcon } from "lucide-react";
import { Icon } from '@iconify/react';


export const Header = ({ isMenuOpen, setIsMenuOpen, tabs, setTabs, selectedTabId, setSelectedTabId, handleAddTab }) => {
  const [editingTabId, setEditingTabId] = useState(null);

  return (
    <header className="w-full h-[118px] bg-[#b9e3ff3d] shadow-sm flex px-10 items-center">
      {/* ロゴとタイトル */}
      <div className="flex items-center">
        {/* <img
          className="h-8"
          alt="Logo"
          src="https://c.animaapp.com/f9osxd0I/img/image-4@2x.png"
        /> */}
        <Icon icon="file-icons:tortoisesvn" className="text-4xl text-cyan-500" />
        <Separator orientation="vertical" className="h-10 mx-4" />
        <div
          style={{ fontFamily: '"Abril Fatface", serif' }}
          className="text-sky-600 text-3xl font-semibold tracking-wide"
        >
          PaperNest
        </div>
      </div>

      {/* タブ一覧 */}
      <div className="flex items-center gap-4 ml-16">
        {tabs.map((tab) => (
          <div key={tab.id} className="flex items-center">
            {editingTabId === tab.id ? (
              <input
                value={tab.name}
                onChange={(e) =>
                  setTabs((prevTabs) =>
                    prevTabs.map((t) =>
                      t.id === tab.id ? { ...t, name: e.target.value } : t
                    )
                  )
                }
                onBlur={() => {
                  if (tab.name.trim() === "") return;
                  setEditingTabId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tab.name.trim() !== "") {
                    setEditingTabId(null);
                  }
                }}
                className="border border-gray-300 px-2 py-1 rounded text-sm"
                autoFocus
              />
            ) : (
              <Button
                variant="ghost"
                className={`text-sm px-4 py-2 rounded-md transition-colors ${
                  selectedTabId === tab.id
                    ? "bg-sky-100 text-sky-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setSelectedTabId(tab.id)}
                onDoubleClick={() => setEditingTabId(tab.id)}
              >
                {tab.name}
              </Button>
            )}
          </div>
        ))}

        {/* プラスボタン */}
        <Button
          className="bg-sky-600 text-white rounded-md p-2 hover:bg-sky-700 transition"
          onClick={handleAddTab}
        >
          <PlusIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* アバターとメニュー */}
      <div className="flex items-center ml-auto relative">
        <Avatar
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-10 h-10 bg-gray-800 text-white rounded-full cursor-pointer"
        />
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
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
    </header>
  );
};
