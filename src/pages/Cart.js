import React, { useState, useEffect } from "react";
import CartItem from "../components/CartItem";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function Cart() {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart") || "[]"));
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();

  // Load eligible promotions for the logged-in user
  useEffect(() => {
    const user_id = sessionStorage.getItem("user_id");
    if (cart.length && user_id) {
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      axios
        .get(`${API_BASE}/promotions/available`, {
          params: { user_id, cart_total: total, product_count: cart.length }
        })
        .then(res => setOffers(res.data))
        .catch(() => setOffers([]));
    } else {
      setOffers([]);
    }
  }, [cart]);

  const handleUpdateQty = (item, qty) => {
    if (qty < 1) return;
    const updatedCart = cart.map((c) => (c.id === item.id ? { ...c, quantity: qty } : c));
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleRemove = (item) => {
    const updatedCart = cart.filter((c) => c.id !== item.id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) return <div className="form-container">Cart is empty.</div>;

  return (
    <div>
      <div className="cart-list">
        {cart.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
          />
        ))}
        <div style={{ fontWeight: 500, textAlign: "right", marginTop: 18 }}>
          Total: ₹ {total}
        </div>
        {offers.length > 0 && (
          <div
            style={{
              background: "#e6f4ff",
              border: "1px solid #90caf9",
              borderRadius: 8,
              padding: 12,
              margin: "16px 0",
            }}
          >
            <b>Available Offers:</b>
            <ul>
              {offers.map((offer, idx) => (
                <li key={idx}>{offer.description}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <button
          style={{ padding: "10px 30px", fontSize: 18 }}
          onClick={() => {
            localStorage.setItem("checkoutCart", JSON.stringify(cart));
            navigate("/checkout");
          }}
        >
          Proceed to Buy
        </button>
      </div>
    </div>
  );
}

export default Cart;
