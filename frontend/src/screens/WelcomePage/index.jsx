import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 text-center px-4">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">PaperNest</h1>
      <p className="text-gray-700 mb-8">
        あなたの研究をもっとスマートに。論文をテーマで分類・管理し、PDF閲覧・質問まで一括で行える研究支援アプリです。
      </p>
      <div className="space-x-4">
        <button
          onClick={() => navigate("/signin")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          サインイン
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="bg-white border border-blue-600 text-blue-600 px-6 py-2 rounded-lg shadow hover:bg-blue-50"
        >
          サインアップ
        </button>
      </div>
    </div>
  );
}
