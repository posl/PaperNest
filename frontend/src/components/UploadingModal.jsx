import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

export const UploadingModal = ({ show, message = "論文をアップロードしています...", progress = 0, status = "uploading" }) => {
  const totalSteps = 10;
//   const stepWidth = 28;
//   const currentX = progress * (stepWidth * (totalSteps - 1));
  const containerWidth = 300;
  const turtleOffset = 16; // カメのサイズに合わせて微調整（半分）

  const maxX = containerWidth - turtleOffset;
  const currentX = progress * maxX;

  const statusStyles = {
    uploading: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: "lucide:loader-2",
      spin: true,
    },
    success: {
      bg: "bg-green-50",
      text: "text-green-700",
      icon: "lucide:check-circle",
      spin: false,
    },
    duplicate: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      icon: "lucide:alert-circle",
      spin: false,
    },
    error: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: "lucide:x-circle",
      spin: false,
    },
  };

  const style = statusStyles[status] || statusStyles.uploading;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`px-10 py-10 rounded-xl shadow-xl text-gray-700 flex flex-col items-center gap-6 ${style.bg}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* 丸足跡 */}
            <div className="relative h-24 w-[300px] flex items-center">
              <div className="flex gap-3 w-full justify-between pb-2">
                {[...Array(totalSteps)].map((_, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-sky-300 inline-block transition-opacity duration-300"
                    style={{
                      width: i % 2 === 0 ? "6px" : "12px",
                      height: i % 2 === 0 ? "6px" : "12px",
                      opacity: progress >= i / (totalSteps - 1) ? 1 : 0.2,
                    }}
                  />
                ))}
              </div>

              {/* 亀 */}
              {/* <motion.div
                className="absolute bottom-[56px] left-0"
                animate={{ x: currentX }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{ transform: "translateX(-50%)" }}
              > */}
              <motion.div
                className="absolute bottom-[56px] left-0"
                animate={{ x: currentX }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{ transform: "translateX(-50%)" }}
                >
                <Icon
                  icon="file-icons:tortoisesvn"
                  className="text-4xl text-sky-500 drop-shadow"
                />
              </motion.div>
            </div>

            {/* ステータスアイコンとメッセージ */}
            <div className={`flex items-center gap-3 text-base font-medium ${style.text}`}>
              <Icon
                icon={style.icon}
                className={`text-2xl ${style.spin ? "animate-spin" : ""}`}
              />
              <span>{message}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};