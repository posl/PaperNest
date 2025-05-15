import React, { useState, useEffect, useRef } from "react";
import { Separator } from "../components/ui/separator";
import { Avatar } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { PlusIcon } from "lucide-react";
import { Icon } from '@iconify/react';
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

export const Header = ({ isMenuOpen, setIsMenuOpen, tabs, setTabs, selectedTabId, setSelectedTabId, handleAddTab }) => {
  const [editingTabId, setEditingTabId] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, tabId: null });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tabIdToDelete, setTabIdToDelete] = useState(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const tabRefs = useRef({});
  const menuRef = useRef(null);
  const tabScrollRef = useRef(null);

  const handleContextMenu = (e, tabId) => {
    e.preventDefault();
    if (contextMenu.visible && contextMenu.tabId === tabId) {
      setContextMenu({ visible: false, x: 0, y: 0, tabId: null });
      return;
    }
    const target = tabRefs.current[tabId];
    if (!target) return;
    const rect = target.getBoundingClientRect();
    setContextMenu({
      visible: true,
      x: rect.left,
      y: rect.bottom,
      tabId,
    });
  };

  const handleRequestDeleteTab = () => {
    setIsDeleteModalOpen(true);
    setTabIdToDelete(contextMenu.tabId);
    setContextMenu({ visible: false, x: 0, y: 0, tabId: null });
  };

  const handleConfirmDeleteTab = () => {
    setTabs((prevTabs) => prevTabs.filter((t) => t.id !== tabIdToDelete));
    if (selectedTabId === tabIdToDelete && tabs.length > 1) {
      setSelectedTabId(tabs[0].id);
    }
    setIsDeleteModalOpen(false);
  };

  const handleStartRenameTab = () => {
    setEditingTabId(contextMenu.tabId);
    setContextMenu({ visible: false, x: 0, y: 0, tabId: null });
  };

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
    const handleGlobalClick = (e) => {
      if (
        contextMenu.visible &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setContextMenu({ visible: false, x: 0, y: 0, tabId: null });
      }
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [contextMenu.visible]);

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
    <>
      <header className="w-full h-[118px] bg-[#EEF8FF] shadow-sm flex px-10 items-center">
        <div className="flex items-center">
          <Icon icon="file-icons:tortoisesvn" className="text-4xl text-cyan-500" />
          <Separator orientation="vertical" className="h-10 mx-4" />
          <div style={{ fontFamily: '"Abril Fatface", serif' }} className="text-sky-600 text-3xl font-semibold tracking-wide">
            PaperNest
          </div>
        </div>

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
                      setContextMenu({ visible: false, x: 0, y: 0, tabId: null });
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
            className="ml-4 bg-sky-600 text-white rounded-md p-2 hover:bg-sky-700 transition shrink-0"
            onClick={handleAddTab}
          >
            <PlusIcon className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center ml-auto relative">
          <Avatar
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 bg-gray-800 text-white rounded-full cursor-pointer"
          />
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 top-[60px] w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <ul className="py-2">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">プロフィール</li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">設定</li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ログアウト</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </header>

      {contextMenu.visible && (
        <div
          ref={menuRef}
          className="absolute z-50 min-w-[160px] bg-white rounded-xl shadow-xl ring-1 ring-gray-200"
          style={{ top: contextMenu.y + window.scrollY + 4, left: contextMenu.x + window.scrollX + 40 }}
        >
          <div
            onClick={handleStartRenameTab}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-neutral-100 transition cursor-pointer"
          >
            <Icon icon="ph:pencil-simple-duotone" className="text-gray-500 text-base mr-2" />
            名前を変更
          </div>
          <div
            onClick={handleRequestDeleteTab}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-neutral-100 transition cursor-pointer"
          >
            <Icon icon="ph:trash-duotone" className="text-red-500 text-base mr-2" />
            タブを削除
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteTab}
      />
    </>
  );
};