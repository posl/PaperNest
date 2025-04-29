import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";

export const QuestionInput = () => {
  return (
    <div className="absolute bottom-[50px] left-1/2 transform -translate-x-1/2 w-[999px]">
      <Card className="bg-[#f7f7f7] rounded-[20px]">
            <CardContent className="p-0">
                <Input
                    placeholder="ここで質問する"
                    className="h-[94px] border-none bg-transparent text-[#797979] text-xl leading-[30px] [font-family:'Inter',Helvetica] font-medium px-[38px]"
                />
            </CardContent>
        </Card>
    </div>
  );
};