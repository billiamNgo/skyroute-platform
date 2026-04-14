import { useState, useEffect } from "react";
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
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("http://localhost:8080/orders", {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json"
                    }
                });
                const text = await res.text();
                let data;
                try {
                    data = JSON.parse(text);
                } catch (parseErr) {
                    console.error("Raw response from /orders:", text);
                    throw new Error("Failed to parse response from server. See console for details.");
                }
                if (!Array.isArray(data)) {
                    throw new Error("API did not return an array of orders");
                }
                const mappedOrders = data.map((order: any) => ({
                    id: order.orderID?.toString() || order.id,
                    customerName: order.customerFirstName && order.customerLastName ? `${order.customerFirstName} ${order.customerLastName}` : order.customerName || "N/A",
                    address: order.address || "N/A",
                    distance: order.distance || "N/A",
                    status: order.status,
                    packageWeight: order.packageWeight || order.package_weight || "N/A",
                    medication: order.medicationName || order.medication || "N/A",
                    eta: order.eta || "N/A",
                }));
                setOrders(mappedOrders);
            } catch (err: any) {
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

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
                            onClick={() => navigate("/fleet")}
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
                        {loading ? (
                            <div>Loading orders...</div>
                        ) : error ? (
                            <div style={{ color: "red" }}>{error}</div>
                        ) : (
                            <OrdersList 
                                orders={orders} 
                                onSelect={setSelectedOrder}
                                selectedOrderId={selectedOrder?.id}
                            />
                        )}
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