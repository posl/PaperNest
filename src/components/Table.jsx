import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { EditForm } from "./EditForm"; // 編集フォームをインポート  
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export const TableSection = ({ visibleColumns, tableData, onUpdateRow }) => {
  // モーダルの状態を管理
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // 編集モードの状態
  const [editedData, setEditedData] = useState({}); // 編集中のデータ

  // モーダルを閉じる関数
  const closeModal = () => {
    setSelectedRow(null);
    setIsEditing(false); // 編集モードをリセット
  };

  // 編集モードを開始する関数
  const startEditing = () => {
    setIsEditing(true);
    setEditedData(selectedRow); // 選択された行のデータをコピー
  };

  const saveChanges = () => {
    console.log("保存ボタンが押されました:", editedData);
    if (onUpdateRow) {
      onUpdateRow(editedData); // 親コンポーネントのデータを更新
    } else {
      console.error("onUpdateRow が定義されていません");
    }
    setSelectedRow(editedData); // モーダル内のデータを更新
    setIsEditing(false);
  };

  // フォームの入力値を更新する関数
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div>
      {/* モーダル */}
      {selectedRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal} // 背景をクリックしたらモーダルを閉じる
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[1300px] h-[900px] relative"
            onClick={(e) => e.stopPropagation()} // モーダル内部のクリックを無視
          >

            {/* 閉じるボタン */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-4xl font-bold"
              onClick={closeModal}
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4">詳細情報</h2>

            {/* 編集モード */}
            {isEditing ? (
              <EditForm
              editedData={editedData}
              handleInputChange={handleInputChange}
              onSave={saveChanges}
              onCancel={() => setIsEditing(false)}
            />
            ) : (
              // 通常モード
              <div>
                <p><strong>Title:</strong> {selectedRow.title}</p>
                <p><strong>Author:</strong> {selectedRow.author || "N/A"}</p>
                <p><strong>Year:</strong> {selectedRow.year || "N/A"}</p>
                <p><strong>Conference:</strong> {selectedRow.conference || "N/A"}</p>
                <p><strong>Core-rank:</strong> {selectedRow["core-rank"] || "N/A"}</p>
                <p><strong>book:</strong> {selectedRow.book || "N/A"}</p>
                <p><strong>Abstract:</strong></p><div className="text-black text-base whitespace-pre-wrap">{selectedRow.abstract || "hogehogefugafuga"}</div>
                <div className="absolute bottom-4 right-4 flex gap-4">
                  <Button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={startEditing} // 編集モードを開始
                  >
                    編集
                  </Button>
                </div>
              </div>
            )}

        
          </div>
        </div>
      )}

      {/* テーブル */}
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
            <TableHead className="text-center text-2xl font-medium text-black">
              pdf
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer hover:bg-gray-200"
              onClick={() => setSelectedRow(row)} // 行をクリックしたときにモーダルを開く
            >
              {visibleColumns.map((column) => (
                <TableCell key={column.id} className="p-0">
                  <div className="flex items-center justify-center h-14 w-full text-center text-xl text-black">
                    {row[column.id] || "N/A"}
                  </div>
                </TableCell>
              ))}
              <TableCell>
                <div className="flex justify-center items-center h-full w-full">
                  <Button
                    className="w-[101px] h-14 bg-purple-100 border border-solid border-gray-300 rounded-md"
                    onClick={(e) => {
                      e.stopPropagation(); // 行全体のクリックイベントを無効化
                      console.log("PDFを開くボタンがクリックされました");
                      // PDFを開く処理をここに追加
                    }}
                  >
                    <span className="text-[13px] font-medium text-black">
                      pdfを開く
                    </span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};