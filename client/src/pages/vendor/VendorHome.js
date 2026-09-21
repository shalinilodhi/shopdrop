import { useEffect, useState } from "react";
import { fetchVendorStats } from "../../api/api";
import { formatPrice } from "../../utils/format";

const VendorHome = ({ goTo }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchVendorStats()
      .then(setStats)
      .catch((err) => console.error("Failed to load vendor stats", err));
  }, []);

  if (!stats) return <h2>Loading dashboard...</h2>;

  return (
    <>
      <h1>Vendor Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => goTo("products")}>
          <span className="stat-icon">📦</span>
          <h3>Total Products</h3>
          <p>{stats.totalProducts}</p>
        </div>

        <div className="stat-card clickable" onClick={() => goTo("orders")}>
          <span className="stat-icon">🧾</span>
          <h3>Total Orders</h3>
          <p>{stats.totalOrders}</p>
        </div>

        <div className="stat-card clickable" onClick={() => goTo("orders")}>
          <span className="stat-icon">⏳</span>
          <h3>Pending Orders</h3>
          <p className={stats.pendingOrders > 0 ? "highlight" : ""}>
            {stats.pendingOrders}
          </p>
        </div>

        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <h3>Revenue (delivered)</h3>
          <p>{formatPrice(stats.revenue)}</p>
        </div>
      </div>
    </>
  );
};

export default VendorHome;
