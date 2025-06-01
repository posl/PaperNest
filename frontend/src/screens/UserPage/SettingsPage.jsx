// src/screens/UserPage/SettingsPage.jsx
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { secureFetch } from "../../utils/apiClient";
import { Separator } from "../../components/ui/separator";
import { Modal } from "../../components/ui/modal";
import { useNavigate } from "react-router-dom";
import { DeleteAccountModal } from "../../components/DeleteAccountModal";


const Header = () => (
  <header className="w-full h-[118px] bg-[#EEF8FF] shadow-sm flex px-10 items-center">
    <div className="flex items-center">
      <Icon icon="file-icons:tortoisesvn" className="text-4xl text-cyan-500" />
      <Separator orientation="vertical" className="h-10 mx-4" />
      <div style={{ fontFamily: '"Abril Fatface", serif' }} className="text-sky-600 text-3xl font-semibold tracking-wide">
        PaperNest
      </div>
    </div>
  </header>
);

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [message, setMessage] = useState("");

  // モーダル関連
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await secureFetch("http://localhost:8000/get_user_info");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUsername(data.username || "");
        setSchoolName(data.elementary_school || "");
      } catch {
        setMessage("ユーザー情報の取得に失敗しました");
      }
    };
    fetchUserInfo();
  }, []);

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("すべてのパスワード欄を入力してください");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("新しいパスワードと確認用パスワードが一致しません");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/change/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          old_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (res.ok) {
        setMessage("パスワードを変更しました！");
        setShowModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const result = await res.json();
        setMessage(result.detail || "パスワード変更に失敗しました");
      }
    } catch {
      setMessage("通信エラーが発生しました");
    }
  };
  const navigate = useNavigate(); // 👈 ナビゲーション用
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
    navigate("/", { replace: true }); // ログアウト後にホームへリダイレクト
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("http://localhost:8000/delete/account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });
  
      if (res.ok) {
        localStorage.removeItem("token");
        window.location.href = "/";
        navigate("/", { replace: true });  // または WelcomePage へ
      } else {
        const result = await res.json();
        setMessage(result.detail || "アカウント削除に失敗しました");
      }
    } catch {
      setMessage("通信エラーが発生しました");
    }
  };

  return (
    <>
      <Header />
      {/* ← 戻るボタン */}
      <div className="px-10 mt-4">
        <button
            onClick={() => window.history.back()}
            className="group relative inline-flex items-center"
            style={{ padding: '12px 16px' }} // ホバー領域拡張
        >
            <div className="absolute inset-0  rounded transition-all duration-150" />
            <div className="relative flex items-center gap-1">
            <Icon
                icon="material-symbols:arrow-back-ios-rounded"
                className="text-xl group-hover:-translate-x-1 transition-transform duration-200"
            />
            <span className="text-base text-gray-600 group-hover:text-black transition-colors">戻る</span>
            </div>
        </button>
        </div>

      <div className="flex justify-center mt-16 px-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-xl">
          <h1 className="text-2xl font-bold text-sky-700 mb-6 text-center">プロフィール</h1>

          <div className="mb-4">
            <label className="block text-gray-600 mb-1">ユーザー名</label>
            <input
              type="text"
              value={username}
              disabled
              className="w-full px-4 py-2 text-xl text-gray-400 border border-transparent bg-gray-100 rounded-lg"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-600 mb-1">小学校名</label>
            <input
              type="text"
              value={schoolName}
              disabled
              className="w-full px-4 py-2 text-xl text-gray-400 border border-transparent bg-gray-100 rounded-lg"
            />
          </div>

          <hr className="my-6" />

          <h2 className="text-lg font-semibold text-gray-700 mb-4">パスワード</h2>
          <div className="flex items-center justify-between">
            <p className="text-gray-500 tracking-wider text-sm">*********************</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-sky-700 hover:underline"
            >
              パスワードを変更
            </button>
          </div>

            {!showModal && message === "パスワードを変更しました！" && (
            <p className="text-center text-green-500 mt-4">{message}</p>
            )}
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <div className="w-full max-w-xl px-8">
          <hr className="my-6" />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-black hover:underline"
            >
              ログアウト
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-sm text-red-600 hover:text-red-800 hover:underline"
            >
              アカウントを削除
            </button>
            <DeleteAccountModal
            isOpen={showDeleteModal}
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteAccount}
            deletePassword={deletePassword}
            setDeletePassword={setDeletePassword}
            />
          </div>
        </div>
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="パスワードを変更">
          <div className="space-y-4">
            <input
              type="password"
              placeholder="現在のパスワード"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
            <input
              type="password"
              placeholder="新しいパスワード"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
            <input
              type="password"
              placeholder="新しいパスワード（確認）"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
            {showModal && message && message !== "パスワードを変更しました！" && (
            <p className="text-center text-red-500">{message}</p>
            )}
            <button
              onClick={handlePasswordUpdate}
              className="w-full bg-sky-700 text-white py-2 rounded-lg hover:bg-sky-600"
            >
              更新
            </button>


          </div>
        </Modal>
      )}
    </>
  );
}
