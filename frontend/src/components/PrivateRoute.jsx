import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) return null; // ローディング中は何も描画しない

  return isAuthenticated ? children : <Navigate to="/signin" />;
};

export default PrivateRoute;
