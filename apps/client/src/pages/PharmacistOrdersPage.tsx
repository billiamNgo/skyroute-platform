import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";
import OrdersList from "../components/OrdersList";
import "./Dashboard.css";
import "./OrdersPage.css";

type Order = {
  id: string;
  customerName: string;
  address: string;
  distance: string;
  status: string;
  packageWeight: string;
  medication: string;
  eta: string;
  assignedDroneId?: string;
};

type Drone = {
  droneID: number;
  currentStatus: string;
};

export default function PharmacistOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [selectedDroneId, setSelectedDroneId] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDrones, setLoadingDrones] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logoutUser();
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8080/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Raw response from /orders:", text);
        throw new Error("Failed to parse orders response.");
      }

      const ordersArray = Array.isArray(data) ? data : data.orders;

      if (!Array.isArray(ordersArray)) {
        throw new Error("API did not return an array of orders");
      }

      const mappedOrders = ordersArray.map((order: any) => ({
        id: order.orderID?.toString() || order.id,
        customerName:
          order.customerFirstName && order.customerLastName
            ? `${order.customerFirstName} ${order.customerLastName}`
            : order.customerName || "N/A",
        address: order.address || "N/A",
        distance: order.distance || "N/A",
        status: order.status || "N/A",
        packageWeight: order.packageWeight || order.package_weight || "N/A",
        medication: order.medicationName || order.medication || "N/A",
        eta: order.eta || "N/A",
        assignedDroneId:
          order.droneID?.toString() ||
          order.assignedDroneId?.toString() ||
          undefined,
      }));

      setOrders(mappedOrders);
    } catch (err: any) {
      console.error("Error loading orders:", err);
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchDrones = async () => {
    setLoadingDrones(true);

    try {
      const res = await fetch("http://localhost:8080/drones", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Raw response from /drones:", text);
        throw new Error("Failed to parse drones response.");
      }

      const dronesArray = Array.isArray(data) ? data : data.drones;

      if (!Array.isArray(dronesArray)) {
        throw new Error("API did not return an array of drones");
      }

      const mappedDrones = dronesArray.map((drone: any) => ({
        droneID: drone.droneID,
        currentStatus: drone.currentStatus || "Unknown",
      }));

      setDrones(mappedDrones);
    } catch (err) {
      console.error("Error loading drones:", err);
      setDrones([]);
    } finally {
      setLoadingDrones(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDrones();
  }, []);

  const availableDrones = drones.filter((drone) =>
    ["available", "idle", "ready"].includes(
      drone.currentStatus?.toLowerCase()
    )
  );

  const handleAssignDrone = async () => {
    if (!selectedOrder || !selectedDroneId || assigning) return;

    try {
      setAssigning(true);

      const res = await fetch(
        `http://localhost:8080/orders/assign/${selectedOrder.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            droneId: Number(selectedDroneId),
          }),
        }
      );

      const updatedOrder = await res.json();

      if (!res.ok) {
        throw new Error(updatedOrder.message || "Failed to assign drone.");
      }

      const newAssignedDroneId = String(
        updatedOrder.droneID ??
          updatedOrder.assignedDroneId ??
          selectedDroneId
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id
            ? {
                ...order,
                status: updatedOrder.status || "Assigned",
                assignedDroneId: newAssignedDroneId,
              }
            : order
        )
      );

      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              status: updatedOrder.status || "Assigned",
              assignedDroneId: newAssignedDroneId,
            }
          : prev
      );

      setSelectedDroneId("");
      fetchDrones();
    } catch (err: any) {
      console.error("Error assigning drone:", err);
      alert(err.message || "Failed to assign drone.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container orders-page-container">
        <div className="orders-topbar">
          <button
            className="orders-tab"
            onClick={() => navigate("/pharmacist")}
          >
            Back
          </button>

          <div className="orders-nav">
            <button className="orders-tab active-tab">Orders</button>
          </div>

          <button
            className="dashboard-danger-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <h1 className="dashboard-title">Pharmacist Orders</h1>

        <div className="orders-layout">
          <div className="orders-list-panel">
            <h2 className="orders-section-title">Select an Order:</h2>

            {loadingOrders ? (
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
                <p>
                  <strong>Assigned Drone:</strong>{" "}
                  {selectedOrder.assignedDroneId || "None"}
                </p>
              </div>
            ) : (
              <div className="order-details-placeholder">
                Select an order to view details
              </div>
            )}

            <div className="orders-action-group" style={{ marginTop: "20px" }}>
              <h2
                className="orders-section-title"
                style={{ marginBottom: "10px" }}
              >
                Available Drones
              </h2>

              {loadingDrones ? (
                <div>Loading drones...</div>
              ) : availableDrones.length === 0 ? (
                <div className="order-details-placeholder">
                  No available drones right now
                </div>
              ) : (
                <div className="assign-drone-field">
                  <label
                    htmlFor="pharmacist-drone-select"
                    className="assign-drone-label"
                  >
                    Select Drone
                  </label>

                  <select
                    id="pharmacist-drone-select"
                    className="assign-drone-select"
                    value={selectedDroneId}
                    onChange={(e) => setSelectedDroneId(e.target.value)}
                  >
                    <option value="">Select a drone...</option>
                    {availableDrones.map((drone) => (
                      <option key={drone.droneID} value={drone.droneID}>
                        Drone {drone.droneID} - {drone.currentStatus}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                className="orders-action-button orders-primary-button"
                onClick={handleAssignDrone}
                disabled={!selectedOrder || !selectedDroneId || assigning}
              >
                {assigning ? "Assigning..." : "Assign Drone"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}