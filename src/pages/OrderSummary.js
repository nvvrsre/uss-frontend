import React from "react";
import { Link } from "react-router-dom";

function OrderSummary() {
  const lastOrder = JSON.parse(localStorage.getItem("lastOrder") || "{}");

  if (!lastOrder || (!lastOrder.order_id && !lastOrder.id)) {
    return (
      <div className="form-container">
        No recent order found or order failed. <Link to="/">Shop now</Link>
      </div>
    );
  }

  const orderId = lastOrder.order_id || lastOrder.id;
  const items = lastOrder.items || [];
  let appliedPromos = [];
  try {
    appliedPromos = typeof lastOrder.applied_promos === "string"
      ? JSON.parse(lastOrder.applied_promos)
      : lastOrder.applied_promos || [];
  } catch {
    appliedPromos = [];
  }

  return (
    <div className="form-container" style={{ maxWidth: 480 }}>
      <h2>Thank You for Your Order!</h2>
      <div style={{ color: "green", fontWeight: 600, margin: "12px 0" }}>
        ✅ Your order has been placed successfully.
      </div>
      <div><strong>Order ID:</strong> {orderId}</div>
      <div>
        <strong>Order Total:</strong> ₹{lastOrder.total || lastOrder.amount || "N/A"}
      </div>
      <div>
        <strong>Discount:</strong> <span style={{ color: "green" }}>
          ₹{lastOrder.discount != null ? lastOrder.discount : 0}
        </span>
      </div>
      <div>
        <strong>Final Amount Paid:</strong>{" "}
        <span style={{ color: "#1976d2" }}>
          ₹{lastOrder.final_amount || lastOrder.amount || "N/A"}
        </span>
      </div>
      <div><strong>Address:</strong> {lastOrder.address}</div>
      {appliedPromos.length > 0 && (
        <div style={{ margin: "14px 0" }}>
          <b>Promotions Applied:</b>
          <ul>
            {appliedPromos.map((promo, i) => (
              <li key={i}>
                {promo.description}
                {promo.code && <> (<b>{promo.code}</b>)</>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <strong>Items:</strong>
        <ul>
          {items.map((item, i) => (
            <li key={i}>
              {item.title || item.product_id} × {item.quantity}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: 20 }}>
        <Link to="/">Go to Home</Link> | <Link to="/orders">View My Orders</Link>
      </div>
    </div>
  );
}

export default OrderSummary;
