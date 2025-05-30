import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-200 text-center px-4">
      <h1 style={{ fontFamily: '"Abril Fatface", serif', textShadow: "1px 2px 4px rgba(0,0,0,0.2)" }} className="pb-2 text-6xl font-extrabold bg-gradient-to-br from-sky-400 to-blue-700 text-transparent bg-clip-text tracking-wide mb-8">PaperNest</h1>
        <p className="text-center text-gray-600 text-lg font-serif leading-loose max-w-md mx-auto px-4 mb-8">
        あなたの研究をもっとスマートに。<br />
        論文をテーマで分類・管理し、PDF閲覧・質問まで<br />
        一括で行える研究支援アプリです。
        </p>



      <div className="flex gap-4">
        <button
          onClick={() => navigate("/signin")}
          className="mt-6 px-10 py-3 text-lg border-white bg-gradient-to-r from-sky-500 to-blue-600 hover:scale-[1.03] text-white rounded-lg shadow hover:bg-blue-700 hover:opacity-90"
        >
          SignIn
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="mt-6 px-10 py-3 bg-white text-lg text-blue-600 hover:scale-[1.04] rounded-lg shadow hover:bg-blue-50"
        >
          SignUp
        </button>
      </div>
    </div>
  );
}
