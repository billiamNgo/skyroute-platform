import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";
import "./OrdersPage.css";

export default function OrdersPage() { 
    const navigate = useNavigate(); 

    const handleLogout = async () => { 
        await logoutUser();
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-container orders-page-container">
                <div className="orders-topbar">
                    <button
                        className="orders-tab"
                        onClick={() => navigate("/technician")}
                    >
                        Back
                    </button>

                    <div className="orders-nav">
                        <button className="orders-tab active-tab">Orders</button>
                        <button
                            className="orders-tab"
                            onClick={() => navigate("/technician")}
                        >
                            Drones
                        </button>
                        <button
                            className="orders-tab"
                            onClick={() => navigate("/technician")}
                        >
                            Tracking
                        </button>
                        <button
                            className="orders-tab"
                            onClick={() => navigate("/technician")}
                        >
                            Notifications
                            </button>
                        </div>

                        <button className="dashboard-danger-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>

                    <h1 className="dashboard-title">Orders</h1>

                <div className="orders-layout">
                    <div className="orders-list-panel">
                        <h2 className="orders-section-title">Select an Order:</h2>

                        <div className="order-card-placeholder">Order placeholder</div>
                        <div className="order-card-placeholder">Order placeholder</div>
                        <div className="order-card-placeholder">Order placeholder</div>
                        <div className="order-card-placeholder">Order placeholder</div>
                        <div className="order-card-placeholder">Order placeholder</div>
                    </div>

                    <div className="orders-details-panel">
                        <h2 className="orders-section-title">Order Details:</h2>

                    <div className="order-details-placeholder">
                        Details panel placeholder
                    </div>

                    <div className="orders-action-group">
                        <button className="orders-action-button orders-primary-button">
                            Assign Drone
                        </button>

                        <button className="orders-action-button dashboard-danger-button">
                            Cancel Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}