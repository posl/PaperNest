import { useState } from "react";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const isValidPassword = (pw) => /^[a-zA-Z0-9]{6,}$/.test(pw);

  const handleResetPassword = async () => {
    if (!username || !schoolName || !newPassword) {
      setMessage("全ての情報を入力してください。");
      return;
    }

    if (!isValidPassword(newPassword)) {
      setMessage("パスワードは6文字以上の半角英数字で入力してください。");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/reset/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          elementary_school: schoolName,
          new_password: newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.detail || "エラーが発生しました。");
        return;
      }

      setMessage("✅ パスワードをリセットしました。ログインしてください。");
    } catch {
      setMessage("再設定に失敗しました。サーバーに接続できません。");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">パスワード再設定</h2>

        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="小学校名"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="password"
          placeholder="新しいパスワード"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg"
        />

        <button
          onClick={handleResetPassword}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          パスワードを再設定する
        </button>

        {message && <p className="text-sm text-center text-red-500 mt-4">{message}</p>}
      </div>
    </div>
  );
}
