import { useNavigate } from "react-router-dom";
import "./Welcome.css";

export default function Welcome() { 
    const navigate = useNavigate(); 

    return ( 
        <div className="welcome-page">
            <div className="welcome-content">
                <img
                src="/drone.png"
                alt="SkyRoute drone"
                className="welcome-drone"
            />

            <h1 className="welcome-title">Welcome to Sky Route</h1>

            <p className="welcome-text">
                Sky Route is a drone-based pharmacy delivery system designed 
                to help customers recieve medication quickly and securely.
            </p>

            <div className="welcome-button-row">
                <button
                    className="welcome-button"
                    onClick={() => navigate("/login")}
                    >
                    Login
                    </button>
                        
                <button
                    className="welcome-button"
                    onClick={() => navigate("/register")}
                    >
                    Register
                    </button>        
                </div>
            </div>
        </div>
    );
}