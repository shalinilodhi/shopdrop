import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import "../styles/footer.css";

const Footer = () => {
  const { pathname } = useLocation();
  // Dashboards have their own full-height layout
  if (pathname.startsWith("/admin") || pathname.startsWith("/vendor")) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo size={34} light />
          <p>
            Your neighbourhood shops, now online. Fresh products from trusted
            local vendors, delivered to your door.
          </p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/products">All products</Link>
          <Link to="/products?category=Fruits">Fruits</Link>
          <Link to="/products?category=Vegetables">Vegetables</Link>
          <Link to="/products?category=Dairy">Dairy</Link>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/login">Log in</Link>
          <Link to="/register">Create account</Link>
          <Link to="/register">Sell on ShopNDrop</Link>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} ShopNDrop · Made for local businesses
      </div>
    </footer>
  );
};

export default Footer;
