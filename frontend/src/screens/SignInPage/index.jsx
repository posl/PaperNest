import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SignInPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 全角英数字を半角に変換
  const toHalfWidth = (str) =>
    str.replace(/[！-～]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
    ).replace(/　/g, " ");

  const handleSignIn = () => {
    console.log("ログイン:", { email, password });
    navigate("/app");
  };

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
          SignIn
        </h2>

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
          onChange={(e) => setPassword(e.target.value)}
          onBlur={(e) => setPassword(toHalfWidth(e.target.value))}
          className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSignIn}
          className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:scale-[1.01] text-white py-2 rounded-lg hover:bg-blue-700 hover:opacity-90 transition"
        >
          ログイン
        </button>
      </div>
    </div>
  );
}
