import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCartItems,
} from "../api/api";

export const CartContext = createContext();

// The cart lives in MongoDB; this keeps a copy for the UI
export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const isCustomer = user?.role === "customer";
  const [items, setItems] = useState([]);

  const refreshCart = useCallback(async () => {
    if (!isCustomer) return setItems([]);
    try {
      const cart = await getCart();
      setItems(cart.items || []);
    } catch {
      setItems([]);
    }
  }, [isCustomer]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart, user?._id]);

  // Each action throws on failure so the page can show the message
  const apply = async (request) => {
    const cart = await request;
    setItems(cart.items || []);
  };

  const addToCart = (productId, quantity = 1) =>
    apply(addCartItem(productId, quantity));
  const updateQuantity = (productId, quantity) =>
    apply(updateCartItem(productId, quantity));
  const removeFromCart = (productId) => apply(removeCartItem(productId));
  const clearCart = () => apply(clearCartItems());

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        total,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        resetCart: () => setItems([]),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
