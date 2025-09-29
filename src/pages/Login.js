import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("username", res.data.username);
      sessionStorage.setItem("user_id", res.data.user_id);
      sessionStorage.setItem("user_email", res.data.email); // ⭐️ Store email!
      const expiresAt = Date.now() + 5 * 60 * 1000;
      sessionStorage.setItem("expiresAt", expiresAt);

      // Clear addresses after login if desired
      localStorage.removeItem("addresses");

      setMsg("Login successful!");
      setTimeout(() => navigate("/"), 800);
    } catch {
      setMsg("Invalid email or password.");
    }
  };

  return (
    <form className="form-container" onSubmit={handleLogin}>
      <h2>Login</h2>
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
      <button type="submit">Login</button>
      {msg && <div style={{ color: msg === "Login successful!" ? "green" : "red", marginTop: 10 }}>{msg}</div>}
      <div style={{ marginTop: 16 }}>
        New to UshaSree Stores ? <Link to="/signup">Signup</Link>
      </div>
    </form>
  );
}

export default Login;
