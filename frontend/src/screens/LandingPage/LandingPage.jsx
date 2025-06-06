import React, { useState, useEffect } from "react";
import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area";
import { Header } from "../../components/Header"
import { Sidebar } from "../../components/Sidebar";
import { TableSection } from "../../components/Table";
import { QuestionInput } from "../../components/QuestionInput";
import { FloatingUploadButton } from "../../components/FloatingUploadButton";
import { useLandingPageState } from "./hooks/useLandingPageState";
import { ModalPaperList } from "../../components/ModalPaperList";
import { summary } from "framer-motion/client";


export const LandingPage = () => {
  // Filter options data
  const filterOptions = [
    { id: "title", label: "title" },
    { id: "authors", label: "authors" },
    { id: "year", label: "year" },
    { id: "conference", label: "conference" },
    { id: "core_rank", label: "core-rank" },
    { id: "book", label: "book" },
  ];

    // Tabs state
    const [tabs, setTabs] = useState([]);
    const [selectedTabId, setSelectedTabId] = useState(1);

  const [tableData, setTableData] = useState([]);

  // Move this outside the useEffect
  const fetchPapers = async () => {
    console.log("LandingPage: fetchPapers called");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/get_all_papers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch papers");
      }

      const data = await response.json();
      console.log("LandingPage: fetchPapers received data:", data);

      if (!Array.isArray(data)) {
        throw new Error("Response is not an array");
      }

      setTableData(data);
      console.log("LandingPage: tableData set to:", data);

      const uniqueCategories = Array.from(new Set(data.map(paper => paper.category))).filter(Boolean);
      const newTabs = uniqueCategories.map((category, index) => ({
        id: index + 1,
        name: category
      }));

      setTabs(newTabs);
      setSelectedTabId(newTabs.length > 0 ? newTabs[0].id : 1);
      return data;
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);


  const handleAddTab = () => {
    const nextId = tabs.length + 1;
    const newTab = { id: nextId, name: `研究テーマ${nextId}` };
    setTabs([...tabs, newTab]);
    setSelectedTabId(nextId);
  };

  // Table columns
  const columns = [
    { id: "title", label: "title" },
    { id: "authors", label: "author" },
    { id: "year", label: "year" },
    { id: "conference", label: "conference" },
    { id: "core_rank", label: "core_rank" },
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

  // 編集内容を反映する関数（paper_idで一致する行のみ更新、重複を防ぐ）
  const handleUpdateRow = (updatedRow) => {
    setTableData((prevData) =>
      prevData.map((row) =>
        row.paper_id === updatedRow.paper_id ? { ...row, ...updatedRow } : row
      )
    );
    fetchPapers(); // Re-fetch data after update
  };

  //質問ボックス用
  const [modalOpen, setModalOpen] = useState(false);
  const [recommendedPapers, setRecommendedPapers] = useState([]);

  // --- 質問した時に帰ってきた仮の論文DB ---
  const paperDatabase = [
    {
      paper_id: 1,
      title: "多言語コード生成におけるプロンプト設計の影響",
      authors: "Tokumasu Haruka",
      year: "2024",
      conference: "EMNLP",
      citations: 10,
      core_rank: "A",
      summary: "本研究では、大規模言語モデルによる多言語コード生成において、入力言語や翻訳戦略が生成精度に与える影響を検証した。日中英の3言語で比較を行い、有効なプロンプト構成について議論する。",
      pdf_url: "https://example.com/paper1.pdf",
      category: "自然言語処理",
      bibtex: "@article{example1, author = {Tokumasu Haruka}, title = {多言語コード生成におけるプロンプト設計の影響}, year = {2024}, journal = {Journal of Examples}, volume = {1}, number = {1}, pages = {1-10} }",
      llm_answer: "この研究は、自然言語のプロンプトがコード生成に与える影響を分析しており、特に多言語環境での有効なプロンプト設計について議論しています。",
      similarity: 0.9,
      chunk_text: "本研究では、大規模言語モデルによる多言語コード生成において、入力言語や翻訳戦略が生成精度に与える影響を検証した。日中英の3言語で比較を行い、有効なプロンプト構成について議論する。",
    },
    {
      paper_id: 2,
      title: "コード生成精度における自然言語の影響",
      authors: "Sato Keisuke",
      year: "2023",
      conference: "ACL",
      core_rank: "A*",
      citations: 8,
      summary: "本研究は、自然言語記述がコード生成性能に与える影響を詳細に分析する。特に曖昧性と記述スタイルの違いが出力コードに及ぼす影響に焦点を当てる。",
      pdf_url: "https://example.com/paper2.pdf",
      category: "生成AI",
      llm_answer: "この研究は、自然言語の影響がコード生成精度にどのように作用するかを分析しており、特に曖昧性と記述スタイルの違いが出力コードに与える影響に焦点を当てています。",
      similarity: 0.92,
      chunk_text: "本研究は、自然言語記述がコード生成性能に与える影響を詳細に分析する。特に曖昧性と記述スタイルの違いが出力コードに及ぼす影響に焦点を当てる。",
      bibtex: "@article{example2, author = {Sato Keisuke}, title = {コード生成精度における自然言語の影響}, year = {2023}, journal = {Journal of Examples}, volume = {1}, number = {1}, pages = {11-20} }",
    },
    {
      paper_id: 3,
      title: "翻訳精度がコード生成に与える副次的影響の分析",
      authors: "Li Wei",
      year: "2022",
      conference: "NAACL",
      core_rank: "B",
      citations: 5,
      summary: "言語間翻訳を介してコード生成タスクを実行した場合に、翻訳品質がどのように精度へ波及するかを定量的に評価した。BLEUスコアとの相関分析も含む。",
      pdf_url: "https://example.com/paper3.pdf",
      category: "機械学習",
      llm_answer: "この研究は、翻訳精度がコード生成に与える影響を分析しており、特に翻訳品質が生成コードの精度にどのように波及するかを定量的に評価しています。",
      similarity: 0.85,
      chunk_text: "言語間翻訳を介してコード生成タスクを実行した場合に、翻訳品質がどのように精度へ波及するかを定量的に評価した。BLEUスコアとの相関分析も含む。",
      bibtex: "@article{example3, author = {Li Wei}, title = {翻訳精度がコード生成に与える副次的影響の分析}, year = {2022}, journal = {Journal of Examples}, volume = {1}, number = {1}, pages = {21-30} }",
    },
    {
      paper_id: 4,
      title: "LLMの内部表現における言語依存性の可視化",
      authors: "Suzuki Takumi",
      year: "2021",
      conference: "ICLR",
      core_rank: "A",
      citations: 15,
      summary: "本研究では、LLMの活性化パターンを解析し、異なる自然言語入力がモデル内部のどのようなニューロンに影響を与えるかを視覚化した。言語固有ニューロンの存在を示す。",
      pdf_url: "https://example.com/paper4.pdf",
      category: "深層学習",
      llm_answer: "この研究は、LLMの内部表現における言語依存性を可視化しており、特に異なる自然言語入力がモデル内部のニューロンに与える影響を示しています。",
      similarity: 0.9,
      chunk_text: "本研究では、LLMの活性化パターンを解析し、異なる自然言語入力がモデル内部のどのようなニューロンに影響を与えるかを視覚化した。言語固有ニューロンの存在を示す。",
      bibtex: "@article{example4, author = {Suzuki Takumi}, title = {LLMの内部表現における言語依存性の可視化}, year = {2021}, journal = {Journal of Examples}, volume = {1}, number = {1}, pages = {31-40} }",
    },
    {
      paper_id: 5,
      title: "生成AIにおける物語的問題文の課題",
      authors: "Tanaka Mei",
      year: "2020",
      conference: "COLING",
      core_rank: "C",
      citations: 3,
      summary: "AtCoderおよびLeetCodeの問題文を物語性の有無で分類し、物語的要素がコード生成精度に与える影響を実験的に示す。説明的文の方が精度が高い傾向が見られた。",
      pdf_url: "https://example.com/paper5.pdf",
      category: "生成AI",
      llm_answer: "この研究は、生成AIにおける物語的問題文の課題を分析しており、特に物語的要素がコード生成精度に与える影響を実験的に示しています。",
      similarity: 0.87,
      chunk_text: "AtCoderおよびLeetCodeの問題文を物語性の有無で分類し、物語的要素がコード生成精度に与える影響を実験的に示す。説明的文の方が精度が高い傾向が見られた。",
      bibtex: "@article{example5, author = {Tanaka Mei}, title = {生成AIにおける物語的問題文の課題}, year = {2020}, journal = {Journal of Examples}, volume = {1}, number = {1}, pages = {41-50} }",

    }
  ];
  

  // --- 質問送信時の処理関数 ---
  const handleQuestionSubmit = async (question) => {
    const ids = await fetchRelatedPaperIds(question);
    const papers = ids
      .map(id => paperDatabase.find(p => p.paper_id === id))
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
        <div className={`transition-all duration-300 ease-in-out relative ${isSidebarOpen ? "w-[300px]" : "w-[50px]"}`}>
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
            {(() => {
              const selectedTabName = tabs.find(tab => tab.id === selectedTabId)?.name;
              const filteredTableData = tableData.filter(paper => paper.category === selectedTabName);
              console.log("LandingPage: selectedTab:", selectedTabName);
              console.log("LandingPage: filtered table data:", filteredTableData);
              return (
                <TableSection
                  visibleColumns={visibleColumns}
                  tableData={filteredTableData}
                  onUpdateRow={handleUpdateRow}
                  onDelete={() => { /* 編集モーダルを閉じる用コールバックを渡す（例: setIsEditModalOpen(false)） */ }}
                  setTableData={setTableData}
                  refreshPapers={fetchPapers}
                />
              );
            })()}
            

            <ScrollBar
              orientation="vertical"
              className="w-[11px] h-[512px] bg-white border-[0.5px] border-solid border-[#0000008c]"
            >
              <div className="w-[9px] h-[287px] bg-[#e8f0ff] border-[0.5px] border-solid border-[#0000008c] shadow-[0px_2px_4px_#00000040]" />
            </ScrollBar>
          </ScrollArea>
        </div>

        {/* Question input */}
        <div className="fixed bottom-[40px] left-[300px] right-[100px] px-4 z-30 pointer-events-none transition-[left] duration-300 ease-in-out"
          style={{
            left: isSidebarOpen ? "300px" : "50px", // ← ← ← ← ここだけが鍵！
          }}
        >
          <div className="w-full max-w-6xl mx-auto pointer-events-auto px-6">
            <QuestionInput onSubmit={handleQuestionSubmit} />
          </div>
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
