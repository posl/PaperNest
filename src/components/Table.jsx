import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { FaFilePdf } from "react-icons/fa";
import { EditForm } from "./EditForm";
import { PaperDetailModal } from "./PaperDetailModal"; // ← モーダルコンポーネントをインポート

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

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-6">
      {/* モーダル表示 */}
      <PaperDetailModal
        selectedRow={selectedRow}
        isEditing={isEditing}
        editedData={editedData}
        onClose={closeModal}
        onStartEdit={startEditing}
        onSave={saveChanges}
        onCancelEdit={() => setIsEditing(false)}
        onInputChange={handleInputChange}
      />

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
                      className="px-4 py-3 text-left text-gray-700 font-semibold tracking-wide cursor-pointer select-none hover:text-sky-700"
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

          {/* PDF列（右端に固定） */}
          <div className="absolute top-0 right-0 w-[120px] z-10">
            {/* ヘッダー */}
            <div className="h-[56px] bg-[#f7faff] flex items-center justify-center font-semibold text-gray-700 border-l border-[#f7faff]">
              {/* 空ヘッダー */}
            </div>

            {/* 各行のPDFボタン */}
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
                >
                  <FaFilePdf className="text-white mr-1" />
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
