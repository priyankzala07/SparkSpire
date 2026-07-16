import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContextValue";
import { FaSearch, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('search') || '');
  }, [location.search]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    navigate({
      pathname: '/',
      search: value.trim() ? `?search=${encodeURIComponent(value)}` : ''
    });
  };

  const clearSearch = () => {
    setSearch('');
    navigate({ pathname: '/', search: '' });
  };

  const navLink =
    "px-5 py-2 rounded-full text-slate-300 font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-emerald-500 hover:text-white hover:scale-105 hover:shadow-lg";

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl rounded-lg outline-none border-b border-slate-700 shadow-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-baseline py-4 gap-5 mr-7">

          {/* Logo */}
          <Link
            to="/"
            className="transition-transform duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-1 left-0">

              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg transition-all duration-300 hover:rotate-6 hover:scale-110 hover:shadow-2xl">
                <span className="text-white text-2xl">🎟️</span>
              </div>

              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  SparkSpire
                </h1>

                <p className="text-xs text-slate-400">
                  Discover Amazing Events
                </p>
              </div>

            </div>
          </Link>

          <div className="group relative order-3 w-full lg:order-none lg:flex-1 lg:max-w-2xl">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 opacity-0 blur transition duration-300 group-focus-within:opacity-20" />
            <div className="relative flex items-center rounded-full border border-slate-700/80 bg-slate-900/90 px-1 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.20)] backdrop-blur-xl transition duration-300 group-hover:border-cyan-200 group-hover:shadow-[0_12px_12px_-12px_rgba(6,182,212,0.4)] group-focus-within:border-transparent group-focus-within:bg-slate-900">
              <span className="ml-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 text-xs text-white shadow-md transition duration-300 group-focus-within:scale-110 group-focus-within:rotate-6">
                <FaSearch />
              </span>
              <input
                type="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search events, categories, locations..."
                aria-label="Search events"
                className="min-w-0 flex-1 bg-transparent py-3 pl-3 pr-2 text-sm font-medium text-slate-300 outline-none placeholder:font-normal placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">

            <Link to="/" className={navLink}>
              Events
            </Link>

            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  className={navLink}
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={navLink}>
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-cyan-500 hover:to-blue-600"
                >
                  Sign Up
                </Link>
              </>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
