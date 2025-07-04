import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "@iconify/react";
import { Separator } from "../../components/ui/separator";

export default function SignInPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth(); // ✅ 先に取得
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // ログイン済みなら /app にリダイレクト
    if (isAuthenticated) {
      navigate("/app", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const toHalfWidth = (str) =>
    str.replace(/[！-～]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
    ).replace(/　/g, " ");

  const handleSignIn = async () => {
    const formData = new URLSearchParams();
    formData.append("username", username.trim());
    formData.append("password", password.trim());

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error("ログインに失敗しました");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      setIsAuthenticated(true); // ✅ 認証状態を更新
      navigate("/app", { replace: true }); // ✅ 履歴に signin を残さない
    } catch (error) {
      console.error("ログインエラー:", error);
      alert("ユーザ名またはパスワードが間違っています。");
    }
  };

return (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-blue-200 px-4">
    {/* Header風ロゴ部分：上部固定 */}
    <div className="w-full flex items-center px-6 mt-6" style={{ height: "70px" }}>
      <Icon icon="file-icons:tortoisesvn" className="text-4xl text-cyan-500" />
      <Separator orientation="vertical" className="h-10 mx-4" />
      <div
        style={{ fontFamily: '"Abril Fatface", serif' }}
        className="text-sky-600 text-3xl font-semibold tracking-wide"
      >
        PaperNest
      </div>
    </div>

    {/* ログインフォーム：縦中央に */}
    <div className="flex-grow flex items-center justify-center mb-[70px]">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2
          className="text-3xl font-bold text-center text-blue-800 mb-8 tracking-wide"
          style={{
            fontFamily: '"Abril Fatface", serif',
            textShadow: "1px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          SignIn
        </h2>

        <input
          type="text"
          placeholder="ユーザ名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        <div className="mt-4 mb-2 flex justify-between text-sm text-blue-500">
          <p onClick={() => window.history.back()} className="hover:underline cursor-pointer">
            戻る
          </p>
          <p onClick={() => navigate("/forgot-password")} className="hover:underline cursor-pointer">
            パスワードを忘れた方へ
          </p>
        </div>
      </div>
    </div>
  </div>
);
}
