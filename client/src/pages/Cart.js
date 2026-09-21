import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import {
  formatPrice,
  getError,
  onImgError,
  PLACEHOLDER_IMG,
} from "../utils/format";
import "../styles/cart.css";

const Cart = () => {
  const { items, count, total, updateQuantity, removeFromCart, clearCart } =
    useContext(CartContext);
  const [error, setError] = useState("");

  const run = async (action) => {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(getError(err));
    }
  };

  if (items.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-state">
          <div className="emoji">🛍️</div>
          <h3>Your bag is empty</h3>
          <p>Fresh products from local shops are waiting for you.</p>
          <Link to="/products" className="primary-link">Start shopping</Link>
        </div>
      </div>
    );
  }

  const shops = new Set(items.map((i) => i.product.vendor?._id)).size;

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {error && <div className="alert error">{error}</div>}

      <div className="cart-list">
        {items.map(({ product, quantity }) => (
          <div key={product._id} className="cart-item">
            <img
              src={product.image || PLACEHOLDER_IMG}
              alt={product.name}
              onError={onImgError}
            />
            <div className="cart-info">
              <h4>{product.name}</h4>
              <p className="muted">🏪 {product.vendor?.shopName}</p>
              <p>{formatPrice(product.price)} each</p>
            </div>

            <div className="qty">
              <button
                onClick={() => run(() => updateQuantity(product._id, quantity - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease"
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => run(() => updateQuantity(product._id, quantity + 1))}
                aria-label="Increase"
              >
                +
              </button>
            </div>

            <strong className="line-total">
              {formatPrice(product.price * quantity)}
            </strong>

            <button
              className="remove-btn"
              onClick={() => run(() => removeFromCart(product._id))}
              aria-label="Remove"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <aside className="cart-summary">
        <h3>Order summary</h3>
        <div className="summary-row">
          <span>Items ({count})</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="summary-row">
          <span>Shops</span>
          <span>{shops}</span>
        </div>
        <div className="summary-row">
          <span>Delivery</span>
          <span className="in-stock">Free</span>
        </div>
        <div className="summary-row summary-total">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <Link to="/checkout" className="checkout-btn">
          Proceed to Checkout →
        </Link>
        <button className="clear-btn" onClick={() => run(clearCart)}>
          Clear cart
        </button>
      </aside>
    </div>
  );
};

export default Cart;
