import { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchProducts, fetchCategories } from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import {
  formatPrice,
  getError,
  onImgError,
  PLACEHOLDER_IMG,
} from "../utils/format";
import "../styles/products.css";

const EMPTY_FILTERS = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
};

const Products = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  // Links like /products?category=Fruits pre-fill the filters
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
  }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null); // { id, text, ok }

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  // Search on the server, 300ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setProducts(await fetchProducts(filters));
        setError("");
      } catch (err) {
        setError(getError(err));
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const setFilter = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleAdd = async (product) => {
    if (!user) {
      navigate("/login", { state: { from: "/products" } });
      return;
    }
    try {
      await addToCart(product._id, 1);
      setMessage({ id: product._id, text: "Added to cart ✓", ok: true });
    } catch (err) {
      setMessage({ id: product._id, text: getError(err), ok: false });
    }
    setTimeout(() => setMessage(null), 2000);
  };

  const canBuy = !user || user.role === "customer";

  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <h1>{filters.category || "All products"}</h1>
          <p className="muted">
            {loading ? "Loading..." : `${products.length} items from local shops`}
          </p>
        </div>
      </div>

      {/* CATEGORY CHIPS */}
      <div className="chip-row">
        {["", ...categories].map((c) => (
          <button
            key={c || "all"}
            className={`chip ${filters.category === c ? "active" : ""}`}
            onClick={() => setFilters({ ...filters, category: c })}
          >
            {c || "All"}
          </button>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            name="search"
            placeholder="Search products..."
            value={filters.search}
            onChange={setFilter}
            className="search-input"
          />
        </div>

        <input
          type="number"
          name="minPrice"
          placeholder="Min ₹"
          min="0"
          value={filters.minPrice}
          onChange={setFilter}
          className="price-input"
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max ₹"
          min="0"
          value={filters.maxPrice}
          onChange={setFilter}
          className="price-input"
        />

        <select name="sort" value={filters.sort} onChange={setFilter}>
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>

        <button className="clear-filters" onClick={() => setFilters(EMPTY_FILTERS)}>
          Clear
        </button>
      </div>

      {error && <div className="alert error page-alert">{error}</div>}

      {/* PRODUCTS */}
      {loading && products.length === 0 ? (
        <div className="products">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card skeleton" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🔎</div>
          <h3>No products found</h3>
          <p>Try a different search or clear the filters.</p>
        </div>
      ) : (
        <div className="products">
          {products.map((p) => (
            <div key={p._id} className="card">
              <div className="card-img">
                <img
                  src={p.image || PLACEHOLDER_IMG}
                  alt={p.name}
                  onError={onImgError}
                />
                <span className="card-category">{p.category}</span>
                {p.stock > 0 && p.stock <= 5 && (
                  <span className="low-stock">Only {p.stock} left</span>
                )}
              </div>

              <div className="card-body">
                <p className="card-shop">🏪 {p.vendor?.shopName}</p>
                <h3>{p.name}</h3>
                {p.description && <p className="card-desc">{p.description}</p>}

                <div className="card-foot">
                  <div>
                    <p className="card-price">{formatPrice(p.price)}</p>
                    <p className={p.stock > 0 ? "in-stock" : "out-stock"}>
                      {p.stock > 0 ? "In stock" : "Out of stock"}
                    </p>
                  </div>

                  {canBuy && (
                    <button
                      className="add-btn"
                      onClick={() => handleAdd(p)}
                      disabled={p.stock === 0}
                    >
                      {user ? "+ Add" : "Login to buy"}
                    </button>
                  )}
                </div>

                {message?.id === p._id && (
                  <p className={message.ok ? "card-msg ok" : "card-msg err"}>
                    {message.text}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
