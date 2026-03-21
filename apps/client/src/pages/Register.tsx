import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css"

const API_BASE = "http://localhost:8080";

export default function Register() {
  const navigate = useNavigate();

  const ADMIN_CODE = "SKYROUTE" // for temporary front-end validation

  const roles = [
    { value: "technician", label: "Technician" },
    { value: "pharmacist", label: "Pharmacist" },
    { value: "admin", label: "Admin" },
  ];

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [adminCode, setAdminCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if(!email.trim()) return setMessage("Email is required.");
    if(!password.trim()) return setMessage("Password is required.");
    if(!firstName.trim()) return setMessage("First name is required.");
    if(!lastName.trim()) return setMessage("Last name is required.");
    if(!role) return setMessage("Please select a role.");

    if (role === "admin" && adminCode !== ADMIN_CODE) {
      return setMessage("Invalid admin code.");
    }
    
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          email,
          firstName,
          lastName, 
          password, 
          role
        })
      });

      const data = await response.json();

      if (!response.ok) { 
        throw new Error(data.message || "Registration failed.");
      }

      setMessage("Registration successful. Redirecting...");
      setTimeout(() => navigate("/login"), 700);
    } catch (error: any) { 
      setMessage(error.message || "Something went wrong.");
    } finally { 
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src="/drone.png" alt="Sky Route logo" className="auth-logo" />
        <h1 className="auth-title">Sky Route</h1>
        <p className="auth-subtitle">Register</p>

        {/* Shared auth UI */}
        <form className="auth-form" onSubmit={handleSubmit}>

          {/* Email group */}
          <div>
            <div className="auth-label">Email</div>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>

          {/* First Name group */}
          <div> 
            <div className="auth-label">First Name</div>
            <input
              className="auth-input"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              />
              </div>

          {/* Last Name group */}
          <div> 
            <div className="auth-label">Last Name</div>
            <input
              className="auth-input"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
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
          Already have an account? <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}