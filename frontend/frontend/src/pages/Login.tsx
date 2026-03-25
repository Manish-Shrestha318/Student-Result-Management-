import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import illustration from "../assets/education_vector.svg";

import '../App.css';

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      switch (res.data.user.role) {
        case "admin": return navigate("/dashboard/admin");
        case "teacher": return navigate("/dashboard/teacher");
        case "student": return navigate("/dashboard/student");
        case "parent": return navigate("/dashboard/parent");
        default: return navigate("/");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="page">
      <img src={illustration} alt="education illustration" className="illustration" />
      
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>

          <button className="primary-btn" type="submit">Login</button>
        </form>

        <p className="sign-links">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;