import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bike, User, Menu, X, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import { toast } from "sonner";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Rent a Cycle", path: "/rent" },
    { name: "Pricing", path: "/pricing" },
    { name: "About Us", path: "/about" },
  ];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    toast.success("Logged out successfully. See you on the road!");
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-kolkata-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-kolkata-yellow p-2 rounded-lg group-hover:rotate-12 transition-transform">
              <Bike className="w-6 h-6 text-kolkata-black" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tighter">
              RIDE<span className="text-kolkata-yellow">KOLKATA</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "font-medium transition-colors hover:text-kolkata-yellow",
                  location.pathname === link.path ? "text-kolkata-yellow" : "text-kolkata-black"
                )}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-kolkata-yellow/10 hover:bg-kolkata-yellow/20 border border-kolkata-yellow/30 px-3 py-2 rounded-full transition-all"
                >
                  <div className="w-8 h-8 bg-kolkata-yellow rounded-full flex items-center justify-center text-kolkata-black font-black text-sm">
                    {initials}
                  </div>
                  <span className="font-bold text-sm max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", dropdownOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 glass-card rounded-2xl overflow-hidden py-2 shadow-2xl"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-bold text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-kolkata-yellow" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-primary py-2 px-5 flex items-center gap-2">
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-kolkata-black/5 px-4 py-6 flex flex-col gap-4"
          >
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 p-4 bg-kolkata-yellow/10 rounded-2xl border border-kolkata-yellow/20 mb-2">
                <div className="w-10 h-10 bg-kolkata-yellow rounded-full flex items-center justify-center text-kolkata-black font-black">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-lg font-medium",
                  location.pathname === link.path ? "text-kolkata-yellow" : "text-kolkata-black"
                )}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-primary text-center flex items-center justify-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 py-3 rounded-full font-bold text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-center flex items-center justify-center gap-2">
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
