import React from "react";

function CartItem({ item, onUpdateQty, onRemove }) {
  return (
    <div className="cart-item">
      <img className="cart-item-image" src={item.image} alt={item.title} />
      <div className="cart-item-info">
        <div className="cart-item-title">{item.title}</div>
        <div className="cart-item-price">₹ {item.price} × {item.quantity}</div>
      </div>
      <div className="cart-item-actions">
        <button onClick={() => onUpdateQty(item, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
        <span>{item.quantity}</span>
        <button onClick={() => onUpdateQty(item, item.quantity + 1)}>+</button>
        <button onClick={() => onRemove(item)} style={{ marginTop: 6, color: "#d32f2f", border: "none", background: "none", cursor: "pointer" }}>Remove</button>
      </div>
    </div>
  );
}

export default CartItem;
