import { useNavigate } from "react-router-dom";
import "./Welcome.css";

export default function Welcome() { 
    const navigate = useNavigate(); 

    return ( 
        <div className="welcome-page">
            <div className="welcome-overlay">
                <div className="welcome-content">
                    <img
                    src="/drone.png"
                    alt="SkyRoute drone"
                    className="welcome-drone"
                />

                <h1 className="welcome-title">Welcome to SkyRoute</h1>

                <p className="welcome-text">
                    SkyRoute is a drone-based pharmacy delivery system designed 
                    to help customers recieve medication quickly and securely.
                </p>

                <div className="welcome-button-row">
                    <button
                        className="welcome-button primary"
                        onClick={() => navigate("/login")}
                        >
                        Login
                        </button>
                        
                    <button
                        className="welcome-button secondary"
                        onClick={() => navigate("/register")}
                        >
                        Register
                        </button>        
                    </div>
                </div>
            </div>
        </div>
    );
}