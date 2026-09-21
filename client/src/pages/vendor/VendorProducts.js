import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  fetchVendorProducts,
  addVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
} from "../../api/api";
import {
  formatPrice,
  getError,
  onImgError,
  PLACEHOLDER_IMG,
} from "../../utils/format";

const CATEGORIES = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
  "Grocery",
  "Snacks",
  "Beverages",
  "Household",
  "Personal Care",
];

const EMPTY_FORM = {
  name: "",
  price: "",
  category: "",
  stock: "",
  image: "",
  description: "",
};

const VendorProducts = () => {
  const { user } = useContext(AuthContext);
  const approved = user?.vendorStatus === "approved";

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null); // { text, ok }

  useEffect(() => {
    fetchVendorProducts()
      .then(setProducts)
      .catch((err) => setMessage({ text: getError(err), ok: false }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const body = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock || 0),
    };

    try {
      if (editingId) {
        const updated = await updateVendorProduct(editingId, body);
        setProducts(products.map((p) => (p._id === editingId ? updated : p)));
        setMessage({ text: "Product updated", ok: true });
      } else {
        const created = await addVendorProduct(body);
        setProducts([created, ...products]);
        setMessage({ text: "Product added", ok: true });
      }
      resetForm();
    } catch (err) {
      setMessage({ text: getError(err), ok: false });
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: p.price,
      category: p.category,
      stock: p.stock,
      image: p.image || "",
      description: p.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteVendorProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setMessage({ text: getError(err), ok: false });
    }
  };

  if (loading) return <h2>Loading products...</h2>;

  return (
    <>
      <h1>My Products</h1>

      {message && (
        <div className={`alert ${message.ok ? "success" : "error"}`}>
          {message.text}
        </div>
      )}

      {/* ADD / EDIT PRODUCT FORM */}
      <form onSubmit={handleSubmit} className="panel product-form">
        <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
        <fieldset disabled={!approved}>
          <div className="form-grid">
            <input
              name="name"
              placeholder="Product name *"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="category"
              placeholder="Category *"
              list="category-list"
              value={form.category}
              onChange={handleChange}
              required
            />
            <datalist id="category-list">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <input
              type="number"
              name="price"
              placeholder="Price (₹) *"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="stock"
              placeholder="Stock quantity *"
              min="0"
              value={form.stock}
              onChange={handleChange}
              required
            />
            <input
              name="image"
              placeholder="Image URL (optional)"
              value={form.image}
              onChange={handleChange}
              className="span-2"
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              rows={2}
              value={form.description}
              onChange={handleChange}
              className="span-2"
            />
          </div>

          <button className="btn success" type="submit">
            {editingId ? "Save Changes" : "Add Product"}
          </button>
          {editingId && (
            <button type="button" className="btn secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </fieldset>
      </form>

      {/* PRODUCTS TABLE */}
      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="vendor-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <img
                      className="thumb"
                      src={p.image || PLACEHOLDER_IMG}
                      alt=""
                      onError={onImgError}
                    />
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td className={p.stock === 0 ? "out-stock" : ""}>
                    {p.stock === 0 ? "Out of stock" : p.stock}
                  </td>
                  <td>
                    <button
                      className="btn primary"
                      onClick={() => startEdit(p)}
                      disabled={!approved}
                    >
                      Edit
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => handleDelete(p._id)}
                    >
                      Delete
                    </button>
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

export default VendorProducts;
