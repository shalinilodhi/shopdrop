import { useState } from "react";
import DashboardHome from "./DashboardHome";
import Users from "./Users";
import Vendors from "./Vendors";
import AdminOrders from "./AdminOrders";
import "../../styles/admin.css";

const PAGES = [
  ["dashboard", "📊 Dashboard"],
  ["vendors", "🏪 Vendors"],
  ["users", "👥 Customers"],
  ["orders", "🧾 Orders"],
];

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "users":
        return <Users />;
      case "vendors":
        return <Vendors />;
      case "orders":
        return <AdminOrders />;
      default:
        return <DashboardHome goTo={setActivePage} />;
    }
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2>ShopNDrop</h2>
        <p className="sidebar-sub">Admin panel</p>
        <ul>
          {PAGES.map(([key, label]) => (
            <li
              key={key}
              className={activePage === key ? "active" : ""}
              onClick={() => setActivePage(key)}
            >
              {label}
            </li>
          ))}
        </ul>
      </aside>

      {/* CONTENT */}
      <main className="admin-content">{renderPage()}</main>
    </div>
  );
};

export default AdminDashboard;
