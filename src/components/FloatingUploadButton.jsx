import React from "react";
import { Button } from "../components/ui/button";
import { PlusIcon } from "lucide-react";

export const FloatingUploadButton = ({ isPdfOpen, setIsPdfOpen, isDragging }) => {
  return (
    <>
      <Button
        className={`absolute bottom-[49px] right-[30px] w-[81px] h-[81px] rounded-[40.5px] flex items-center justify-center ${
          isDragging ? "bg-[#ffcccc]" : "bg-[#b8e2ff]"
        }`}
        onClick={() => setIsPdfOpen(!isPdfOpen)}
      >
        <PlusIcon className="w-10 h-10 text-white" />
      </Button>

      {isPdfOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsPdfOpen(false)} />
          <div
            className="absolute right-[30px] bottom-[120px] w-[180px] bg-white border border-gray-200 shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="py-2">
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <label className="cursor-pointer">
                  アップロード
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        console.log("選択されたファイル:", file.name);
                      }
                    }}
                  />
                </label>
              </li>
            </ul>
          </div>
        </>
      )}
    </>
  );
};