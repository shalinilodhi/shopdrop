import { useEffect, useState } from "react";
import { fetchCustomers, setCustomerBlocked } from "../../api/api";
import { formatDate, getError } from "../../utils/format";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomers()
      .then(setUsers)
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, []);

  const toggleBlock = async (u) => {
    const block = !u.isBlocked;
    if (block && !window.confirm(`Block ${u.name}?`)) return;
    try {
      const { customer } = await setCustomerBlocked(u._id, block);
      setUsers(users.map((x) => (x._id === u._id ? customer : x)));
    } catch (err) {
      setError(getError(err));
    }
  };

  if (loading) return <h2>Loading customers...</h2>;

  return (
    <>
      <h1>Customers</h1>
      {error && <div className="alert error">{error}</div>}

      {users.length === 0 ? (
        <p>No customers yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <span className={`badge badge-${u.isBlocked ? "blocked" : "active"}`}>
                      {u.isBlocked ? "blocked" : "active"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn ${u.isBlocked ? "primary" : "danger"}`}
                      onClick={() => toggleBlock(u)}
                    >
                      {u.isBlocked ? "Unblock" : "Block"}
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

export default Users;
