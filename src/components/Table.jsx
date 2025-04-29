import React from "react";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export const TableSection = ({ visibleColumns, tableData }) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                {/* 表示する列 */}  
                {visibleColumns.map((column) => (
                    <TableHead
                    key={column.id}
                    className="text-center text-2xl font-medium text-black"
                    >
                    {column.label}
                    </TableHead>
                ))}
                <TableHeader className="flex justify-center text-center text-2xl font-medium text-black">
                    pdf
                </TableHeader>
                </TableRow>
            </TableHeader>
            <TableBody>
                {/* テーブルデータ */}
                {tableData.map((row) => (
                <TableRow key={row.id}>
                    {visibleColumns.map((column) => (
                    <TableCell key={column.id} className="p-0">
                        <div className="flex items-center justify-center h-14 w-full text-center text-xl text-black">
                        {column.id === "title"
                        ? row.title
                        : column.id === "author"
                        ? "author"
                        : column.id === "year"
                        ? "2025"
                        : column.id === "conference"
                        ? "conference"
                        : column.id === "core-rank"
                        ? "A"
                        : column.id === "book"
                        ? "Book Name"
                        : null}
                        </div>
                    </TableCell>
                    ))}
                    <TableCell>
                        <div className="flex justify-center items-center h-full w-full">
                            <Button className="w-[101px] h-14 bg-purple-100 border border-solid border-gray-300 rounded-md">
                              <span className="text-[13px] font-medium text-black">pdfを開く</span>
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};