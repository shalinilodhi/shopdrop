import { useEffect, useState } from "react";
import { fetchVendorOrders, updateOrderStatus } from "../../api/api";
import StatusBadge from "../../components/StatusBadge";
import {
  formatDate,
  formatPrice,
  getError,
  shortId,
} from "../../utils/format";

const FILTERS = ["all", "pending", "accepted", "delivered", "rejected", "cancelled"];

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVendorOrders()
      .then(setOrders)
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (id, status) => {
    if (status === "rejected" && !window.confirm("Reject this order?")) return;
    setError("");
    try {
      const { order } = await updateOrderStatus(id, status);
      setOrders(orders.map((o) => (o._id === id ? order : o)));
    } catch (err) {
      setError(getError(err));
    }
  };

  if (loading) return <h2>Loading orders...</h2>;

  const shown =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <h1>Orders</h1>

      <div className="tabs">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f} ({f === "all"
              ? orders.length
              : orders.filter((o) => o.status === f).length})
          </button>
        ))}
      </div>

      {error && <div className="alert error">{error}</div>}

      {shown.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="table-wrap">
          <table className="vendor-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {shown.map((o) => (
                <tr key={o._id}>
                  <td>
                    <strong>{shortId(o._id)}</strong>
                    <div className="muted small">{formatDate(o.createdAt)}</div>
                  </td>
                  <td>
                    {o.customer?.name}
                    <div className="muted small">📞 {o.phone}</div>
                    <div className="muted small">📍 {o.shippingAddress}</div>
                  </td>
                  <td>
                    {o.items.map((item, i) => (
                      <div key={i}>
                        {item.name} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td>{formatPrice(o.totalAmount)}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td>
                    {o.status === "pending" && (
                      <>
                        <button
                          className="btn success"
                          onClick={() => changeStatus(o._id, "accepted")}
                        >
                          Accept
                        </button>
                        <button
                          className="btn danger"
                          onClick={() => changeStatus(o._id, "rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {o.status === "accepted" && (
                      <button
                        className="btn primary"
                        onClick={() => changeStatus(o._id, "delivered")}
                      >
                        Mark Delivered
                      </button>
                    )}
                    {!["pending", "accepted"].includes(o.status) && (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default VendorOrders;
