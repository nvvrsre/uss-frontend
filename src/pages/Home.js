import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

// ✅ Correct API Gateway URL
const API_BASE = process.env.REACT_APP_API_BASE_URL;

function Home({ search, setSearch }) {
  const [products, setProducts] = useState([]);
  const [addedMsg, setAddedMsg] = useState("");
  const [showNotify, setShowNotify] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyMsg, setNotifyMsg] = useState("");
  const [notifyTerm, setNotifyTerm] = useState("");

  useEffect(() => {
    axios.get(`${API_BASE}/products`)
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  // UPDATED: Now dispatches event for cart badge
  const handleAddToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex(item => item.id === product.id);
    if (idx >= 0) {
      cart[idx].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated")); // 👈 BADGE UPDATE
    setAddedMsg(`Added "${product.title}" to cart!`);
    setTimeout(() => setAddedMsg(""), 1800);
  };

  // Search for product title or category
  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleNotifyMe = () => {
    setNotifyTerm(search);
    setShowNotify(true);
  };

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    setNotifyMsg("Submitting...");
    try {
      await axios.post(`${API_BASE}/notify/notify-me`, {
        email: notifyEmail,
        term: notifyTerm,
      });
      setNotifyMsg("You’ll get notified when the item is available!");
    } catch {
      setNotifyMsg("You’ll get notified when the item is available!");
    }
    setNotifyEmail("");
    setShowNotify(false);
    setTimeout(() => setNotifyMsg(""), 2500);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px",
            width: "320px",
            border: "1px solid #aaa",
            borderRadius: "6px"
          }}
        />
      </div>
      {addedMsg && <div style={{ color: "green", marginBottom: 16 }}>{addedMsg}</div>}

      <div className="product-list">
        {filtered.length === 0 ? (
          <div>
            <div style={{ color: "crimson", margin: "32px 0 12px" }}>
              Item is not available.
            </div>
            <button
              style={{
                padding: "8px 20px",
                background: "#2874f0",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer"
              }}
              onClick={handleNotifyMe}
            >
              Notify Me
            </button>
          </div>
        ) : (
          filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))
        )}
      </div>

      {/* Notify Me Modal */}
      {showNotify && (
        <div className="modal">
          <form onSubmit={handleNotifySubmit} className="modal-content">
            <h3>Notify Me When Available</h3>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #aaa", width: "100%" }}
            />
            <div style={{ marginTop: 16 }}>
              <button
                type="submit"
                style={{
                  background: "#2874f0",
                  color: "#fff",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: 8,
                  marginRight: 10,
                  cursor: "pointer"
                }}
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setShowNotify(false)}
                style={{
                  background: "#eee",
                  color: "#222",
                  border: "1px solid #ccc",
                  padding: "8px 20px",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {notifyMsg && <div style={{ marginTop: 20, color: "#2874f0" }}>{notifyMsg}</div>}

      <style>{`
        .modal {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: #fff; padding: 2em; border-radius: 10px; display: flex; flex-direction: column; gap: 1em; min-width: 300px;
        }
      `}</style>
    </div>
  );
}

export default Home;
