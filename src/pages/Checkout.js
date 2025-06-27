import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function Checkout() {
  const user_id = sessionStorage.getItem("user_id");
  const addressKey = user_id ? `addresses_${user_id}` : "addresses";

  const [cart, setCart] = useState([]);
  const [offers, setOffers] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [couponStatus, setCouponStatus] = useState("");
  const [addresses, setAddresses] = useState(() =>
    JSON.parse(localStorage.getItem(addressKey) || "[]")
  );
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("checkoutCart") || "[]"));
  }, []);

  // When user changes, reset addresses to correct user
  useEffect(() => {
    setAddresses(JSON.parse(localStorage.getItem(addressKey) || "[]"));
    setSelectedAddress(0);
    setShowNewAddress(false);
  }, [user_id]);

  // Fetch promotions
  useEffect(() => {
    if (cart.length && user_id) {
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      axios
        .get(`${API_BASE}/promotions/available`, {
          params: {
            user_id,
            cart_total: total,
            product_count: cart.length
          }
        })
        .then(res => setOffers(res.data))
        .catch(() => setOffers([]));
    } else {
      setOffers([]);
    }
  }, [cart, user_id]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // --- Validation helpers ---
  const validateEmail = email => /^\S+@\S+\.\S+$/.test(email);
  const validatePhone = phone => /^\+91[0-9]{10}$/.test(phone);
  const validateAddressForm = () =>
    form.name.trim() && form.phone.trim() && form.email.trim() && form.address.trim();

  // Coupon validation
  const handleValidateCoupon = () => {
    setCouponStatus("Validating...");
    axios
      .post(`${API_BASE}/promotions/validate`, {
        user_id,
        code: coupon,
        cart_total: total,
        product_count: cart.length
      })
      .then(res => {
        setCouponStatus("✅ Coupon valid: " + res.data.promotion.description);
        localStorage.setItem("checkoutCoupon", coupon);
      })
      .catch(() => {
        setCouponStatus("❌ Invalid coupon or not eligible");
        localStorage.removeItem("checkoutCoupon");
      });
  };

  // --- Address Management ---
  const handleSaveAddress = () => {
    if (!validateAddressForm())
      return setMsg("Please fill all fields.");
    if (!validatePhone(form.phone))
      return setMsg("Phone must start with +91 and be 10 digits.");
    if (!validateEmail(form.email))
      return setMsg("Please enter a valid email address.");
    const newAddresses = [...addresses, { ...form }];
    setAddresses(newAddresses);
    localStorage.setItem(addressKey, JSON.stringify(newAddresses));
    setSelectedAddress(newAddresses.length - 1);
    setShowNewAddress(false);
    setForm({ name: "", phone: "", email: "", address: "" });
    setMsg("");
  };

  const handlePayNow = () => {
    if (addresses.length === 0) {
      setMsg("Please add an address.");
      return;
    }
    const addr = addresses[selectedAddress];
    if (!addr) {
      setMsg("Please select a delivery address.");
      return;
    }
    if (!validatePhone(addr.phone)) {
      setMsg("Phone must start with +91 and be 10 digits.");
      return;
    }
    if (!validateEmail(addr.email)) {
      setMsg("Please enter a valid email address.");
      return;
    }
    localStorage.setItem("selectedCheckoutAddress", JSON.stringify(addr));
    localStorage.setItem("selectedCheckoutCoupon", coupon || "");
    navigate("/payment");
  };

  if (cart.length === 0)
    return <div className="form-container">No items in cart.</div>;

  return (
    <div className="form-container" style={{ maxWidth: 450 }}>
      <h2>Checkout</h2>
      <b>Order Summary:</b>
      <ul style={{ paddingLeft: 18 }}>
        {cart.map(item => (
          <li key={item.id}>
            {item.title} x {item.quantity} - ₹{item.price * item.quantity}
          </li>
        ))}
      </ul>
      <div style={{ textAlign: "right" }}>Total: <b>₹ {total}</b></div>

      {offers.length > 0 && (
        <div style={{ background: "#e6f4ff", border: "1px solid #90caf9", borderRadius: 8, padding: 12, margin: "14px 0" }}>
          <b>Available Offers:</b>
          <ul>
            {offers.map((offer, idx) => (
              <li key={idx}>{offer.description}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Coupon field */}
      <div style={{ margin: "18px 0" }}>
        <input
          type="text"
          placeholder="Enter coupon code"
          value={coupon}
          onChange={e => setCoupon(e.target.value)}
        />
        <button type="button" style={{ marginLeft: 8 }} onClick={handleValidateCoupon}>
          Apply Coupon
        </button>
        {couponStatus && <div style={{ marginTop: 6 }}>{couponStatus}</div>}
      </div>

      <h3>Delivery Address</h3>
      {addresses.length > 0 && !showNewAddress && (
        <div style={{ marginBottom: 16 }}>
          {addresses.map((addr, idx) => (
            <div
              key={idx}
              style={{
                border: selectedAddress === idx ? "2px solid #42a5f5" : "1px solid #ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
                cursor: "pointer"
              }}
              onClick={() => setSelectedAddress(idx)}
            >
              <input
                type="radio"
                checked={selectedAddress === idx}
                onChange={() => setSelectedAddress(idx)}
                style={{ marginRight: 8 }}
              />
              <b>{addr.name}</b>, {addr.phone}, {addr.email}<br />
              {addr.address}
            </div>
          ))}
          <button type="button" onClick={() => setShowNewAddress(true)}>
            + Add New Address
          </button>
        </div>
      )}

      {(showNewAddress || addresses.length === 0) && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            required
          />
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone (+911234567890)"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="Email (for order notification)"
            required
          />
          <textarea
            name="address"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Full Address"
            rows={3}
            required
            style={{ resize: "vertical", minHeight: 60, marginBottom: 8 }}
          />
          <button type="button" style={{ marginTop: 8 }} onClick={handleSaveAddress}>
            Save Address
          </button>
          {addresses.length > 0 && (
            <button type="button" style={{ marginLeft: 8 }} onClick={() => { setShowNewAddress(false); setMsg(""); }}>
              Cancel
            </button>
          )}
        </div>
      )}

      {addresses.length > 0 && !showNewAddress && (
        <button
          style={{ marginTop: 24, padding: "10px 30px", fontSize: 18 }}
          type="button"
          onClick={handlePayNow}
        >
          Pay Now
        </button>
      )}

      {msg && <div style={{ color: msg.startsWith("❌") ? "red" : "green", marginTop: 10 }}>{msg}</div>}
    </div>
  );
}

export default Checkout;
