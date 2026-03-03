import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();

  const ADMIN_CODE = "SKYROUTE" // for temporary front-end validation

  const roles = [
    { value: "technician", label: "Technician" },
    { value: "pharmacist", label: "Pharmacist" },
    { value: "admin", label: "Admin" },
  ];

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [adminCode, setAdminCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if(!username.trim()) return setMessage("Username is required.");
    if(!password.trim()) return setMessage("Password is required.");
    if(!role) return setMessage("Please select a role.");
    if (role === "admin" && adminCode !== ADMIN_CODE) {
      return setMessage("Invalid admin code.");
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);

    localStorage.setItem("role", role);
    localStorage.setItem("username", username);

    setMessage("Registration submitted. Redirecting...");
      setTimeout(() => navigate("/"), 700);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Sky Route</h1>
        <p className="auth-subtitle">Register</p>

        {/* Shared auth UI */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Username group */}
          <div>
            <div className="auth-label">Username</div>
            <input
              className="auth-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          {/* Password group */}
          <div>
            <div className="auth-label">Password</div>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
            />
          </div>

          {/* Role group */}
          <div>
            <div className="auth-label">Role</div>
            <select
              className="auth-select"
              value={role}
              onChange={(e) => {
                const newRole = e.target.value;
                setRole(newRole);
                if (newRole !== "admin") setAdminCode("");
              }}
            >
              <option value="">Select role...</option>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Admin code group */}
          {role === "admin" && (
            <div>
              <div className="auth-label">Admin Code</div>
              <input
                className="auth-input"
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Enter admin code"
              />
            </div>
          )}

          {/* Success message */}
          {message && <div className="auth-success">{message}</div>}

          {/* Submit button */}
          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Navigation button */}
        <div className="auth-link-row">
          Already have an account? <Link to="/">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}