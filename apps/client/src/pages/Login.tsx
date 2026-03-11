import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const API_BASE = "http://localhost:3000";

export default function Login() {
    const navigate = useNavigate(); 

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault();
        setMessage("");

        if (!email.trim()) return setMessage("Email is required.");
        if (!password.trim()) return setMessage("Password is required.");
        
        try { 
            setLoading(true);
            
            const response = await fetch(`${API_BASE}/login`, { 
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    email,
                    password,
                }),
            });

        const data = await response.json(); 

        if (!response.ok) { 
            throw new Error(data.message || "Login failed.")
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role); 
        localStorage.setItem("email", data.user.email);
        
        setMessage("Login successful. Redirecting...");

        setTimeout(() => {
            if (data.user.role === "admin") navigate("/admin");
            else if (data.user.role === "pharmacist") navigate("/pharmacist");
            else navigate("/technician");
        }, 300);

        } catch (error: any) { 
            setMessage(error.message || "Something went wrong.")
        } finally { 
            setLoading(false);
        }
    };

    // Styling for authentication (Login/Register) UI
    return ( 
        <div className="auth-page">
            <div className="auth-card">
                <img src="/drone.png" alt="Sky Route logo" className="auth-logo" />
                <h1 className="auth-title">Sky Route</h1>
                <p className="auth-subtitle">Login</p>

                {/* Form container */}
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