import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Gateway URL
const API_BASE = process.env.REACT_APP_API_BASE_URL;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Use sessionStorage for user info (always!)
    const token = sessionStorage.getItem("token");
    const user_id = sessionStorage.getItem("user_id");

    if (!token || !user_id) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_BASE}/orders?user_id=${user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        // Defensive handling of possible data shapes
        let data = res.data;
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="form-container">Loading orders...</div>;
  if (!orders.length) return <div className="form-container">No orders found.</div>;

  return (
    <div className="orders-list">
      <h2>Your Orders</h2>
      {orders.map((order, idx) => (
        <div className="order-item" key={order.id || idx} style={{ border: "1px solid #eee", borderRadius: 8, margin: "20px 0", padding: 14 }}>
          <div>
            <div><strong>Order ID:</strong> {order.id}</div>
            <div><strong>Date:</strong> {order.created_at?.substring(0, 10) || "N/A"}</div>
            <div>
              <strong>Items:</strong>
              <ul>
                {(order.items || []).map((item, i) => (
                  <li key={i}>
                    {/* Show title if available (enrichment) else fallback to product_id */}
                    {item.title ? item.title : `Product #${item.product_id}`} × {item.quantity} - ₹{item.price * item.quantity}
                  </li>
                ))}
              </ul>
            </div>
            <div><strong>Total:</strong> ₹{order.total ? Number(order.total).toFixed(2) : "0.00"}</div>
            <div><strong>Address:</strong> {order.address}</div>
            <div><strong>Status:</strong> {order.status}</div>
            {order.discount ? <div><strong>Discount:</strong> ₹{order.discount}</div> : null}
            {order.final_amount ? <div><strong>Paid:</strong> ₹{order.final_amount}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Orders;
