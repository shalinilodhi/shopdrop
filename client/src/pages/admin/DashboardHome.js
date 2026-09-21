import { useEffect, useState } from "react";
import { fetchAdminStats } from "../../api/api";
import { formatPrice } from "../../utils/format";

const DashboardHome = ({ goTo }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch((err) => console.error("Admin stats error", err));
  }, []);

  if (!stats) return <h2>Loading dashboard...</h2>;

  return (
    <>
      <h1>Admin Dashboard</h1>

      {stats.pendingVendors > 0 && (
        <div className="alert warning clickable" onClick={() => goTo("vendors")}>
          ⏳ {stats.pendingVendors} vendor(s) waiting for approval — review now →
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => goTo("users")}>
          <span className="stat-icon">👥</span>
          <h3>Total Customers</h3>
          <p>{stats.totalCustomers}</p>
        </div>

        <div className="stat-card clickable" onClick={() => goTo("vendors")}>
          <span className="stat-icon">🏪</span>
          <h3>Total Vendors</h3>
          <p>{stats.totalVendors}</p>
        </div>

        <div className="stat-card clickable" onClick={() => goTo("vendors")}>
          <span className="stat-icon">⏳</span>
          <h3>Pending Approvals</h3>
          <p className={stats.pendingVendors > 0 ? "highlight" : ""}>
            {stats.pendingVendors}
          </p>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📦</span>
          <h3>Total Products</h3>
          <p>{stats.totalProducts}</p>
        </div>

        <div className="stat-card clickable" onClick={() => goTo("orders")}>
          <span className="stat-icon">🧾</span>
          <h3>Total Orders</h3>
          <p>{stats.totalOrders}</p>
        </div>

        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <h3>Revenue (delivered)</h3>
          <p>{formatPrice(stats.totalRevenue)}</p>
        </div>
      </div>
    </>
  );
};

export default DashboardHome;
