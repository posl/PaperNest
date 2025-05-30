import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SignUpPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isValidPassword = (pw) => {
    const regex = /^[a-zA-Z0-9]{6,}$/; // 半角英数字6文字以上
    return regex.test(pw);
  };

  const handleSignUp = () => {
    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage("すべての項目を入力してください。");
      return;
    }

    if (!isValidPassword(password)) {
      setErrorMessage("パスワードは6文字以上の半角英数字で入力してください。");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("パスワードが一致しません。");
      return;
    }

    // エラーなし → 登録処理へ
    setErrorMessage("");
    console.log("SignUp:", { username, email, password });
    navigate("/app");
  };
    // 全角英数字を半角に変換する関数
    const toHalfWidth = (str) =>
        str.replace(/[！-～]/g, (ch) =>
        String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
        ).replace(/　/g, " "); // 全角スペースも半角に変換
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2
        className="text-3xl font-bold text-center text-blue-700 mb-8 tracking-wide"
        style={{
            fontFamily: '"Abril Fatface", serif',
            textShadow: "1px 2px 4px rgba(0, 0, 0, 0.1)",
        }}
        >
        SignUp
        </h2>
        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(toHalfWidth(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* 🔍 パスワード説明 */}
        <p className="pl-4 text-sm text-gray-300 mt-1 mb-1">
          パスワードは6文字以上の半角英数字で入力してください。
        </p>

        <input
          type="password"
          placeholder="パスワード（確認）"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(toHalfWidth(e.target.value))}
          className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* ❗ エラー表示 */}
        {errorMessage && (
          <p className="text-red-600 text-sm mb-4 text-center">{errorMessage}</p>
        )}

        <button
          onClick={handleSignUp}
          className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:scale-[1.01] text-white py-2 rounded-lg hover:bg-blue-700 hover:opacity-90"
        >
          アカウント作成
        </button>
      </div>
    </div>
  );
}
