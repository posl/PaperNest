import React, { useState, useEffect, useRef } from "react";
import { Separator } from "./ui/separator";
import { Icon } from '@iconify/react';
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { TabScrollArea } from "./header/TabScrollArea";
import { UserMenu } from "./header/UserMenu";

export const Header = ({ isMenuOpen, setIsMenuOpen, tabs, setTabs, selectedTabId, setSelectedTabId, handleAddTab, onRenameCategory, editingTabId, setEditingTabId, setEditingOldName }) => {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, tabId: null });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tabIdToDelete, setTabIdToDelete] = useState(null);

  const menuRef = useRef(null);
  const tabRefs = useRef({});

  const handleContextMenu = (e, tabId) => {
    e.preventDefault();
    const rect = tabRefs.current[tabId]?.getBoundingClientRect();
    if (!rect) return;
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

  const handleConfirmDeleteTab = async () => {
    try {
      const token = localStorage.getItem("token");
      const tabToDelete = tabs.find(t => t.id === tabIdToDelete);
      if (tabToDelete) {
        await fetch(`http://192.168.35.242:8000/delete/${encodeURIComponent(tabToDelete.name)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error("タブ削除エラー:", err);
    }
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

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (contextMenu.visible && menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu({ visible: false, x: 0, y: 0, tabId: null });
      }
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [contextMenu.visible]);

  return (
    <>
      <header className="w-full h-[118px] bg-[#EEF8FF] shadow-sm flex px-10 items-center">
        {/* 左側ロゴとタイトル */}
        <div className="flex items-center">
          <Icon icon="file-icons:tortoisesvn" className="text-4xl text-cyan-500" />
          <Separator orientation="vertical" className="h-10 mx-4" />
          <div style={{ fontFamily: '"Abril Fatface", serif' }} className="text-sky-600 text-3xl font-semibold tracking-wide">
            PaperNest
          </div>
        </div>

        {/* 中央のスクロール可能なタブ領域 */}
        <TabScrollArea
          tabs={tabs}
          setTabs={setTabs}
          selectedTabId={selectedTabId}
          setSelectedTabId={setSelectedTabId}
          handleContextMenu={handleContextMenu}
          editingTabId={editingTabId}
          setEditingTabId={setEditingTabId}
          setEditingOldName={setEditingOldName}
          handleAddTab={handleAddTab}
          tabRefs={tabRefs}
          onRenameCategory={onRenameCategory}
        />

        {/* 右側アバターメニュー */}
        <UserMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      </header>

      {/* コンテキストメニュー */}
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
        message="このタブを削除してもよろしいですか？"
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteTab}
      />
    </>
  );
};
