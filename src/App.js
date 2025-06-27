import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderSummary from "./pages/OrderSummary";
import ProtectedRoute from "./components/ProtectedRoute";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";

// Custom component to check expiry on every route change
function ExpiryGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const expiresAt = sessionStorage.getItem("expiresAt");
    if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
      // Remove all login info from sessionStorage
      ["token", "user_id", "username", "expiresAt"].forEach(k => sessionStorage.removeItem(k));
      alert("Session expired. Please log in again.");
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  return children;
}

function App() {
  const [search, setSearch] = useState("");

  return (
    <Router>
      <ExpiryGuard>
        <Header setSearch={setSearch} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home search={search} setSearch={setSearch} />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/order-summary" element={<ProtectedRoute><OrderSummary /></ProtectedRoute>} />
          </Routes>
        </div>
      </ExpiryGuard>
    </Router>
  );
}

export default App;
