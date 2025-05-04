import React from "react";
import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area";
import { Header } from "../../components/Header"
import { Sidebar } from "../../components/Sidebar";
import { TableSection } from "../../components/Table";
import { QuestionInput } from "../../components/QuestionInput";
import { FloatingUploadButton } from "../../components/FloatingUploadButton";
import { useLandingPageState } from "../LandingPage/hooks/useLandingPageState";
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

  // Table data (状態として管理)
  const [tableData, setTableData] = useState([
    { id: 1, title: "hogehoge", author: "John Doe", year: "2021" },
    { id: 2, title: "fugafuga", author: "Jane Smith", year: "2020" },
    { id: 3, title: "hogefuga", author: "Alice Johnson", year: "2019" },
  ]);

  // Table columns
  const columns = [
    { id: "title", label: "title" },
    { id: "author", label: "author" },
    { id: "year", label: "year" },
    { id: "conference", label: "conference" },
    { id: "core-rank", label: "core-rank" }, 
    { id: "book", label: "book" }, 
  ];

  // PDF data
  const pdfColumns = [
    { id: "pdf", label: "pdf" },
  ];

  const {
    isSidebarOpen,
    toggleSidebar,
    isMenuOpen,
    setIsMenuOpen,
    isPdfOpen,
    setIsPdfOpen,
    isDragging,
    setIsDragging,
    selectedColumns,
    handleCheckboxChange,
    handleApplyFilters,
    visibleColumns,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useLandingPageState(columns);

  // 編集内容を反映する関数
  const handleUpdateRow = (updatedRow) => {
    setTableData((prevData) =>
      prevData.map((row) => (row.id === updatedRow.id ? updatedRow : row))
    );
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full"
         onDragOver={handleDragOver} // 画面全体でドラッグを検知
         onDragLeave={handleDragLeave} // ドラッグが終了したらリセット
         onDrop={handleDrop} // ドロップイベントを処理
    >
      <div className="bg-white overflow-hidden w-full h-screen relative">
        {/* Header */}
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        
        {/* Main content */}
      <div className="flex mt-[0px] w-full h-full">
        {/* Left sidebar */}
        <div className={`relative ${isSidebarOpen ? "w-[300px]" : "w-[50px]"}`}>
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            filterOptions={filterOptions}
            selectedColumns={selectedColumns}
            handleCheckboxChange={handleCheckboxChange}
            handleApplyFilters={handleApplyFilters}
          />
          
        </div>

        {/* Main content area */}
        <ScrollArea
          className={`flex-1 min-w-0 transition-all duration-300 ${
            isSidebarOpen ? "ml-0" : "w-full"
          }`}
        >
            <TableSection
              visibleColumns={visibleColumns}
              tableData={tableData}
              onUpdateRow={handleUpdateRow} // 編集内容を反映する関数を渡す
            />

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
          <QuestionInput />
        </div>

        {/* Floating action button */}
        <FloatingUploadButton
         isPdfOpen={isPdfOpen}
         setIsPdfOpen={setIsPdfOpen}
         isDragging={isDragging}/>

      </div>
    </div>
  );
};
