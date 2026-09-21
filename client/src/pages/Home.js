import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchProducts } from "../api/api";
import { LogoMark } from "../components/Logo";
import { formatPrice, onImgError, PLACEHOLDER_IMG } from "../utils/format";
import "../styles/home.css";

const CATEGORIES = [
  ["Fruits", "🍎"],
  ["Vegetables", "🥦"],
  ["Dairy", "🥛"],
  ["Bakery", "🥖"],
  ["Grocery", "🛒"],
  ["Snacks", "🍪"],
];

const STEPS = [
  ["🔍", "Find local shops", "Browse fresh products from verified vendors near you."],
  ["🛍️", "Fill your bag", "Add items from one shop or many — it's one checkout."],
  ["🚚", "We drop it off", "Your shop accepts the order and delivers to your door."],
];

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [picks, setPicks] = useState([]);

  useEffect(() => {
    fetchProducts({ sort: "newest" })
      .then((list) => setPicks(list.slice(0, 4)))
      .catch(() => {});
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">🛍️ Local shops · Fast delivery</span>
          <h1>
            Shop from your <span className="accent-text">neighbourhood</span>,
            we drop it at your door.
          </h1>
          <p>
            Fresh fruits, vegetables, bakery and daily essentials from trusted
            local vendors — all in one place.
          </p>

          <form className="hero-search" onSubmit={onSearch}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for milk, bread, apples..."
            />
            <button type="submit">Search</button>
          </form>

          <div className="hero-stats">
            <div><strong>100%</strong><span>Verified vendors</span></div>
            <div><strong>Same day</strong><span>Local delivery</span></div>
            <div><strong>COD</strong><span>Pay on delivery</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-blob" />
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=900"
            alt="Fresh groceries"
          />
          <div className="float-card fc-1">
            <LogoMark size={30} />
            <div>
              <strong>Order dropped!</strong>
              <span>Delivered in 35 min</span>
            </div>
          </div>
          <div className="float-card fc-2">
            <span className="fc-emoji">🥬</span>
            <div>
              <strong>Farm fresh</strong>
              <span>From local sellers</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="section-head">
          <h2>Shop by category</h2>
          <Link to="/products">View all →</Link>
        </div>
        <div className="category-grid">
          {CATEGORIES.map(([name, emoji]) => (
            <Link
              key={name}
              to={`/products?category=${name}`}
              className="category-card"
            >
              <span className="category-emoji">{emoji}</span>
              <span>{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FRESH PICKS */}
      {picks.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Fresh picks</h2>
            <Link to="/products">See more →</Link>
          </div>
          <div className="picks-grid">
            {picks.map((p) => (
              <Link to="/products" key={p._id} className="pick-card">
                <img src={p.image || PLACEHOLDER_IMG} alt={p.name} onError={onImgError} />
                <div className="pick-body">
                  <span className="pick-shop">{p.vendor?.shopName}</span>
                  <strong>{p.name}</strong>
                  <span className="pick-price">{formatPrice(p.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="section how">
        <h2>How ShopNDrop works</h2>
        <div className="steps">
          {STEPS.map(([icon, title, text], i) => (
            <div key={title} className="step">
              <span className="step-num">{i + 1}</span>
              <span className="step-icon">{icon}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SELL CTA */}
      <section className="sell-cta">
        <div>
          <h2>Own a local shop?</h2>
          <p>
            List your products on ShopNDrop and reach customers in your area.
            Free to join — start selling once the admin approves your shop.
          </p>
        </div>
        <Link to="/register" className="cta-btn">Start selling →</Link>
      </section>
    </div>
  );
};

export default Home;
