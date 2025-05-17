import React, { useRef } from "react";
import { Button } from "../components/ui/button";
import { PlusIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const FloatingUploadButton = ({ isPdfOpen, setIsPdfOpen, isDragging }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("選択されたファイル:", file.name);
      // 必要があればアップロード処理などを書く
    }
  };

  return (
    <>
      {/* プラスボタン */}
      <Button
        className={`absolute bottom-[49px] right-[30px] w-[81px] h-[81px] rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ease-out ${
          isDragging
            ? "bg-gradient-to-br from-sky-300 to-sky-500 brightness-110"
            : "bg-gradient-to-br from-sky-300 to-blue-500 hover:scale-105 hover:brightness-110"
        }`}
        onClick={() => setIsPdfOpen(!isPdfOpen)}
      >
        <PlusIcon className="w-12 h-12 text-white drop-shadow" />
      </Button>

      {/* 非表示のファイル選択 */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* アニメーション付きモーダル */}
      <AnimatePresence>
        {isPdfOpen && (
          <>
            {/* 背景クリックで閉じる */}
            <motion.div
              className="fixed inset-0 z-40"
              onClick={() => setIsPdfOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* モーダル本体 */}
            <motion.div
              className="absolute right-[30px] bottom-[120px] w-[180px] bg-white border border-gray-200 shadow-lg z-50 rounded-xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}              
              transition={{ duration: 0.2 }}
            >
              <ul className="py-2">
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => {
                    setIsPdfOpen(false);
                    setTimeout(() => {
                      fileInputRef.current?.click();
                    }, 50);
                  }}
                >
                  アップロード
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
