export const [isMenuOpen, setIsMenuOpen] = useState(false);
export const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

{isMenuOpen && (
    <div className="absolute right-[30px] top-[120px] w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <ul className="py-2">
        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">プロフィール</li>
        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">設定</li>
        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ログアウト</li>
      </ul>
    </div>
  )}