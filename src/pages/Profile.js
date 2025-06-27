import React from "react";

function Profile() {
  const username = localStorage.getItem("username") || "User";
  const email = localStorage.getItem("email") || "your.email@example.com"; // Get email from localStorage

  return (
    <div className="form-container" style={{ maxWidth: 400 }}>
      <h2>Your Profile</h2>
      <div>
        <strong>Username: </strong> {username}
      </div>
      <div>
        <strong>Email: </strong> {email}
      </div>
      <div style={{ marginTop: 20, color: "#999" }}>
        (Profile editing coming soon)
      </div>
    </div>
  );
}

export default Profile;
