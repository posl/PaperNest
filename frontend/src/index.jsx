import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { secureFetch } from "./utils/apiClient";

import { AuthProvider } from "./context/AuthContext";

// 元の fetch を確保
const _origFetch = window.fetch.bind(window);

// 認証不要エンドポイントのパス
const noAuthPaths = ["/register/user", "/login", "/refresh", "/reset/verify", "/reset/password", "/uploaded/{paper_id}.pdf", "/papers/update", "/papers/delete/{paper_id}"];

// グローバル fetch を置き換え
window.fetch = (url, options = {}) => {
  // URLが文字列か Requestオブジェクトかに応じて path を取り出し
  const path = typeof url === "string"
    ? new URL(url, window.location.origin).pathname
    : url.url; // Requestインスタンスなら url.url など

  // 認証不要ルートなら元の fetch
  if (noAuthPaths.some(p => path.startsWith(p))) {
    return _origFetch(url, options);
  }

  // それ以外は secureFetch を使う
  return secureFetch(url, options);
};

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
