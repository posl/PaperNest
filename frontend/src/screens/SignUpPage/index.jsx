import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "@iconify/react";
import { Separator } from "../../components/ui/separator";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const [successMessage, setSuccessMessage] = useState("");

  const [username, setUsername] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isValidPassword = (pw) => {
    const regex = /^[a-zA-Z0-9]{6,}$/; // 半角英数字6文字以上
    return regex.test(pw);
  };

  const handleSignUp = async () => {
    if (!username || !schoolName || !password || !confirmPassword) {
      setErrorMessage("すべての項目を入力してください。未入力の欄があるかご確認ください。");
      return;
    }
  
    if (!isValidPassword(password)) {
      setErrorMessage("パスワードは6文字以上の半角英数字で入力してください。");
      return;
    }
  
    if (password !== confirmPassword) {
      setErrorMessage("パスワードが一致しません。もう一度確認してください。");
      return;
    }
  
    try {
      const res = await fetch("http://localhost:8000/register/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          elementary_school: schoolName,
          password,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        if (res.status === 400) {
          setErrorMessage(data.detail || "このユーザー名はすでに使用されています。");
        } else if (res.status === 422) {
          const firstError = data?.detail?.[0]?.msg || "入力に誤りがあります。";
          setErrorMessage(firstError);
        } else {
          setErrorMessage("登録中に問題が発生しました。しばらくして再試行してください。");
        }
        return;
      }
  
      // 🎉 成功時の処理
      setErrorMessage("");
      setSuccessMessage("✅ アカウント登録が完了しました！ホームに移動します。");
      try {
        const loginRes = await fetch("http://localhost:8000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: username,
            password: password,
          }),
        });
      
        if (!loginRes.ok) throw new Error("自動ログインに失敗しました");
      
        const loginData = await loginRes.json();
        localStorage.setItem("token", loginData.access_token);
        localStorage.setItem("refresh_token", loginData.refresh_token);
        setIsAuthenticated(true);
        navigate("/app", { replace: true });
      } catch (loginErr) {
        console.error("ログイン失敗:", loginErr);
        setErrorMessage("ログイン処理に失敗しました。再度ログインしてください。");
      }
      
      setTimeout(() => {
        setIsAuthenticated(true);
        navigate("/app", { replace: true });
      }, 1500);
      console.log("登録成功:", data);
    } catch (err) {
      setErrorMessage("サーバーに接続できませんでした。ネットワークをご確認ください。");
    }
  };
    // 全角英数字を半角に変換する関数
    const toHalfWidth = (str) =>
        str.replace(/[！-～]/g, (ch) =>
        String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
        ).replace(/　/g, " "); // 全角スペースも半角に変換
  

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
       <div className="flex-grow flex items-center justify-center mb-[70px]">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2
        className="text-3xl font-bold text-center text-blue-800 mb-8 tracking-wide"
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
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
        type="text"
        placeholder="小学校名"
        value={schoolName}
        onChange={(e) => setSchoolName(e.target.value)}
        className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        

        {/* ❗ エラー表示 */}
        {errorMessage && (
          <p className="text-red-600 text-sm mb-4 text-center">{errorMessage}</p>
        )}
        {successMessage && (
            <p className="text-green-600 text-sm mb-4 text-center">
                {successMessage}
            </p>
        )}

        <button
          onClick={handleSignUp}
          className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:scale-[1.01] text-white py-2 rounded-lg hover:bg-blue-700 hover:opacity-90"
        >
          アカウント作成
        </button>
        <div className="mt-4 mb-2 flex justify-between text-sm text-blue-500">
          <p onClick={() => window.history.back()} className="hover:underline cursor-pointer">
            戻る
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
