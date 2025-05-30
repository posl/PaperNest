import React, { useState, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { FaPaperPlane } from "react-icons/fa";

export const QuestionInput = ({ onSubmit }) => {
  const [question, setQuestion] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef(null); // ← 追加

  const handleSend = () => {
    if (!question.trim()) return;
    onSubmit(question);
    setQuestion("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isComposing && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="bg-[#f7f7f7] rounded-2xl shadow-md border px-3 py-2">
      <CardContent
        className="px-8 py-5 cursor-text" // ← 見た目も「入力できる感」
        onClick={() => inputRef.current?.focus()} // ← 外を押しても input フォーカス
      >
        <div className="flex items-center gap-3">
          <input
            ref={inputRef} // ← ここで参照させる
            type="text"
            placeholder="ここで質問する"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            className="flex-1 bg-transparent border-none text-[#797979] text-[14px] leading-[28px] font-medium placeholder:text-[12px] placeholder:text-gray-400 focus:outline-none"
          />
          <Button
            onClick={handleSend}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600 transition-transform hover:scale-105"
          >
            <FaPaperPlane className="w-[18px] h-[18px]" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
