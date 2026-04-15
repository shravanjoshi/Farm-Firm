import { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext"; // Adjust path if needed
import { toast } from "react-toastify";
import { useRef, useEffect } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // ──── NEW ──── added for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allUsers, setAllUsers] = useState([]); // This will hold the list of all farmers and firms for search
  const location = useLocation();
  const navigate = useNavigate();

  const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4003";

  const { isLoggedIn, setIsLoggedIn, setUser, user } = useContext(AuthContext);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Crops", path: "/crops" },
    { name: "Requests", path: "/allrequests" }
  ];

  const farmerLinks = [
    { name: "Listed Crops", path: "/listed-crops" },
    { name: "Requested-Crops", path: "/requested-crops" },
    { name: "Quotations", path: "/my-quotations" },
    { name: "Profile", path: "/profile" },
  ];

  const firmLinks = [
    { name: "My Requests", path: "/requests" },
    { name: "Profile", path: "/profile" },
  ];

  const isActive = (path) => location.pathname === path;
  const inputRef = useRef(null);

  // simple filter — shows up to 6 matching results
  const filteredSuggestions = allUsers
    .filter(user =>
      user.name.toLowerCase().startsWith(searchQuery.toLowerCase().trim()) ||
      user.city.toLowerCase().startsWith(searchQuery.toLowerCase().trim()) ||
      user.state.toLowerCase().startsWith(searchQuery.toLowerCase().trim())

    )
    .slice(0, 6);
  // ──────────────
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch(`${backendApiUrl}/api/users`,   // ← fixed: used environment variable + template literal
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await response.json();
        console.log("Fetched users for search:", data); // Debug log
        if (response.ok) {
          setAllUsers(data); // expected: array of { id, name, userType, ... }
        } else {
          console.error("Failed to fetch users:", data.error || response.statusText);
          setFetchError(data.error || "Failed to load user list");
        }
      } catch (err) {
        console.error("Network error while fetching users:", err);
        setFetchError("Could not connect to server");
      }
    };

    fetchAllUsers();
  }, []);
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendApiUrl}/api/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();
      console.log("Logout response:", data); // Debug log
      if (response.ok) {
        toast.success(data.message || "Logged out successfully");
      } else {
        toast.error(data.error || "Logout failed");
      }
    } catch (error) {
      // Even on network error, we usually want to clear local state
      toast.success("Logged out successfully");
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      navigate("/");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-emerald-50 text-2xl">🌾</span>
            </div>
            <span className="font-bold text-xl text-gray-900">KrishiConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-emerald-600 ${isActive(link.path) ? "text-emerald-600 font-semibold" : "text-gray-600"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            {/* Conditional links based on user type */}
            {isLoggedIn && user?.userType === "firm" &&
              firmLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-emerald-600 ${isActive(link.path) ? "text-emerald-600 font-semibold" : "text-gray-600"
                    }`}
                >
                  {link.name}
                </Link>
              ))}

            {isLoggedIn && user?.userType === "farmer" &&
              farmerLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-emerald-600 ${isActive(link.path) ? "text-emerald-600 font-semibold" : "text-gray-600"
                    }`}
                >
                  {link.name}
                </Link>
              ))}

            {isLoggedIn &&
              <div className="relative">
                {/* ──── MODIFIED: added value, onChange, onFocus ──── */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search farmers or firms..."
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(e.target.value.trim().length > 0);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                />

                {/* ──── NEW: suggestion dropdown ──── */}
                {showSuggestions && (
                  <div
                    className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 text-sm"
                  >
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((item) => (
                        <button
                          key={item._id || item.id}
                          type="button"
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                          onClick={() => {
                            navigate(`/profile/${item.id}?userType=${item.userType}`);
                            setSearchQuery("");
                            setShowSuggestions(false);
                          }}
                        >
                          <span className="font-medium text-gray-900 ">
                            {item.name || "Unnamed"}
                          </span>

                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {item.userType || "user"} • {item.city || "—"}, {item.state || "—"}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 italic">
                        No matching farmers or firms found
                      </div>
                    )}
                  </div>
                )}
                {/* ────────────────────────────────────── */}
              </div>
            }
          </div>


          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login-page"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <span className="text-2xl">✕</span>
            ) : (
              <span className="text-2xl">☰</span>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-5 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive(link.path)
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Conditional mobile links */}
              {isLoggedIn && user?.userType === "firm" &&
                firmLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive(link.path)
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-700 hover:bg-gray-100"
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

              {isLoggedIn && user?.userType === "farmer" &&
                farmerLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive(link.path)
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-700 hover:bg-gray-100"
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 mt-2">
                {!isLoggedIn ? (
                  <>
                    <Link
                      to="/login-page"
                      className="flex-1 py-3 px-4 text-center border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="flex-1 py-3 px-4 text-center bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      handleLogout(e);
                      setIsOpen(false);
                    }}
                    className="flex-1 py-3 px-4 text-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
