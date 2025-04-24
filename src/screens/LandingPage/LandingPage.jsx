import { PlusIcon } from "lucide-react";
import React from "react";
import { Avatar } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useState } from "react";

export const LandingPage = () => {
  // Filter options data
  const filterOptions = [
    { id: "title", label: "title" },
    { id: "author", label: "author" },
    { id: "year", label: "year" },
    { id: "conference", label: "conference" },
    { id: "core-rank", label: "core-rank" },
    { id: "book", label: "book" },
  ];

  // Table data
  const tableData = [
    { id: 1, title: "hogehoge" },
    { id: 2, title: "hogehoge" },
    { id: 3, title: "hogehoge" },
  ];

  // Table columns
  const columns = [
    { id: "title", label: "title" },
    { id: "author", label: "author" },
    { id: "year", label: "year" },
    { id: "conference", label: "conference" },
    { id: "core-rank", label: "core-rank" }, 
    { id: "book", label: "book" }, 
  ];
  const pdfColumns = [
    { id: "pdf", label: "pdf" },
  ];

  

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);
  
  
  const handleCheckboxChange = (id) => {
    setSelectedColumns((prev) =>
        prev.includes(id)
            ? prev.filter((column) => column !== id)
            : [...prev, id]
        );
    }
    const [visibleColumns, setVisibleColumns] = useState(columns); // 初期は全表示

    const handleApplyFilters = () => {
    const newVisibleColumns = columns.filter(col => selectedColumns.includes(col.id));
    setVisibleColumns(newVisibleColumns);
    };




  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-full max-w-[1512px] relative min-h-[982px]">
        {/* Header */}
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
            <Button
              variant="ghost"
              className="font-body-text text-black text-[length:var(--body-text-font-size)]"
            >
              研究テーマ1
            </Button>
            <Button
              variant="ghost"
              className="font-body-text text-black text-[length:var(--body-text-font-size)]"
            >
              研究テーマ2
            </Button>
            <Button
              variant="ghost"
              className="font-body-text text-black text-[length:var(--body-text-font-size)]"
            >
              研究テーマ3
            </Button>
            <Button className="bg-[#dddddd] rounded-lg shadow-button-shadow p-3.5">
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
        
        {/* Main content */}
        <div className="flex mt-[20px]">
          {/* Left sidebar */}
          {isSidebarOpen && (
            <aside className="w-[230px] border-r border-gray-200 px-4 py-2 relative">
            {/* 閉じるボタン */}
            <button
              onClick={toggleSidebar}
              className="absolute top-2 right-2 flex justify-center items-center w-7 h-[35px]"
            >
              <img
                className="w-7 h-[35px]"
                alt="Close Sidebar"
                src="https://c.animaapp.com/f9osxd0I/img/polygon-1.svg"
              />
            </button>
      
            {filterOptions.map((option) => (
              <div key={option.id} className="flex items-center mb-6">
                <Checkbox
                  id={option.id}
                  className="w-5 h-5 rounded-[3px] border-black"
                  onCheckedChange={() => handleCheckboxChange(option.id)}
                />
                <label
                  htmlFor={option.id}
                  className="ml-8 font-medium text-xl text-black [font-family:'Inter',Helvetica]"
                >
                  {option.label}
                </label>
              </div>
            ))}
      
            <Button className="mt-8 w-[133px] h-[41px] bg-[#d9d9d9] rounded-[3px] border border-solid border-black shadow-[2px_2px_4px_#00000040] text-black text-xl font-medium [font-family:'Inter',Helvetica]" onClick={handleApplyFilters}>
              反映させる
            </Button>
          </aside>
            )}

            {!isSidebarOpen && (
                <button
                onClick={toggleSidebar}
                className="ml-4 mt-2 flex justify-center items-center w-7 h-[35px]"
              >
                <img
                  className={`w-7 h-[35px] transition-transform duration-300 ${
                    isSidebarOpen ? "" : "rotate-180"
                    }`}
                  alt="Open Sidebar"
                  src="https://c.animaapp.com/f9osxd0I/img/polygon-1.svg"
                />
              </button>
            )}
          
          {/* <aside className="w-[230px] border-r border-gray-200 px-4 py-2">
            <button className="flex justify-center items-center w-7 h-[35px] mb-8">
                <img
                className="w-7 h-[35px] mb-8"
                alt="Polygon"
                src="https://c.animaapp.com/f9osxd0I/img/polygon-1.svg"
                />
            </button>
            

            {filterOptions.map((option) => (
              <div key={option.id} className="flex items-center mb-6">
                <Checkbox
                  id={option.id}
                  className="w-5 h-5 rounded-[3px] border-black"
                />
                <label
                  htmlFor={option.id}
                  className="ml-8 font-medium text-xl text-black [font-family:'Inter',Helvetica]"
                >
                  {option.label}
                </label>
              </div>
            ))}

            <Button className="mt-8 w-[133px] h-[41px] bg-[#d9d9d9] rounded-[3px] border border-solid border-black shadow-[2px_2px_4px_#00000040] text-black text-xl font-medium [font-family:'Inter',Helvetica]">
              反映させる
            </Button>
          </aside> */}

          {/* Main content area */}
          <ScrollArea className="flex-1 px-8 py-4">
          <Table>
            <TableHeader>
                <TableRow>
                {visibleColumns.map((column) => (
                    <TableHead
                    key={column.id}
                    className="text-center text-2xl font-medium text-black"
                    >
                    {column.label}
                    </TableHead>
                ))}
                <TableHeader className="flex justify-center text-center text-2xl font-medium text-black">
                    pdf
                </TableHeader>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tableData.map((row) => (
                <TableRow key={row.id}>
                    {visibleColumns.map((column) => (
                    <TableCell key={column.id} className="p-0">
                        <div className="flex items-center justify-center h-14 w-full text-center text-xl text-black">
                        {column.id === "title"
                        ? row.title
                        : column.id === "author"
                        ? "author"
                        : column.id === "year"
                        ? "2025"
                        : column.id === "conference"
                        ? "conference"
                        : column.id === "core-rank"
                        ? "A"
                        : column.id === "book"
                        ? "Book Name"
                        : null}
                        </div>
                    </TableCell>
                    ))}
                    <TableCell>
                        <div className="flex justify-center items-center h-full w-full">
                            <Button className="w-[101px] h-14 bg-purple-100 border border-solid border-gray-300 rounded-md">
                              <span className="text-[13px] font-medium text-black">pdfを開く</span>
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>

            <ScrollBar
              orientation="vertical"
              className="w-[11px] h-[512px] bg-white border-[0.5px] border-solid border-[#0000008c]"
            >
              <div className="w-[9px] h-[287px] bg-[#e8f0ff] border-[0.5px] border-solid border-[#0000008c] shadow-[0px_2px_4px_#00000040]" />
            </ScrollBar>
          </ScrollArea>
        </div>

        {/* Question input */}
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

        {/* Floating action button */}
        <Button className="absolute bottom-[49px] right-[30px] w-[81px] h-[81px] bg-[#b8e2ff] rounded-[40.5px] flex items-center justify-center" onClick={() => setIsPdfOpen(!isPdfOpen)}>
          <PlusIcon className="w-10 h-10 text-white" />
        </Button>
        {isPdfOpen && (
            <>
                {/* 背景クリック用のオーバーレイ */}
                <div
                className="fixed inset-0 z-40"
                onClick={() => setIsPdfOpen(false)}
                />        
                <div className="absolute right-[30px] bottom-[120px] w-[180px] bg-white border border-gray-200 shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
                    <ul className="py-2">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">フォルダを開く</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">OneDrive</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">どこか</li>
                    </ul>
                </div>  
            </>
        )}
      </div>
    </div>
  );
};
