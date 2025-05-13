import React, { useState, useEffect } from "react";
import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area";
import { Header } from "../../components/Header"
import { Sidebar } from "../../components/Sidebar";
import { TableSection } from "../../components/Table";
import { QuestionInput } from "../../components/QuestionInput";
import { FloatingUploadButton } from "../../components/FloatingUploadButton";
import { useLandingPageState } from "../LandingPage/hooks/useLandingPageState";
import { ModalPaperList } from "../../components/ModalPaperList";


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

    // Tabs state
    const [tabs, setTabs] = useState([
      { id: 1, name: "研究テーマ1" },
      { id: 2, name: "研究テーマ2" },
      { id: 3, name: "研究テーマ3" },
    ]);
    const [selectedTabId, setSelectedTabId] = useState(1);
    const handleAddTab = () => {
      const nextId = tabs.length + 1;
      const newTab = { id: nextId, name: `研究テーマ${nextId}` };
      setTabs([...tabs, newTab]);
      setSelectedTabId(nextId);
    };

      // Flat list of all papers with theme field
  const allPapers = [
    { id: 1, title: "example1", author: "John Doe", year: "2021", theme: 1 , pdf: "https://example.com/paper1.pdf"},
    { id: 2, title: "example2", author: "Jane Smith", year: "2020", theme: 1 , pdf: "https://example.com/paper2.pdf"},
    { id: 3, title: "example3", author: "Author A", year: "2022", theme: 2, pdf: "https://example.com/paper3.pdf"},
    { id: 4, title: "example4", author: "Author B", year: "2023", theme: 2, pdf: "https://example.com/paper4.pdf"},
    { id: 5, title: "example5", author: "Writer X", year: "2018", theme: 3, pdf: "https://example.com/paper5.pdf"},
    { id: 6, title: "example6", author: "Writer Y", year: "2057", theme: 3, pdf: "https://example.com/paper6.pdf"},
  ];

  const [tableData, setTableData] = useState(
    allPapers.filter((paper) => paper.theme === selectedTabId)
  );


  useEffect(() => {
    setTableData(allPapers.filter((paper) => paper.theme === selectedTabId));
  }, [selectedTabId]);


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

  //質問ボックス用
  const [modalOpen, setModalOpen] = useState(false);
  const [recommendedPapers, setRecommendedPapers] = useState([]);

  // --- 質問した時に帰ってきた仮の論文DB ---
  const paperDatabase = [
    {
      id: 1,
      title: "多言語コード生成におけるプロンプト設計の影響",
      author: "Tokumasu Haruka",
      year: "2024",
      conference: "EMNLP",
      "core-rank": "A",
      book: "なし",
      abstract: "本研究では、大規模言語モデルによる多言語コード生成において、入力言語や翻訳戦略が生成精度に与える影響を検証した。日中英の3言語で比較を行い、有効なプロンプト構成について議論する。",
      pdf: "https://example.com/paper1.pdf"
    },
    {
      id: 2,
      title: "コード生成精度における自然言語の影響",
      author: "Sato Keisuke",
      year: "2023",
      conference: "ACL",
      "core-rank": "A*",
      book: "あり",
      abstract: "本研究は、自然言語記述がコード生成性能に与える影響を詳細に分析する。特に曖昧性と記述スタイルの違いが出力コードに及ぼす影響に焦点を当てる。",
      pdf: "https://example.com/paper2.pdf"
    },
    {
      id: 3,
      title: "翻訳精度がコード生成に与える副次的影響の分析",
      author: "Li Wei",
      year: "2022",
      conference: "NAACL",
      "core-rank": "B",
      book: "なし",
      abstract: "言語間翻訳を介してコード生成タスクを実行した場合に、翻訳品質がどのように精度へ波及するかを定量的に評価した。BLEUスコアとの相関分析も含む。",
      pdf: "https://example.com/paper3.pdf"
    },
    {
      id: 4,
      title: "LLMの内部表現における言語依存性の可視化",
      author: "Suzuki Takumi",
      year: "2021",
      conference: "ICLR",
      "core-rank": "A",
      book: "あり",
      abstract: "本研究では、LLMの活性化パターンを解析し、異なる自然言語入力がモデル内部のどのようなニューロンに影響を与えるかを視覚化した。言語固有ニューロンの存在を示す。",
      pdf: "https://example.com/paper4.pdf"
    },
    {
      id: 5,
      title: "生成AIにおける物語的問題文の課題",
      author: "Tanaka Mei",
      year: "2020",
      conference: "COLING",
      "core-rank": "C",
      book: "なし",
      abstract: "AtCoderおよびLeetCodeの問題文を物語性の有無で分類し、物語的要素がコード生成精度に与える影響を実験的に示す。説明的文の方が精度が高い傾向が見られた。",
      pdf: "https://example.com/paper5.pdf"
    }
  ];
  

  // --- 質問送信時の処理関数 ---
  const handleQuestionSubmit = async (question) => {
    const ids = await fetchRelatedPaperIds(question);
    const papers = ids
      .map(id => paperDatabase.find(p => p.id === id))
      .filter(Boolean);
    setRecommendedPapers(papers);
    setModalOpen(true);
  };

  const fetchRelatedPaperIds = async (question) => {
    console.log("質問:", question);
    return [1, 2, 3, 4, 5];
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full"
         onDragOver={handleDragOver} // 画面全体でドラッグを検知
         onDragLeave={handleDragLeave} // ドラッグが終了したらリセット
         onDrop={handleDrop} // ドロップイベントを処理
    >
      <div className="bg-white overflow-hidden w-full h-screen relative">
        {/* Header */}
        <Header
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          tabs={tabs}
          setTabs={setTabs}
          selectedTabId={selectedTabId}
          setSelectedTabId={setSelectedTabId}
          handleAddTab={handleAddTab}
        />
        
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
          <QuestionInput onSubmit={handleQuestionSubmit}/>
        </div>
        {/* Modal for related papers */}
        <ModalPaperList
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          papers={recommendedPapers}
        />
        {/* Floating action button */}
        <FloatingUploadButton
         isPdfOpen={isPdfOpen}
         setIsPdfOpen={setIsPdfOpen}
         isDragging={isDragging}/>

      </div>
    </div>
  );
};
