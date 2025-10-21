import { createContext, useContext, useEffect, useState } from "react";
import { secureFetch } from "../utils/apiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
 const [isAuthenticated, setIsAuthenticated] = useState(null); // null = 未判定
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // ← 追加

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const res = await secureFetch(`${import.meta.env.VITE_API_BASE_URL}/get_user_info`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("トークン検証失敗:", err);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false); // ← 最後に検証完了を明示
      }
    };

    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isCheckingAuth, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
