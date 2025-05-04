import React from "react";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";

export const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  filterOptions,
  selectedColumns,
  handleCheckboxChange,
  handleApplyFilters,
}) => {
  if (!isSidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="ml-4 mt-2 flex justify-center items-center w-7 h-[35px]"
      >
        <img
          className="w-7 h-[35px]"
          alt="Open Sidebar"
          src="https://c.animaapp.com/f9osxd0I/img/polygon-1.svg"
        />
      </button>
    );
  }

  return (
    <aside className="w-[300px] h-[100vh] border-r border-gray-200 px-4 py-2 relative bg-gray-100">
      <button
        onClick={toggleSidebar}
        className="absolute top-2 right-2 flex justify-center items-center w-7 h-[35px]"
      >
        <img
          className="w-7 h-[35px]"
          alt="Close Sidebar"
          src="https://c.animaapp.com/f9osxd0I/img/polygon-1.svg"
        />
      </button>

      {filterOptions.map((option) => (
        <div key={option.id} className="flex items-center mb-6">
          <Checkbox
            id={option.id}
            className="w-5 h-5 rounded-[3px] border-black"
            checked={selectedColumns.includes(option.id)}
            onCheckedChange={() => handleCheckboxChange(option.id)}
          />
          <label
            htmlFor={option.id}
            className="ml-8 font-medium text-xl text-black"
          >
            {option.label}
          </label>
        </div>
      ))}

      <Button
        className="mt-8 w-[133px] h-[41px] bg-[#d9d9d9] rounded-[3px]"
        onClick={handleApplyFilters}
      >
        反映させる
      </Button>
    </aside>
  );
};