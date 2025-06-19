import React, { useState, useEffect } from "react";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal";
import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area";
import { Header } from "../../components/Header"
import { Sidebar } from "../../components/Sidebar";
import { TableSection } from "../../components/Table";
import { QuestionInput } from "../../components/QuestionInput";
import { FloatingUploadButton } from "../../components/FloatingUploadButton";
import { useLandingPageState } from "./hooks/useLandingPageState";
import { ModalPaperList } from "../../components/ModalPaperList";
import { summary } from "framer-motion/client";
import { secureFetch } from "../../utils/apiClient";
import { UploadingModal } from "../../components/UploadingModal";


export const LandingPage = () => {
  // Filter options data
  const filterOptions = [
    { id: "title", label: "Title" },
    { id: "authors", label: "Authors" },
    { id: "year", label: "Year" },
    { id: "conference", label: "Conference" },
    { id: "core_rank", label: "Core rank" },
    { id: "citations", label: "Citations" },
  ];

    // Tabs state
    const [tabs, setTabs] = useState([]);
    const [selectedTabId, setSelectedTabId] = useState(1);
    const [editingTabId, setEditingTabId] = useState(null);
    const [editingOldName, setEditingOldName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState("uploading"); // 'uploading', 'success', 'error', 'duplicate'
    const [isSearching, setIsSearching] = useState(false);
    const [searchProgress, setSearchProgress] = useState(0);



  const [tableData, setTableData] = useState([]);

  const currentCategory = tabs.find(tab => tab.id === selectedTabId)?.name || "未分類";

  // Move this outside the useEffect
  const fetchPapers = async () => {
    console.log("LandingPage: fetchPapers called");
    try {
      const token = localStorage.getItem("token");
      const response = await secureFetch("http://localhost:8000/get_all_papers");
      if (!response) return;

      // if (!response.ok) {
      //   throw new Error("Failed to fetch papers");
      // }

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
      console.log("LandingPage: tabs updated to", newTabs);
      console.log("LandingPage: selectedTabId currently", selectedTabId);
      // setSelectedTabId(newTabs.length > 0 ? newTabs[0].id : 1); // removed as per instruction
      return data;
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const data = await fetchPapers();
      if (Array.isArray(data)) {
        const categories = Array.from(new Set(data.map(p => p.category))).filter(Boolean);
        const initialTabs = categories.map((category, index) => ({
          id: index + 1,
          name: category
        }));
        setSelectedTabId(initialTabs.length > 0 ? initialTabs[0].id : 1);
      }
    };
    init();
  }, []);

  // Refresh table data when a tab rename completes
  useEffect(() => {
    console.log("LandingPage: editingTabId changed to", editingTabId);
    if (editingTabId === null) {
      fetchPapers();
    }
  }, [editingTabId]);


  const handleAddTab = () => {
    const nextId = tabs.length + 1;
    const newTab = { id: nextId, name: `研究テーマ${nextId}` };
    setTabs([...tabs, newTab]);
    setSelectedTabId(nextId);
  };

  // Table columns
  const columns = [
    { id: "title", label: "Title" },
    { id: "authors", label: "Authors" },
    { id: "year", label: "Year" },
    { id: "conference", label: "Conference" },
    { id: "core_rank", label: "Core rank" },
    { id: "citations", label: "Citations" },
  ];

  const [isLoading, setIsLoading] = useState(false);

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
  } = useLandingPageState(columns, {
    currentCategory,
    refreshPapers: fetchPapers,
    setIsLoading: setIsUploading,
    setUploadProgress,
    setUploadStatus,
  });

  // 編集内容を反映する関数（paper_idで一致する行のみ更新、重複を防ぐ）
  const handleUpdateRow = (updatedRow) => {
    setTableData((prevData) =>
      prevData.map((row) =>
        row.paper_id === updatedRow.paper_id ? { ...row, ...updatedRow } : row
      )
    );
    fetchPapers(); // Re-fetch data after update
  };

  // Update in-memory category names after rename
  const handleRenameCategory = (oldName, newName) => {
    console.log("LandingPage: handleRenameCategory called with", oldName, newName);
    // Update table data
    setTableData(prev => {
      const updated = prev.map(row =>
        row.category === oldName ? { ...row, category: newName } : row
      );
      console.log("LandingPage: tableData updated to", updated);
      return updated;
    });
    // Update tabs list
    setTabs(prev => {
      const updatedTabs = prev.map(tab =>
        tab.name === oldName ? { ...tab, name: newName } : tab
      );
      console.log("LandingPage: tabs updated to", updatedTabs);
      return updatedTabs;
    });
  };

  //質問ボックス用
  const [modalOpen, setModalOpen] = useState(false);
  const [recommendedPapers, setRecommendedPapers] = useState([]);

  // 論文削除用モーダル状態
  const [isDeletePaperModalOpen, setIsDeletePaperModalOpen] = useState(false);
  const [paperIdToDelete, setPaperIdToDelete] = useState(null);

  // --- 質問送信時の処理関数 ---
