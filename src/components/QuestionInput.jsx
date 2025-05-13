import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";


export const QuestionInput = ({ onSubmit }) => {
  const [question, setQuestion] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const handleSend = () => {
    if (!question.trim()) return;
    onSubmit(question); // 親に質問を渡す
    setQuestion(""); // 入力欄クリア
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <div className="absolute bottom-[5px] left-1/2 transform -translate-x-1/2 w-[999px]">
      <Card className="bg-[#f7f7f7] rounded-[20px]">
            <CardContent className="p-0">
                <Input
                    placeholder="ここで質問する"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    className="h-[94px] border-none bg-transparent text-[#797979] text-xl leading-[30px] [font-family:'Inter',Helvetica] font-medium px-[38px]"
                />
            </CardContent>
        </Card>
    </div>
  );
};
