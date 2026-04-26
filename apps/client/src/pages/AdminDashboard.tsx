import { useEffect, useState } from "react";
import { logoutUser } from "../utils/auth";
import "./Dashboard.css";

export default function AdminDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [manualId, setManualId] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const handleLogout = async () => {
    await logoutUser();
  };

  useEffect(() => {
    fetch("/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));
  }, [token]);

  useEffect(() => {
    fetch("/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setUsers([]);
        setLoading(false);
      });
  }, [token]);

  const assignUser = async (userId: string) => {
    if (!userId.trim()) {
      alert("Enter a user ID");
      return;
    }

    try {
      const res = await fetch(`/users/${userId}/pharmacy`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      setUsers((prev) => prev.filter((u) => u.id !== userId));

      setManualId("");
      alert("User assigned successfully");
    } catch {
      alert("Failed to assign user");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        <h1 className="dashboard-title">Admin Dashboard</h1>

        <p className="dashboard-subtitle">
          Pharmacy ID: {profile?.pharmacyId || "Loading..."}
        </p>

        <div className="dashboard-section">
          <h3>Assign User by ID</h3>

          <div className="dashboard-actions">
            <input
              className="dashboard-input"
              type="text"
              placeholder="Enter user ID"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
            />

            <button
              className="dashboard-button"
              onClick={() => assignUser(manualId)}
              disabled={!manualId.trim()}
            >
              Assign
            </button>
          </div>
        </div>

        <div style={{ marginTop: "30px", width: "100%" }}>
          <h3>Unassigned Users</h3>

          {loading && <p>Loading users...</p>}

          {!loading && users.length === 0 && (
            <p>No unassigned users found</p>
          )}

          {!loading && users.length > 0 && (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <button
                        className="dashboard-button"
                        onClick={() => assignUser(user.id)}
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <button
          className="dashboard-danger-button"
          onClick={handleLogout}
          style={{ marginTop: "30px" }}
        >
          Logout
        </button>

      </div>
    </div>
  );
}