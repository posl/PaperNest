import { useState } from "react";

export const useLandingPageState = (columns) => {
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

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false); // ドラッグ終了
    const file = e.dataTransfer.files[0]; // ドロップされたファイルを取得
    if (file && file.type === "application/pdf") {
      console.log("ドロップされたPDFファイル:", file.name);
      // 必要に応じてファイルを処理
    } else {
      alert("PDFファイルのみアップロードできます");
    }
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