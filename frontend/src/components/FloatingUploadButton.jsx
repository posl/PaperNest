import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadingModal } from "./UploadingModal";

export const FloatingUploadButton = ({ isPdfOpen, setIsPdfOpen, isDragging, category, onUploadSuccess }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("uploading"); // 'uploading' | 'success' | 'error' | 'duplicate'

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("uploading");

    if (file.type !== "application/pdf") {
      setUploadStatus("error");
      setTimeout(() => setIsUploading(false), 2000);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category || "未分類");

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 0.006;
      setUploadProgress(Math.min(progress, 0.97));
    }, 100);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(1.0);

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setUploadStatus("duplicate");
        } else {
          setUploadStatus("error");
        }
        setTimeout(() => setIsUploading(false), 2000);
        return;
      }

      setUploadStatus("success");
      onUploadSuccess?.();
      setTimeout(() => setIsUploading(false), 2000);

    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(1.0);
      setUploadStatus("error");
      setTimeout(() => setIsUploading(false), 2000);
    }
  };

  return (
    <>
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

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          handleFileSelect(e);
          e.target.value = "";
        }}
      />

      <UploadingModal
        show={isUploading}
        progress={uploadProgress}
        status={uploadStatus}
        message={
          uploadStatus === "uploading"
            ? "論文をアップロードしています..."
            : uploadStatus === "success"
            ? "アップロード完了！"
            : uploadStatus === "duplicate"
            ? "このPDFはすでに登録されています"
            : "アップロードに失敗しました"
        }
      />

      <AnimatePresence>
        {isPdfOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              onClick={() => setIsPdfOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="absolute right-[30px] bottom-[120px] w-[180px] bg-white border border-gray-200 shadow-lg z-50 rounded-xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <ul className="py-2">
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => {
                    setIsPdfOpen(false);
                    setTimeout(() => fileInputRef.current?.click(), 50);
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
