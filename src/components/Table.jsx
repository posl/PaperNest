import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { EditForm } from "./EditForm";
import { FaFilePdf } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export const TableSection = ({ visibleColumns, tableData, onUpdateRow }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const closeModal = () => {
    setSelectedRow(null);
    setIsEditing(false);
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditedData(selectedRow);
  };

  const saveChanges = () => {
    if (onUpdateRow) {
      onUpdateRow(editedData);
    }
    setSelectedRow(editedData);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSort = (columnId) => {
    if (sortColumn === columnId) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnId);
      setSortOrder("asc");
    }
  };

  const sortedData = [...tableData].sort((a, b) => {
    if (!sortColumn) return 0;
    const valA = a[sortColumn];
    const valB = b[sortColumn];
    if (valA == null) return 1;
    if (valB == null) return -1;
    if (typeof valA === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
    return sortOrder === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

 // ...前略（state やソート部分などは前と同様です）

return (
  <div className="max-w-screen-xl mx-auto px-6 py-6">

     {/* モーダル */}
       {selectedRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[1300px] h-[900px] relative overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-4xl font-bold"
              onClick={closeModal}
            >
              ×
            </button>

            <h2 className="text-2xl font-semibold mb-6 text-gray-800">詳細情報</h2>

            {isEditing ? (
              <EditForm
                editedData={editedData}
                handleInputChange={handleInputChange}
                onSave={saveChanges}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="space-y-4 text-gray-800">
                <p><strong>Title:</strong> {selectedRow.title}</p>
                <p><strong>Author:</strong> {selectedRow.author || "N/A"}</p>
                <p><strong>Year:</strong> {selectedRow.year || "N/A"}</p>
                <p><strong>Conference:</strong> {selectedRow.conference || "N/A"}</p>
                <p><strong>Core-rank:</strong> {selectedRow["core-rank"] || "N/A"}</p>
                <p><strong>Book:</strong> {selectedRow.book || "N/A"}</p>
                <div>
                  <p><strong>Abstract:</strong></p>
                  <div className="text-base whitespace-pre-wrap">{selectedRow.abstract || "N/A"}</div>
                </div>
                <div className="absolute bottom-4 right-4 flex gap-4">
                  <Button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    onClick={startEditing}
                  >
                    編集
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    {/* テーブルとPDF列 */}
    <div className="relative flex rounded-lg shadow-md overflow-hidden bg-white">
      <div className="overflow-x-auto flex-1">
        {/* スクロールテーブル部分 */}
        <div className="overflow-x-auto w-full pr-[120px]">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-[#f7faff] h-[56px]">
                {visibleColumns.map((col) => (
                  <TableHead
                    key={col.id}
                    onClick={() => handleSort(col.id)}
                    className="px-4 py-3 text-left text-gray-700 font-semibold tracking-wide cursor-pointer select-none hover:text-indigo-300"
                  >
                    {col.label}
                    {sortColumn === col.id && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {sortedData.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-[56px] hover:bg-[#f0f4f8] transition-colors cursor-pointer"
                  onClick={() => setSelectedRow(row)}
                >
                  {visibleColumns.map((col) => (
                    <TableCell key={col.id} className="px-4 py-3 text-gray-800 whitespace-nowrap">
                      {row[col.id] || "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* PDF列（右側に外固定） */}
        <div className="absolute top-0 right-0 w-[120px] z-10">
          {/* ヘッダー */}
          <div className="h-[56px] bg-[#f7faff] flex items-center justify-center font-semibold text-gray-700 border-l border-[#f7faff]">
           pdf
          </div>

          {/* 各行 */}
          {sortedData.map((row) => (
            <div
              key={row.id}
              className="h-[56px] flex items-center justify-center border-t bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                className="bg-[#aac2de] text-white px-3 py-2 rounded-md text-sm hover:bg-[#90b4d4] transition"
                onClick={() => {
                  if (row.pdf) window.open(row.pdf, "_blank");
                  else alert("PDFのURLが設定されていません");
                }}
              ><FaFilePdf className="text-white" />
                PDF
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
};
// import React, { useState } from "react";
// import { Button } from "../components/ui/button";
// import { EditForm } from "./EditForm";
// import { FaFilePdf } from "react-icons/fa";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../components/ui/table";

// export const TableSection = ({ visibleColumns, tableData, onUpdateRow }) => {
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedData, setEditedData] = useState({});
//   const [sortColumn, setSortColumn] = useState(null);
//   const [sortOrder, setSortOrder] = useState("asc");

//   const closeModal = () => {
//     setSelectedRow(null);
//     setIsEditing(false);
//   };

//   const startEditing = () => {
//     setIsEditing(true);
//     setEditedData(selectedRow);
//   };

//   const saveChanges = () => {
//     if (onUpdateRow) {
//       onUpdateRow(editedData);
//     } else {
//       console.error("onUpdateRow が定義されていません");
//     }
//     setSelectedRow(editedData);
//     setIsEditing(false);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditedData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleSort = (columnId) => {
//     if (sortColumn === columnId) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortColumn(columnId);
//       setSortOrder("asc");
//     }
//   };

//   const sortedData = [...tableData].sort((a, b) => {
//     if (!sortColumn) return 0;
//     const valA = a[sortColumn];
//     const valB = b[sortColumn];
//     if (valA == null) return 1;
//     if (valB == null) return -1;
//     if (typeof valA === "number") {
//       return sortOrder === "asc" ? valA - valB : valB - valA;
//     }
//     return sortOrder === "asc"
//       ? String(valA).localeCompare(String(valB))
//       : String(valB).localeCompare(String(valA));
//   });

//   return (
//     <div className="max-w-screen-xl mx-auto px-6 py-6">
//       {/* 外部PDFボタン */}
//       <div className="flex justify-end mb-4">
//         <Button
//           className="flex items-center gap-2 bg-[#aac2de] text-white px-4 py-2 rounded-md text-sm hover:bg-[#90b4d4] transition"
//           onClick={() => {
//             if (selectedRow?.pdfUrl) {
//               window.open(selectedRow.pdfUrl, "_blank");
//             } else {
//               alert("PDFを開く行を選択してください");
//             }
//           }}
//         >
//           <FaFilePdf className="text-white" />
//           <span>PDFを開く</span>
//         </Button>
//       </div>

//       {/* モーダル */}
//       {selectedRow && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
//           onClick={closeModal}
//         >
//           <div
//             className="bg-white p-6 rounded-lg shadow-lg w-[1300px] h-[900px] relative overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-4xl font-bold"
//               onClick={closeModal}
//             >
//               ×
//             </button>

//             <h2 className="text-2xl font-semibold mb-6 text-gray-800">詳細情報</h2>

//             {isEditing ? (
//               <EditForm
//                 editedData={editedData}
//                 handleInputChange={handleInputChange}
//                 onSave={saveChanges}
//                 onCancel={() => setIsEditing(false)}
//               />
//             ) : (
//               <div className="space-y-4 text-gray-800">
//                 <p><strong>Title:</strong> {selectedRow.title}</p>
//                 <p><strong>Author:</strong> {selectedRow.author || "N/A"}</p>
//                 <p><strong>Year:</strong> {selectedRow.year || "N/A"}</p>
//                 <p><strong>Conference:</strong> {selectedRow.conference || "N/A"}</p>
//                 <p><strong>Core-rank:</strong> {selectedRow["core-rank"] || "N/A"}</p>
//                 <p><strong>Book:</strong> {selectedRow.book || "N/A"}</p>
//                 <div>
//                   <p><strong>Abstract:</strong></p>
//                   <div className="text-base whitespace-pre-wrap">{selectedRow.abstract || "N/A"}</div>
//                 </div>
//                 <div className="absolute bottom-4 right-4 flex gap-4">
//                   <Button
//                     className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
//                     onClick={startEditing}
//                   >
//                     編集
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* テーブル本体 */}
//       <div className="overflow-x-auto bg-white shadow-md rounded-lg">
//         <Table className="w-full table-auto text-sm">
//           <TableHeader>
//             <TableRow className="bg-[#f7faff]">
//               {visibleColumns.map((column) => (
//                 <TableHead
//                   key={column.id}
//                   onClick={() => handleSort(column.id)}
//                   className="px-4 py-3 text-left text-gray-700 font-semibold tracking-wide cursor-pointer select-none hover:text-indigo-600"
//                 >
//                   {column.label}
//                   {sortColumn === column.id && (
//                     <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
//                   )}
//                 </TableHead>
//               ))}
//               <TableHead className="px-4 py-3 text-left text-gray-700 font-semibold tracking-wide">
//                 PDF
//               </TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody className="divide-y divide-gray-200">
//             {sortedData.map((row) => (
//               <TableRow
//                 key={row.id}
//                 className="hover:bg-[#f0f4f8] transition-colors cursor-pointer"
//                 onClick={() => setSelectedRow(row)}
//               >
//                 {visibleColumns.map((column) => (
//                   <TableCell key={column.id} className="px-4 py-3 text-gray-800">
//                     {row[column.id] || "N/A"}
//                   </TableCell>
//                 ))}
//                 <TableCell className="px-4 py-3">
//                   <Button
//                     className="flex items-center gap-2 bg-[#aac2de] text-white px-3 py-2 rounded-md text-sm hover:bg-[#90b4d4] transition"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       if (row.pdfUrl) {
//                         window.open(row.pdfUrl, "_blank");
//                       } else {
//                         alert("PDFのURLが存在しません");
//                       }
//                     }}
//                   >
//                     <FaFilePdf className="text-white" />
//                     <span>PDF</span>
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// };





////////////////
////////////////patarn2
////////////////


// import React, { useState } from "react";
// import { Button } from "../components/ui/button";
// import { EditForm } from "./EditForm"; // 編集フォームをインポート  
// import { FaFilePdf } from "react-icons/fa";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../components/ui/table";

// export const TableSection = ({ visibleColumns, tableData, onUpdateRow }) => {
//   // モーダルの状態を管理
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [isEditing, setIsEditing] = useState(false); // 編集モードの状態
//   const [editedData, setEditedData] = useState({}); // 編集中のデータ

//   // モーダルを閉じる関数
//   const closeModal = () => {
//     setSelectedRow(null);
//     setIsEditing(false); // 編集モードをリセット
//   };

//   // 編集モードを開始する関数
//   const startEditing = () => {
//     setIsEditing(true);
//     setEditedData(selectedRow); // 選択された行のデータをコピー
//   };

//   const saveChanges = () => {
//     console.log("保存ボタンが押されました:", editedData);
//     if (onUpdateRow) {
//       onUpdateRow(editedData); // 親コンポーネントのデータを更新
//     } else {
//       console.error("onUpdateRow が定義されていません");
//     }
//     setSelectedRow(editedData); // モーダル内のデータを更新
//     setIsEditing(false);
//   };

//   // フォームの入力値を更新する関数
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditedData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   return (
//     <div>
//       {/* モーダル */}
//       {selectedRow && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
//           onClick={closeModal} // 背景をクリックしたらモーダルを閉じる
//         >
//           <div
//             className="bg-white p-6 rounded-lg shadow-lg w-[1300px] h-[900px] relative"
//             onClick={(e) => e.stopPropagation()} // モーダル内部のクリックを無視
//           >

//             {/* 閉じるボタン */}
//             <button
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-4xl font-bold"
//               onClick={closeModal}
//             >
//               ×
//             </button>

//             <h2 className="text-xl font-bold mb-4">詳細情報</h2>

//             {/* 編集モード */}
//             {isEditing ? (
//               <EditForm
//               editedData={editedData}
//               handleInputChange={handleInputChange}
//               onSave={saveChanges}
//               onCancel={() => setIsEditing(false)}
//             />
//             ) : (
//               // 通常モード
//               <div>
//                 <p><strong>Title:</strong> {selectedRow.title}</p>
//                 <p><strong>Author:</strong> {selectedRow.author || "N/A"}</p>
//                 <p><strong>Year:</strong> {selectedRow.year || "N/A"}</p>
//                 <p><strong>Conference:</strong> {selectedRow.conference || "N/A"}</p>
//                 <p><strong>Core-rank:</strong> {selectedRow["core-rank"] || "N/A"}</p>
//                 <p><strong>book:</strong> {selectedRow.book || "N/A"}</p>
//                 <p><strong>Abstract:</strong></p><div className="text-black text-base whitespace-pre-wrap">{selectedRow.abstract || "hogehogefugafuga"}</div>
//                 <div className="absolute bottom-4 right-4 flex gap-4">
//                   <Button
//                     className="bg-blue-500 text-white px-4 py-2 rounded"
//                     onClick={startEditing} // 編集モードを開始
//                   >
//                     編集
//                   </Button>
//                 </div>
//               </div>
//             )}

        
//           </div>
//         </div>
//       )}

//       {/* テーブル */}
//       <Table>
//         <TableHeader>
//           <TableRow>
//             {visibleColumns.map((column) => (
//               <TableHead
//                 key={column.id}
//                 className="text-center text-2xl font-medium text-black"
//               >
//                 {column.label}
//               </TableHead>
//             ))}
//             <TableHead className="text-center text-2xl font-medium text-black">
//               pdf
//             </TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {tableData.map((row) => (
//             <TableRow
//               key={row.id}
//               className="cursor-pointer hover:bg-[#f0f4f8] transition-colors"
//               onClick={() => setSelectedRow(row)} // 行をクリックしたときにモーダルを開く
//             >
//               {visibleColumns.map((column) => (
//                 <TableCell key={column.id} className="p-0">
//                   <div className="flex items-center justify-center h-14 w-full text-center text-xl text-black">
//                     {row[column.id] || "N/A"}
//                   </div>
//                 </TableCell>
//               ))}
//               <TableCell>
//                 <div className="flex justify-center items-center h-full w-full">
//                 <Button
//                   className="flex items-center gap-2 bg-[#aac2de] text-white px-3 py-2 rounded-md text-sm hover:bg-[#90b4d4] transition"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                   }}
//                 >
//                   <FaFilePdf className="text-white" />
//                   <span>PDF</span>
//                 </Button>
//                 </div>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };