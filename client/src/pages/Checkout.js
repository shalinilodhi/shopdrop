import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { checkout } from "../api/api";
import { formatPrice, getError } from "../utils/format";
import "../styles/checkout.css";

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { items, total, resetCart, refreshCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const shopCount = new Set(items.map((i) => i.product.vendor?._id)).size;

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const data = await checkout({ shippingAddress, phone });
      resetCart();
      navigate("/orders", { state: { placed: data.orders.length } });
    } catch (err) {
      setError(getError(err));
      refreshCart(); // stock may have changed
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout">
        <h2>Checkout</h2>
        <p>Your cart is empty.</p>
        <Link to="/products" className="primary-link">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="checkout">
      <h2>Checkout</h2>

      <div className="checkout-items">
        {items.map(({ product, quantity }) => (
          <div key={product._id} className="checkout-item">
            <span>
              {product.name} <small className="muted">× {quantity}</small>
            </span>
            <span>{formatPrice(product.price * quantity)}</span>
          </div>
        ))}
        <div className="checkout-item checkout-total">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {shopCount > 1 && (
        <p className="hint">
          Your items come from {shopCount} shops, so this will create{" "}
          {shopCount} separate orders.
        </p>
      )}

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={placeOrder} className="form">
        <label>Delivery Address</label>
        <textarea
          rows={3}
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder="House no, street, area, city"
          required
        />

        <label>Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Mobile number"
          required
        />

        <div className="pay-note">💵 Cash on delivery <span className="muted">· pay when your order arrives</span></div>

        <button className="checkout-btn" disabled={placing}>
          {placing ? "Placing order..." : `Place Order · ${formatPrice(total)}`}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
