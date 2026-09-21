import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { updateMe } from "../api/api";
import StatusBadge from "../components/StatusBadge";
import { getError } from "../utils/format";
import "../styles/profile.css";

const Profile = () => {
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    shopName: user?.shopName || "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState(null); // { text, ok }

  if (!user) return null;
  const isVendor = user.role === "vendor";

  const save = async (body, reset) => {
    setMessage(null);
    try {
      const data = await updateMe(body);
      updateUser(data.user);
      setMessage({ text: data.message, ok: true });
      if (reset) reset();
    } catch (err) {
      setMessage({ text: getError(err), ok: false });
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">{(user.name || "?").charAt(0).toUpperCase()}</div>
          <div>
            <h2>{user.name}</h2>
            <p>Manage your account details</p>
          </div>
        </div>

        <div className="profile-row">
          <span>Email</span>
          <strong>{user.email}</strong>
        </div>
        <div className="profile-row">
          <span>Role</span>
          <strong className="capitalize">{user.role}</strong>
        </div>
        {isVendor && (
          <div className="profile-row">
            <span>Shop status</span>
            <StatusBadge status={user.vendorStatus} />
          </div>
        )}

        {message && (
          <div className={`alert ${message.ok ? "success" : "error"}`}>
            {message.text}
          </div>
        )}

        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            save(form);
          }}
        >
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />

          {isVendor && (
            <>
              <label>Shop Name</label>
              <input
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                required
              />
            </>
          )}

          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} />

          <label>Address</label>
          <textarea
            name="address"
            rows={2}
            value={form.address}
            onChange={handleChange}
          />

          <button className="btn primary full">Save Changes</button>
        </form>

        <h3 className="section-title">Change Password</h3>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            save(passwords, () =>
              setPasswords({ currentPassword: "", newPassword: "" })
            );
          }}
        >
          <input
            type="password"
            placeholder="Current password"
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, currentPassword: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="New password (min 6 characters)"
            minLength={6}
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, newPassword: e.target.value })
            }
            required
          />
          <button className="btn primary full">Update Password</button>
        </form>

        <button
          className="logout-btn"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
