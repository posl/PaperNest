import React, { useRef, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { Icon } from "@iconify/react";

export const TabScrollArea = ({
  tabs,
  setTabs,
  selectedTabId,
  setSelectedTabId,
  handleContextMenu,
  editingTabId,
  setEditingTabId,
  handleAddTab,
  tabRefs,
}) => {
  const tabScrollRef = useRef(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollLeft = () => {
    tabScrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' });
  };

  const scrollRight = () => {
    tabScrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' });
  };

  const updateScrollButtons = () => {
    const el = tabScrollRef.current;
    if (!el) return;
    setShowScrollButtons(el.scrollWidth > el.clientWidth);
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = tabScrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [tabs]);

  return (
    <div className="relative flex items-center ml-16 w-full max-w-[70%]">
      {showScrollButtons && canScrollLeft && (
        <button onClick={scrollLeft} className="absolute left-0 z-10 h-full px-2 transition-opacity bg-[#EEF8FF] duration-300 opacity-100 hover:bg-white/60">
          <Icon icon="lucide:chevron-left" className="text-gray-500 hover:text-gray-700 z-50" />
        </button>
      )}

      <div ref={tabScrollRef} className="overflow-x-auto no-scrollbar flex gap-4 px-8 pr-10" style={{ scrollBehavior: "smooth" }}>
        {tabs.map((tab) => (
          <div key={tab.id} className="flex items-center">
            {editingTabId === tab.id ? (
              <input
                value={tab.name}
                onChange={(e) =>
                  setTabs((prevTabs) =>
                    prevTabs.map((t) => (t.id === tab.id ? { ...t, name: e.target.value } : t))
                  )
                }
                onBlur={() => tab.name.trim() && setEditingTabId(null)}
                onKeyDown={(e) => e.key === "Enter" && tab.name.trim() && setEditingTabId(null)}
                className="border border-gray-300 px-2 py-1 rounded text-sm"
                autoFocus
              />
            ) : (
              <Button
                ref={(el) => (tabRefs.current[tab.id] = el)}
                variant="ghost"
                className={`text-sm px-4 py-2 rounded-md transition-colors ${
                  selectedTabId === tab.id
                    ? "bg-sky-100 text-sky-700 hover:bg-sky-100 hover:text-sky-700"
                    : "text-gray-600 hover:bg-sky-100 hover:text-gray-700"
                }`}
                onClick={() => {
                  setSelectedTabId(tab.id);
                }}
                onContextMenu={(e) => handleContextMenu(e, tab.id)}
                onDoubleClick={() => setEditingTabId(tab.id)}
              >
                {tab.name}
              </Button>
            )}
          </div>
        ))}
      </div>

      {showScrollButtons && canScrollRight && (
        <button onClick={scrollRight} className="absolute right-10 z-10 h-full px-2 transition-opacity bg-[#EEF8FF] duration-300 opacity-100 hover:bg-white/60">
          <Icon icon="lucide:chevron-right" className="text-gray-500 hover:text-gray-700" />
        </button>
      )}

      <Button
        className="ml-4 bg-gradient-to-tr from-sky-400 to-blue-500 w-[32px] h-[32px] rounded-md text-white shadow-sm will-change-transform hover:scale-110 transform-gpu transition"
        onClick={handleAddTab}
      >
        <PlusIcon className="w-5 h-5" />
      </Button>
    </div>
  );
};
