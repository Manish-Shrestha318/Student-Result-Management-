import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to School Platform</h1>
      <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
    </div>
  );
};

export default Home;