import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";
import OrdersList from "../components/OrdersList";
import "./OrdersPage.css";

type Order = { 
    id: string;
    customerName: string;
    address: string;
    distance: string;
    status: string;
};

export default function OrdersPage() { 
    const navigate = useNavigate(); 

    const handleLogout = async () => { 
        await logoutUser();
    };

    const orders: Order[] = [ 
        { 
            id: "ORD-001",
            customerName: "John Doe",
            address: "123 Main St",
            distance: "2.4 miles",
            status: "Pending",
        },
        {
            id: "ORD-002",
            customerName: "Jane Adams",
            address: "405 Oak Ave",
            distance: "4.1 miles",
            status: "Assigned",
        },
        {
            id: "ORD-003",
            customerName: "Patrick Smith",
            address: "307 Bear Ln",
            distance: "1.8 miles",
            status: "In-Transit",
        },
    ];

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
                        <OrdersList orders={orders} />
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