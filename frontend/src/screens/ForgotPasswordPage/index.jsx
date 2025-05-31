import { useState } from "react";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [validated, setValidated] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  // パスワード形式チェック（任意）
  const isValidPassword = (pw) => /^[a-zA-Z0-9]{6,}$/.test(pw);

  const handleValidate = async () => {
    try {
      const res = await fetch("/api/validate-user-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, schoolName }),
      });
      const result = await res.json();

      if (result.valid) {
        setValidated(true);
        setMessage("");
      } else {
        setMessage("一致する情報が見つかりませんでした。");
      }
    } catch (err) {
      setMessage("確認中にエラーが発生しました。");
    }
  };

  const handleResetPassword = async () => {
    if (!isValidPassword(newPassword)) {
      setMessage("パスワードは6文字以上の半角英数字で入力してください。");
      return;
    }

    try {
      await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, newPassword }),
      });
      setMessage("パスワードを再設定しました。ログインしてください。");
    } catch {
      setMessage("再設定に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">パスワード再設定</h2>

        {!validated ? (
          <>
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
              className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleValidate}
              className="w-full bg-sky-600 text-white py-2 rounded-lg hover:bg-sky-700"
            >
              パスワードの再設定
            </button>
          </>
        ) : (
          <>
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
          </>
        )}

        {message && <p className="text-sm text-center text-red-500 mt-4">{message}</p>}
      </div>
    </div>
  );
}