const handleQuestionSubmit = async (question) => {
  setIsSearching(true);
  setSearchProgress(0);

  let progress = 0;
  const interval = setInterval(() => {
    progress += 0.006;
    setSearchProgress(Math.min(progress, 0.95));
  }, 100);

  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:8000/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question,
        language: "ja",
        category: currentCategory,
      }),
    });

    const data = await response.json();

    clearInterval(interval);
    setSearchProgress(1.0);

    if (!response.ok) {
      alert(data.detail || "検索に失敗しました。");
      return;
    }

    // ✅ ここではまだモーダル開かない
    setRecommendedPapers(data);
  } catch (error) {
    clearInterval(interval);
    console.error("検索APIエラー:", error);
    alert("サーバーに接続できません。");
  } finally {
    // ✅ カメが歩ききるまで待ってからモーダル表示
    setTimeout(() => {
      setIsSearching(false); // カメを消す
      setTimeout(() => {
        setModalOpen(true); // そのあとにモーダル表示
      }, 300); // ← fade-outアニメーション分
    }, 500); // カメが1.0に達してから0.5秒くらい見せる
  }
};


  const fetchRelatedPaperIds = async (question) => {
    console.log("質問:", question);
    return [1, 2, 3, 4, 5];
  };

  // 論文削除リクエストハンドラ
  const handleRequestDeletePaper = (paperId) => {
    setPaperIdToDelete(paperId);
    setIsDeletePaperModalOpen(true);
  };
  // 論文削除確定ハンドラ
  const handleConfirmDeletePaper = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:8000/papers/delete/${paperIdToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const refreshed = await fetchPapers();
      if (Array.isArray(refreshed)) setTableData(refreshed);
    } catch (err) {
      console.error("論文削除エラー:", err);
    }
    setIsDeletePaperModalOpen(false);
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
          editingTabId={editingTabId}
          setEditingTabId={setEditingTabId}
          setEditingOldName={setEditingOldName}
          onRenameCategory={handleRenameCategory}
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
              const selectedTab = tabs.find(tab => tab.id === selectedTabId);
              // filterNameの定義を指示通りに修正
              const filterName = (editingTabId === selectedTabId)
                ? editingOldName
                : selectedTab?.name;
              const filteredTableData = tableData.filter(paper => paper.category === filterName);
              console.log("LandingPage: selectedTab:", filterName);
              console.log("LandingPage: filtered table data:", filteredTableData);
              return (
                <TableSection
                  visibleColumns={visibleColumns}
                  tableData={filteredTableData}
                  onUpdateRow={handleUpdateRow}
                  onDelete={(row) => handleRequestDeletePaper(row.paper_id)}
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
         isDragging={isDragging}
         category={currentCategory}
         onUploadSuccess={fetchPapers}  />

        {/* 論文削除確認モーダル */}
        <ConfirmDeleteModal
          isOpen={isDeletePaperModalOpen}
          message="この論文を削除してもよろしいですか？"
          onCancel={() => setIsDeletePaperModalOpen(false)}
          onConfirm={handleConfirmDeletePaper}
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
        <UploadingModal
          show={isSearching}
          progress={searchProgress}
          status="uploading"
          message="関連論文を検索中です..."
        />
      </div>
    </div>
  );
};
