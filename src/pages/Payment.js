import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function Payment() {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState(null);
  const [card, setCard] = useState({ number: "", cvv: "", month: "", year: "" });
  const [msg, setMsg] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [offers, setOffers] = useState([]);

  const navigate = useNavigate();

  // Always use sessionStorage for token, user_id
  const getUserId = () => sessionStorage.getItem("user_id");
  const getToken = () => sessionStorage.getItem("token");

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("checkoutCart") || "[]"));
    setAddress(JSON.parse(localStorage.getItem("selectedCheckoutAddress") || "null"));
  }, []);

  useEffect(() => {
    const user_id = getUserId();
    const cart_total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const product_count = cart.length;
    if (user_id && cart_total > 0) {
      axios.get(`${API_BASE}/promotions/available`, {
        params: { user_id, cart_total, product_count }
      }).then(res => setOffers(res.data)).catch(() => setOffers([]));
    }
  }, [cart]);

  useEffect(() => {
    async function calculatePromo() {
      const user_id = getUserId();
      if (!user_id || cart.length === 0) {
        setDiscount(0);
        setFinalAmount(0);
        setAppliedCoupon(null);
        return;
      }
      const cart_total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const product_count = cart.length;
      try {
        const resp = await axios.post(`${API_BASE}/promotions/apply`, {
          user_id: parseInt(user_id, 10),
          cart_total,
          product_count,
          code: coupon || null
        });
        setDiscount(resp.data.total_discount || 0);
        setFinalAmount(resp.data.final_amount || cart_total);
        setAppliedCoupon(
          resp.data.applied_promos &&
          resp.data.applied_promos.find(p => p.code && p.code === coupon)
        );
        setMsg("");
      } catch (err) {
        setDiscount(0);
        setFinalAmount(cart_total);
        setAppliedCoupon(null);
        if (coupon) setMsg("❌ Invalid or ineligible coupon.");
      }
    }
    calculatePromo();
    // eslint-disable-next-line
  }, [cart, coupon]);

  // Card validation
  const validateCard = () =>
    card.number.length === 16 &&
    card.cvv.length === 3 &&
    card.month.length === 2 &&
    card.year.length === 2;

  const handleCardChange = e => {
    const { name, value } = e.target;
    setCard({ ...card, [name]: value.replace(/\D/g, "") });
  };

  const handleCouponChange = (e) => {
    setCoupon(e.target.value.trim().toUpperCase());
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setMsg("");
    if (placingOrder) return;
    setPlacingOrder(true);

    if (!address) {
      setMsg("No address selected. Please go back and select address.");
      setPlacingOrder(false);
      return;
    }
    if (!validateCard()) {
      setMsg("Please enter valid card details.");
      setPlacingOrder(false);
      return;
    }

    try {
      const token = getToken();
      const user_id = parseInt(getUserId() || "0", 10);

      // Always use address.email for order notification!
      const user_email = address.email || "";

      // 1. Call payment service
      const paymentPayload = {
        user_id,
        order_id: 0,
        amount: finalAmount || cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        method: "Card",
        address: address.address || "", // address field is textarea in checkout
        card
      };
      const paymentRes = await axios.post(`${API_BASE}/payment`, paymentPayload);

      if (!paymentRes.data || paymentRes.data.status !== "success") {
        setMsg(paymentRes.data?.message || "Payment failed. Please check card details.");
        setPlacingOrder(false);
        return;
      }

      // 2. Place order in order service (send coupon_code and email)
      const orderItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const orderPayload = {
        user_id,
        items: orderItems,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        address: address.address || "",
        name: address.name,
        phone: address.phone,
        email: user_email, // <-- Uses address.email from checkout
        paymentMethod: "Card",
        coupon_code: coupon // Pass the code, can be empty/null
      };

      const orderRes = await axios.post(
        `${API_BASE}/orders`,
        orderPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.removeItem("cart");
      localStorage.removeItem("checkoutCart");
      localStorage.removeItem("selectedCheckoutAddress");
      window.dispatchEvent(new Event("cart-updated"));

      if (orderRes.data && typeof orderRes.data === "object") {
        localStorage.setItem("lastOrder", JSON.stringify({
          ...orderRes.data,
          items: cart,
          address: address.address || ""
        }));
      } else {
        localStorage.setItem("lastOrder", JSON.stringify({ order_id: orderRes.data.order_id || "N/A" }));
      }

      setMsg("Payment & Order placed successfully!");
      setTimeout(() => navigate("/order-summary"), 1200);
    } catch (err) {
      let errMsg = "❌ Payment server error. Please try again.";
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = "❌ " + err.response.data.message;
      }
      setMsg(errMsg);
      setPlacingOrder(false);
      console.error("Payment/order error:", err);
      return;
    }
    setPlacingOrder(false);
  };

  if (!cart.length || !address)
    return <div className="form-container">No order data. Please return to cart.</div>;

  const cart_total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="form-container" style={{ maxWidth: 420 }}>
      <h2>Payment</h2>
      <b>Order Summary:</b>
      <ul style={{ paddingLeft: 18 }}>
        {cart.map(item => (
          <li key={item.id}>
            {item.title} x {item.quantity} - ₹{item.price * item.quantity}
          </li>
        ))}
      </ul>
      <div style={{ textAlign: "right" }}>Total: <b>₹ {cart_total}</b></div>

      {/* --- Offers --- */}
      {offers.length > 0 && (
        <div style={{ margin: "20px 0", padding: 10, border: "1px solid #eee", borderRadius: 8 }}>
          <b>Available Offers:</b>
          <ul style={{ marginBottom: 0 }}>
            {offers.map((offer) =>
              <li key={offer.id}>{offer.description} {offer.code && <b>Code: {offer.code}</b>}</li>
            )}
          </ul>
        </div>
      )}

      {/* --- Coupon code entry and result --- */}
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          value={coupon}
          onChange={handleCouponChange}
          placeholder="Enter coupon code (if any)"
          style={{ marginRight: 10, width: 180 }}
          maxLength={24}
        />
        {appliedCoupon && <span style={{ color: "green" }}>✔ Applied: {appliedCoupon.description}</span>}
      </div>
      <div>
        Discount: <b style={{ color: "green" }}>₹ {discount}</b>
      </div>
      <div>
        Final Amount: <b style={{ color: "#1976d2" }}>₹ {finalAmount || cart_total}</b>
      </div>

      <h3>Deliver To:</h3>
      <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <b>{address.name}</b>, {address.phone}, {address.email}<br />
        {address.address}
      </div>

      <form onSubmit={handlePayment}>
        <h3>Enter Card Details</h3>
        <input
          type="text"
          name="number"
          maxLength={16}
          value={card.number}
          onChange={handleCardChange}
          placeholder="Card Number (16 digits)"
          required
          style={{ marginBottom: 5, width: "100%" }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            name="cvv"
            maxLength={3}
            value={card.cvv}
            onChange={handleCardChange}
            placeholder="CVV (3 digits)"
            required
            style={{ width: 80 }}
          />
          <input
            type="text"
            name="month"
            maxLength={2}
            value={card.month}
            onChange={handleCardChange}
            placeholder="MM"
            required
            style={{ width: 60 }}
          />
          <input
            type="text"
            name="year"
            maxLength={2}
            value={card.year}
            onChange={handleCardChange}
            placeholder="YY"
            required
            style={{ width: 60 }}
          />
        </div>
        <button type="submit" style={{ marginTop: 16 }} disabled={placingOrder}>
          {placingOrder ? "Processing..." : "Pay & Place Order"}
        </button>
        {msg && <div style={{ color: msg.startsWith("❌") ? "red" : "green", marginTop: 10 }}>{msg}</div>}
      </form>
    </div>
  );
}

export default Payment;
