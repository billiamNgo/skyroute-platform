import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";
import OrdersList from "../components/OrdersList";
import "./OrdersPage.css";
import "./Dashboard.css"

type Order = { 
    id: string;
    customerName: string;
    address: string;
    distance: string;
    status: string;
    packageWeight: string;
    medication: string;
    eta: string;
};

export default function OrdersPage() { 
    const navigate = useNavigate(); 
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const handleLogout = async () => { 
        await logoutUser();
    };

    const handleAssignDrone = () => { 
        if (!selectedOrder) return;
        alert(`Assigning drone to order ${selectedOrder.id}`);
    };

    const handleCancelOrder = () => { 
        if (!selectedOrder) return;
        alert(`Cancelling order ${selectedOrder.id}`);
    };

    const orders: Order[] = [ 
        { 
            id: "ORD-001",
            customerName: "John Doe",
            address: "123 Main St",
            distance: "2.4 miles",
            status: "Pending",
            packageWeight: "2.1 oz",
            medication: "Amoxicillian 500mg",
            eta: "18 minutes",
        },
        {
            id: "ORD-002",
            customerName: "Jane Adams",
            address: "405 Oak Ave",
            distance: "4.1 miles",
            status: "Assigned",
            packageWeight: "1.4 oz",
            medication: "Insulin",
            eta: "25 minutes",
        },
        {
            id: "ORD-003",
            customerName: "Patrick Smith",
            address: "307 Bear Ln",
            distance: "1.8 miles",
            status: "In-Transit",
            packageWeight: "0.9 oz",
            medication: "Blood Pressure Medication",
            eta: "10 minutes",
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
                        <OrdersList 
                        orders={orders} 
                        onSelect={setSelectedOrder}
                        selectedOrderId={selectedOrder?.id}
                        />
                    </div>

                    <div className="orders-details-panel">
                        <h2 className="orders-section-title">Order Details:</h2>

                    {selectedOrder ? ( 
                        <div className="order-details-card">
                            <p>
                                <strong>Order ID:</strong> {selectedOrder.id}
                            </p>
                            <p>
                                <strong>Customer:</strong> {selectedOrder.customerName}
                            </p>
                            <p>
                                <strong>Address:</strong> {selectedOrder.address}
                            </p>
                            <p>
                                <strong>Distance:</strong> {selectedOrder.distance}
                            </p>
                            <p>
                                <strong>Status:</strong> {selectedOrder.status}
                            </p>
                            <p>
                                <strong>Package Weight:</strong> {selectedOrder.packageWeight}
                            </p>
                            <p>
                                <strong>Medication:</strong> {selectedOrder.medication}
                            </p>
                            <p>
                                <strong>ETA:</strong> {selectedOrder.eta}
                            </p>
                        </div>

                    ) : ( 
                    <div className="order-details-placeholder">
                        Select an order to view details
                    </div>
                )}

                    <div className="orders-action-group">
                        <button 
                            className="orders-action-button orders-primary-button"
                            onClick={handleAssignDrone}
                            disabled={!selectedOrder}
                        >
                            Assign Drone
                        </button>

                        <button 
                            className="orders-action-button dashboard-danger-button"
                            onClick={handleCancelOrder}
                            disabled={!selectedOrder}
                        >
                            Cancel Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}