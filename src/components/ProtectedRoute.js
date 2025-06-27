import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  // Use sessionStorage instead of localStorage
  const isLoggedIn = !!sessionStorage.getItem("token");
  return isLoggedIn ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
