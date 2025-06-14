import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // 認証判定がまだ終わっていないときは何も表示しない
  if (isAuthenticated === null) {
    return null; // または <LoadingScreen /> とか
  }

  return isAuthenticated ? children : <Navigate to="/signin" />;
};

export default PrivateRoute;
