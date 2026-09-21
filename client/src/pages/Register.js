import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/api";
import { getError } from "../utils/format";
import Logo from "../components/Logo";
import "../styles/login.css"; // reuse same style

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    shopName: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isVendor = form.role === "vendor";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerUser(form);
      navigate("/login", { state: { registered: data.message } });
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
        <p className="subtitle">Create your free account</p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>I want to</label>
          <div className="role-toggle">
            <button
              type="button"
              className={!isVendor ? "active" : ""}
              onClick={() => setForm({ ...form, role: "customer" })}
            >
              🛒 Shop
            </button>
            <button
              type="button"
              className={isVendor ? "active" : ""}
              onClick={() => setForm({ ...form, role: "vendor" })}
            >
              🏪 Sell
            </button>
          </div>

          <label>Full Name</label>
          <input
            name="name"
            placeholder="Enter full name"
            value={form.name}
            onChange={handleChange}
            required
          />

          {isVendor && (
            <>
              <label>Shop Name</label>
              <input
                name="shopName"
                placeholder="e.g. Sharma General Store"
                value={form.shopName}
                onChange={handleChange}
                required
              />
            </>
          )}

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
            placeholder="At least 6 characters"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />

          <label>Phone</label>
          <input
            name="phone"
            placeholder="Mobile number"
            value={form.phone}
            onChange={handleChange}
            required={isVendor}
          />

          <label>{isVendor ? "Shop Address" : "Address"}</label>
          <input
            name="address"
            placeholder={isVendor ? "Where is your shop?" : "Delivery address"}
            value={form.address}
            onChange={handleChange}
            required={isVendor}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {isVendor && (
          <p className="hint">
            Vendor accounts need admin approval before products go live.
          </p>
        )}
        <p className="switch-auth">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
