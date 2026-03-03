import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
    const navigate = useNavigate(); 

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => { 
        e.preventDefault();
        setMessage("");
        setLoading(true);

        await new Promise((r) => setTimeout(r, 400));

        setLoading(false);
        setMessage("Login submitted. Redirecting...");

        // setTimeout(() => navigate("/dashboard/technician"), 500);
    };

    // Styling for authentication (Login/Register) UI
    return ( 
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Sky Route</h1>
                <p className="auth-subtitle">Login</p>

                {/* Form container */}
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
                            placeholder="Enter password"
                        />
                    </div>

                    {/* Success message */}
                    {message && <div className="auth-success">{message}</div>}

                    {/* Submit button */}
                    <button className="auth-button" type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Navigation link */}
                <div className="auth-link-row">
                    Don't have an account? <Link to="/register">Create Account</Link>
                </div>
            </div>
        </div>
    );
}