import { useState } from "react";

export const useLandingPageState = (
  columns,
  {
    currentCategory = "",
    refreshPapers = null,
    setIsLoading = () => {},
    setUploadProgress = () => {},
    setUploadStatus = () => {},
  } = {}
) => {

  // サイドバーの開閉状態
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // メニューの開閉状態
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // PDFの開閉状態
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // ドラッグ中かどうかの状態

  // 選択された列の状態
  const [selectedColumns, setSelectedColumns] = useState(
    columns.map((col) => col.id) // 初期状態はすべて選択
  );

  // ドラッグイベントのハンドラー
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true); // ドラッグ中の状態を設定
  };

  const handleDragLeave = () => {
    setIsDragging(false); // ドラッグが終了したら状態をリセット
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
  
    const file = e.dataTransfer.files[0];
    if (!file || file.type !== "application/pdf") {
      setUploadStatus("error");
      setTimeout(() => setIsLoading(false), 1500);
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", currentCategory);
  
    let progress = 0;
    setUploadProgress(0);
    setUploadStatus("uploading");
    setIsLoading(true);
  
    const interval = setInterval(() => {
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
  
      clearInterval(interval);
      setUploadProgress(1.0);
  
      const result = await res.json();
  
      if (!res.ok) {
        setUploadStatus(res.status === 409 ? "duplicate" : "error");
      } else {
        setUploadStatus("success");
        if (typeof refreshPapers === "function") refreshPapers();
      }
    } catch (err) {
      console.error("ドラッグアップロード失敗:", err);
      setUploadStatus("error");
    }
  
    setTimeout(() => setIsLoading(false), 2000);
  };
  


  // チェックボックスの変更ハンドラー
  // const handleCheckboxChange = (id) => {
  //   setSelectedColumns((prev) =>
  //       prev.includes(id)
  //           ? prev.filter((column) => column !== id)
  //           : [...prev, id]
  //       );
  //   }

    const handleCheckboxChange = (id) => {
      if (id === "ALL_ON") {
        setSelectedColumns(columns.map(col => col.id));
      } else if (id === "ALL_OFF") {
        setSelectedColumns([]);
      } else {
        setSelectedColumns((prev) =>
          prev.includes(id)
            ? prev.filter((column) => column !== id)
            : [...prev, id]
        );
      }
    };

    // 表示する列の状態
    const [visibleColumns, setVisibleColumns] = useState(columns); // 初期は全表示

    // フィルターを適用する関数
    const handleApplyFilters = () => {
    console.log("適用されたフィルター:", selectedColumns);
    const newVisibleColumns = columns.filter(col => selectedColumns.includes(col.id));
    setVisibleColumns(newVisibleColumns);
    };  

    return {
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
      };
}
