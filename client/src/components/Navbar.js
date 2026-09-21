import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import Logo from "./Logo";
import "../styles/navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { count } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef(null);

  // Close menus when the page changes
  useEffect(() => {
    setShowProfile(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Close the profile dropdown when clicking outside it
  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = (user?.name || "?").charAt(0).toUpperCase();

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-logo" aria-label="ShopNDrop home">
          <Logo size={38} />
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/products">Shop</NavLink>

          {user?.role === "customer" && <NavLink to="/orders">My Orders</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin">Admin Panel</NavLink>}
          {user?.role === "vendor" && <NavLink to="/vendor">Vendor Panel</NavLink>}

          <div className="nav-actions">
            {user?.role === "customer" && (
              <NavLink to="/cart" className="cart-btn" aria-label="Cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 7h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7zM9 7V5a3 3 0 0 1 6 0v2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="cart-label">Cart</span>
                {count > 0 && <span className="cart-count">{count}</span>}
              </NavLink>
            )}

            {!user ? (
              <>
                <Link to="/login" className="nav-login">Log in</Link>
                <Link to="/register" className="nav-signup">Sign up</Link>
              </>
            ) : (
              <div className="profile-wrapper" ref={profileRef}>
                <button
                  className="profile-btn"
                  onClick={() => setShowProfile(!showProfile)}
                >
                  <span className="avatar">{initial}</span>
                  <span className="profile-name">{user.name?.split(" ")[0]}</span>
                  <span className="caret">▾</span>
                </button>

                {showProfile && (
                  <div className="profile-dropdown">
                    <div className="dropdown-head">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <span className="role-chip">{user.role}</span>
                    </div>
                    <button onClick={() => navigate("/profile")}>👤 My Profile</button>
                    {user.role === "customer" && (
                      <button onClick={() => navigate("/orders")}>📦 My Orders</button>
                    )}
                    <button onClick={handleLogout} className="dropdown-logout">
                      ↩ Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
