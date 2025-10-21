// オリジナルの fetch を保持（無限ループを防止）
const originalFetch = window.fetch.bind(window);

export const secureFetch = async (url, options = {}) => {
  // 既存トークンを取得 (旧 'token' または 'access_token' キーに対応)
  let accessToken = localStorage.getItem("access_token") || localStorage.getItem("token");

  // FormData 用に Content-Type を自動設定しないヘッダ生成ヘルパー
  const makeHeaders = (token) => {
    const headers = { ...(options.headers || {}) };
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  // 実際にfetchを呼び出すヘルパー関数
  const doFetch = (token) => {
    return originalFetch(url, {
      ...options,
      headers: makeHeaders(token),
    });
  };

  // 1回目のリクエスト
  let response = await doFetch(accessToken);

  // 401 Unauthorizedならリフレッシュトークンで再取得
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      const refreshRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshRes.ok) {
        const { access_token: newToken } = await refreshRes.json();
        // 新トークンを保存
        localStorage.setItem("access_token", newToken);
        accessToken = newToken;
        // 再試行
        response = await doFetch(accessToken);
      } else {
        // リフレッシュ失敗時はログアウト
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return response;
      }
    }
  }

  return response;
};
