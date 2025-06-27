import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await axios.post(`${API_BASE}/auth/signup`, { name, email, password });

      // Auto-login after signup:
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("username", res.data.username);
      sessionStorage.setItem("user_id", res.data.user_id);
      sessionStorage.setItem("user_email", res.data.email); // ⭐️ Store email!
      const expiresAt = Date.now() + 5 * 60 * 1000;
      sessionStorage.setItem("expiresAt", expiresAt);

      // Clear addresses after signup if desired
      localStorage.removeItem("addresses");

      setMsg("Signup successful! Logging you in...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Signup failed. Try again.");
    }
  };

  return (
    <form className="form-container" onSubmit={handleSignup}>
      <h2>Signup</h2>
      <input
        type="text"
        value={name}
        placeholder="Name"
        required
        onChange={e => setName(e.target.value)}
      />
      <input
        type="email"
        value={email}
        placeholder="Email"
        required
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        placeholder="Password"
        required
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit">Signup</button>
      {msg && (
        <div style={{ color: msg.startsWith("Signup successful") ? "green" : "red", marginTop: 10 }}>
          {msg}
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </form>
  );
}

export default Signup;
