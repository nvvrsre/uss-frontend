import React, { useState } from "react";
import { Link } from "react-router-dom";

function ProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <img className="product-image" src={product.image} alt={product.title} />
        <div className="product-title">{product.title}</div>
        <div className="product-price">₹ {product.price}</div>
      </Link>
      <button className="add-to-cart-btn" onClick={handleAdd}>
        Add to Cart
      </button>
      {added && (
        <div style={{ color: "green", marginTop: 8, fontWeight: 500, fontSize: 14 }}>
          Added to cart!
        </div>
      )}
    </div>
  );
}

export default ProductCard;
