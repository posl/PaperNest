import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState("verify"); // "verify" or "reset"
  const [username, setUsername] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const isValidPassword = (pw) => /^[a-zA-Z0-9]{6,}$/.test(pw);

  const toHalfWidth = (str) =>
    str.replace(/[！-～]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
    ).replace(/　/g, " ");

  const handleVerify = async () => {
    if (!username || !schoolName) {
      setMessage("ユーザー名と小学校名を入力してください。");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/reset/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, elementary_school: schoolName }),
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.detail || "ユーザー確認に失敗しました。");
        return;
      }

      // setMessage("新しいパスワードを2回入力してください。");
      setStep("reset");
    } catch {
      setMessage("サーバーに接続できません。");
    }
  };

  const handleResetPassword = async () => {
    if (!isValidPassword(newPassword)) {
      setMessage("パスワードは6文字以上の半角英数字で入力してください。");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("パスワードが一致しません。もう一度確認してください。");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/reset/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, new_password: newPassword }),
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.detail || "パスワードリセットに失敗しました。");
        return;
      }

      setMessage("✅ パスワードをリセットしました。ログイン画面に戻ります。");
      setTimeout(() => navigate("/signin"), 2000);
    } catch {
      setMessage("サーバーに接続できません。");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          {step === "verify" ? "ユーザー確認" : "パスワード再設定"}
        </h2>

        {step === "verify" && (
          <>
            <input
              type="text"
              placeholder="ユーザー名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="小学校名"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleVerify}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:scale-[1.01] text-white py-2 rounded-lg hover:bg-blue-700"
            >
              次へ
            </button>
          </>
        )}

        {step === "reset" && (
          <>
            <input
              type="password"
              placeholder="新しいパスワード"
              value={newPassword}
              onChange={(e) => setNewPassword(toHalfWidth(e.target.value))}
              className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              placeholder="パスワード（確認）"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(toHalfWidth(e.target.value))}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
            />
            <p className="pl-1 text-sm text-gray-400 mb-4">
              パスワードは6文字以上の半角英数字で入力してください。
            </p>
            <button
              onClick={handleResetPassword}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              パスワードを再設定する
            </button>
          </>
        )}

        <p
          className={`text-sm text-center mt-4 ${
            message.includes("✅") || message.includes("完了")
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
