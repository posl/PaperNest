import React from "react";
import { Avatar } from "../ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 

export const UserMenu = ({ isMenuOpen, setIsMenuOpen }) => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
    // ここでログイン状態をクリアしたりすればOK
    setIsAuthenticated(false);
    console.log("ログアウトしました");
    setIsMenuOpen(false);
    navigate("/");
  };

  const handleNavigate = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="flex items-center ml-auto relative">
      <Avatar
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-10 h-10 bg-gray-800 text-white rounded-full cursor-pointer"
      />
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute right-0 top-[60px] w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <ul className="py-2">
              {/* <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleNavigate("/profile")}
              >
                プロフィール
              </li> */}
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleNavigate("/settings")}
              >
                設定
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleLogout}
              >
                ログアウト
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
