import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { FaFilePdf } from "react-icons/fa";
import { PaperDetailModal } from "./PaperDetailModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export const TableSection = ({ visibleColumns, tableData, setTableData, onUpdateRow, refreshPapers }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const scrollRef = useRef(null);

  const closeModal = () => {
    setSelectedRow(null);
    setIsEditing(false);
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditedData(selectedRow);
  };

  const saveChanges = () => {
    if (onUpdateRow) onUpdateRow(editedData);
    setSelectedRow(editedData);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteRow = (id) => {
    setTableData((prev) => prev.filter((row) => row.paper_id !== id));
    setSelectedRow(null);
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
      <PaperDetailModal
        selectedRow={selectedRow}
        isEditing={isEditing}
        editedData={editedData}
        onClose={closeModal}
        onStartEdit={startEditing}
        onSave={saveChanges}
        onCancelEdit={() => setIsEditing(false)}
        onInputChange={handleInputChange}
        onDelete={() => handleDeleteRow(selectedRow && selectedRow.paper_id)}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        setTableData={setTableData}
        refreshPapers={refreshPapers}
      />

      <div className="relative flex rounded-lg shadow-md bg-white max-h-[calc(100vh-300px)] overflow-hidden">
        <div className="overflow-auto w-full">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 z-20 bg-[#f7faff]">
              <TableRow className="h-[56px]">
                {visibleColumns.map((col) => (
                  <TableHead
                    key={col.id}
                    onClick={() => handleSort(col.id)}
                    className="px-4 py-3 text-left text-gray-700 font-semibold tracking-wide cursor-pointer select-none hover:text-sky-700 whitespace-nowrap"
                  >
                    {col.label}
                    {sortColumn === col.id && (
                      <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
                    )}
                  </TableHead>
                ))}
                <TableHead className="px-4 py-3 text-center font-semibold text-gray-700 sticky right-0 bg-[#f7faff] z-30" style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
                  PDF
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedData.map((row) => (
                <TableRow
                  key={row.paper_id}
                  className="h-[56px] hover:bg-[#f0f4f8] transition-colors cursor-pointer group"
                  onClick={() => setSelectedRow(row)}
                >
                  {visibleColumns.map((col) => (
                    <TableCell key={col.id} className="px-4 py-3 text-gray-800 whitespace-nowrap">
                      {row[col.id] || "N/A"}
                    </TableCell>
                  ))}
                  <TableCell className="px-4 py-3 sticky right-0 bg-white group-hover:bg-[#f0f4f8] border-l transition-colors">
                  <div className="flex justify-center items-center h-full">
                    <Button
                      className="bg-[#aac2de] text-white px-3 py-2 rounded-md text-sm shadow-md hover:bg-[#90b4d4]"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (row.pdf_url) window.open(row.pdf_url, "_blank");
                        else alert("PDFのURLが設定されていません");
                      }}
                    >
                      <FaFilePdf className="text-white mr-1" /> PDF
                    </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};