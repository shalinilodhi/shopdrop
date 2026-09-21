import { useEffect, useState } from "react";
import { fetchVendors, approveVendor, suspendVendor } from "../../api/api";
import StatusBadge from "../../components/StatusBadge";
import { getError } from "../../utils/format";

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVendors()
      .then(setVendors)
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, []);

  const update = async (v, action) => {
    if (action === suspendVendor && !window.confirm(`Suspend ${v.shopName}?`)) {
      return;
    }
    try {
      const { vendor } = await action(v._id);
      setVendors(
        vendors.map((x) =>
          x._id === v._id ? { ...vendor, productCount: x.productCount } : x
        )
      );
    } catch (err) {
      setError(getError(err));
    }
  };

  if (loading) return <h2>Loading vendors...</h2>;

  return (
    <>
      <h1>Vendors</h1>
      {error && <div className="alert error">{error}</div>}

      {vendors.length === 0 ? (
        <p>No vendors yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Owner</th>
                <th>Contact</th>
                <th>Products</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {vendors.map((v) => (
                <tr key={v._id}>
                  <td>
                    <strong>{v.shopName}</strong>
                    <div className="muted small">{v.address}</div>
                  </td>
                  <td>{v.name}</td>
                  <td>
                    {v.email}
                    <div className="muted small">{v.phone}</div>
                  </td>
                  <td>{v.productCount}</td>
                  <td>
                    <StatusBadge status={v.vendorStatus} />
                  </td>
                  <td>
                    {v.vendorStatus !== "approved" && (
                      <button
                        className="btn success"
                        onClick={() => update(v, approveVendor)}
                      >
                        {v.vendorStatus === "suspended" ? "Reactivate" : "Approve"}
                      </button>
                    )}
                    {v.vendorStatus !== "suspended" && (
                      <button
                        className="btn danger"
                        onClick={() => update(v, suspendVendor)}
                      >
                        Suspend
                      </button>
                    )}
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

export default Vendors;
