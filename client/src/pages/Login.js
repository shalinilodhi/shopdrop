import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getError } from "../utils/format";
import Logo from "../components/Logo";
import "../styles/login.css";

const HOME_BY_ROLE = { admin: "/admin", vendor: "/vendor" };

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(
        HOME_BY_ROLE[user.role] || location.state?.from || "/products",
        { replace: true }
      );
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="auth-logo"><Logo size={56} stacked /></Link>
        <p className="subtitle">Welcome back! Log in to continue.</p>

        {location.state?.registered && (
          <div className="alert success">{location.state.registered}</div>
        )}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="switch-auth">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
