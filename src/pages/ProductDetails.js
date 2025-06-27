import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// Update this to your API Gateway URL
const API_BASE = process.env.REACT_APP_API_BASE_URL;

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => setProduct(null));
  }, [id]);

  const handleAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex(item => item.id === product.id);
    if (idx >= 0) {
      cart[idx].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (!product) return <div>Product not found.</div>;

  return (
    <div className="form-container" style={{ maxWidth: 500 }}>
      <img src={product.image} alt={product.title} style={{ width: 200, margin: "0 auto", display: "block" }} />
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <div style={{ fontWeight: "bold", color: "#2874f0", fontSize: 22 }}>₹ {product.price}</div>
      <button className="add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
      {added && <div style={{ color: "green", marginTop: 10 }}>Added to cart!</div>}
    </div>
  );
}

export default ProductDetails;
