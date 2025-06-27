import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const cartIcon = (
  <span role="img" aria-label="cart" style={{ fontSize: 22, verticalAlign: "middle" }}>🛒</span>
);

function Header() {
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem("token");
  const username = sessionStorage.getItem("username") || "User";
  const user_id = sessionStorage.getItem("user_id");
  const [cartCount, setCartCount] = useState(0);

  // Calculate cart count on mount & when cart changes
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      // Sum all quantities for Amazon-like behavior
      const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    };
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart-updated", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    // Remove session data
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("expiresAt");

    // Remove all per-user addresses for this user!
    if (user_id) {
      localStorage.removeItem(`addresses_${user_id}`);
    }
    // Also remove checkout states (good practice)
    localStorage.removeItem("selectedCheckoutAddress");
    localStorage.removeItem("selectedCheckoutCoupon");
    localStorage.removeItem("checkoutCart");
    // Optional: clear cart for fresh start
    localStorage.removeItem("cart");
    // Reload to ensure all React state is cleared (avoids stale data)
    window.location.href = "/login";
  };

  return (
    <header className="header">
      <div className="logo" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img
          src="/favicon.png"
          alt="UshaSree Logo"
          style={{ width: 28, height: 28, borderRadius: "6px", marginRight: 5 }}
        />
        <Link to="/" style={{ color: "#fff", textDecoration: "none", fontSize: 22, fontWeight: 600 }}>
          UshaSree Stores
        </Link>
      </div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/cart" style={{ position: "relative", marginLeft: 10 }}>
          {cartIcon}
          {cartCount > 0 && (
            <span style={{
              position: "absolute",
              top: -6,
              right: -10,
              background: "#4b5d7b",
              color: "#fff",
              borderRadius: "50%",
              fontSize: 12,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              border: "2px solid #fff"
            }}>
              {cartCount}
            </span>
          )}
        </Link>
        {isLoggedIn ? (
          <>
            <Link to="/orders">Orders</Link>
            <Link to="/profile">{username}</Link>
            <button onClick={handleLogout} style={{
              marginLeft: 16,
              background: "#fff",
              color: "#2874f0",
              border: "none",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 500
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
