import { useEffect, useState } from "react";
import { fetchAllOrders } from "../../api/api";
import StatusBadge from "../../components/StatusBadge";
import {
  formatDate,
  formatPrice,
  getError,
  shortId,
} from "../../utils/format";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllOrders()
      .then(setOrders)
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <h2>Loading orders...</h2>;

  return (
    <>
      <h1>All Orders</h1>
      {error && <div className="alert error">{error}</div>}

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Shop</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>{shortId(o._id)}</td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>
                    {o.customer?.name}
                    <div className="muted small">{o.customer?.email}</div>
                  </td>
                  <td>{o.vendor?.shopName}</td>
                  <td>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td>{formatPrice(o.totalAmount)}</td>
                  <td>
                    <StatusBadge status={o.status} />
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

export default AdminOrders;
