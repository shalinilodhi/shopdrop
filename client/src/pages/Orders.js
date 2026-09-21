import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchMyOrders, cancelOrder } from "../api/api";
import StatusBadge from "../components/StatusBadge";
import { formatDate, formatPrice, getError, shortId } from "../utils/format";
import "../styles/orders.css";

// Progress steps shown on each order card
const STEPS = ["pending", "accepted", "delivered"];
const STEP_LABELS = { pending: "Placed", accepted: "Accepted", delivered: "Delivered" };

const Orders = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setOrders(await fetchMyOrders());
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await cancelOrder(id);
      loadOrders();
    } catch (err) {
      setError(getError(err));
    }
  };

  if (loading) return <p className="page muted">Loading orders...</p>;

  return (
    <div className="page orders-page">
      <h2>My Orders</h2>

      {location.state?.placed && (
        <div className="alert success">
          🎉 Order placed successfully! The shop will accept it soon.
        </div>
      )}
      {error && <div className="alert error">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📦</div>
          <h3>No orders yet</h3>
          <p>When you place an order, you can track it here.</p>
          <Link to="/products" className="primary-link">Start shopping</Link>
        </div>
      ) : (
        orders.map((o) => (
          <div key={o._id} className="order-card">
            <div className="order-head">
              <div>
                <strong>{shortId(o._id)}</strong>
                <span className="muted"> · {formatDate(o.createdAt)}</span>
                <p className="muted">🏪 {o.vendor?.shopName || "Shop"}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>

            {STEPS.includes(o.status) && (
              <div className="tracker">
                {STEPS.map((s) => (
                  <div
                    key={s}
                    className={`tracker-step ${STEPS.indexOf(s) <= STEPS.indexOf(o.status) ? "done" : ""}`}
                  >
                    {STEP_LABELS[s]}
                  </div>
                ))}
              </div>
            )}

            <ul className="order-items">
              {o.items.map((item, i) => (
                <li key={i}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="order-foot">
              <span className="muted">📍 {o.shippingAddress}</span>
              <strong>{formatPrice(o.totalAmount)}</strong>
            </div>

            {o.status === "pending" && (
              <button
                className="btn danger"
                onClick={() => handleCancel(o._id)}
              >
                Cancel Order
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
