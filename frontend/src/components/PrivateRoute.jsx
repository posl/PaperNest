import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ✅ default エクスポートに変更
export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
}
