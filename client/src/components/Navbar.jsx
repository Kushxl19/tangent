import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-10 py-4 bg-[#0f172a] border-b border-gray-800">
      <Link to="/" className="text-2xl font-bold text-white">
        Juss<span className="text-indigo-500">Chat</span>
      </Link>

      <div className="space-x-6 text-gray-300">
        <Link to="/" className="hover:text-white">Home</Link>
        <Link to="/login" className="hover:text-white">Login</Link>
        <Link to="/signup" className="hover:text-white">Signup</Link>
      </div>
    </nav>
  );
}

export default Navbar;