import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import VendorHome from "./VendorHome";
import VendorProducts from "./VendorProducts";
import VendorOrders from "./VendorOrders";
import "../../styles/vendor.css";

const PAGES = [
  ["dashboard", "📊 Dashboard"],
  ["products", "📦 My Products"],
  ["orders", "🧾 Orders"],
];

const VendorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "products":
        return <VendorProducts />;
      case "orders":
        return <VendorOrders />;
      default:
        return <VendorHome goTo={setActivePage} />;
    }
  };

  return (
    <div className="vendor-layout">
      {/* SIDEBAR */}
      <aside className="vendor-sidebar">
        <h2>{user?.shopName || "Vendor Panel"}</h2>
        <p className="sidebar-sub">Vendor panel</p>

        <div className="vendor-nav">

        {PAGES.map(([key, label]) => (
          <button
            key={key}
            className={activePage === key ? "active" : ""}
            onClick={() => setActivePage(key)}
          >
            {label}
          </button>
        ))}
        </div>
      </aside>

      {/* CONTENT */}
      <main className="vendor-content">
        {user?.vendorStatus === "pending" && (
          <div className="alert warning">
            ⏳ Your shop is waiting for admin approval. You can add products
            once the admin approves you.
          </div>
        )}
        {user?.vendorStatus === "suspended" && (
          <div className="alert error">
            🚫 Your shop has been suspended by the admin. Your products are
            hidden from customers.
          </div>
        )}
        {renderPage()}
      </main>
    </div>
  );
};

export default VendorDashboard;
