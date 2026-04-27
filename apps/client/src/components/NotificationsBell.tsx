import { useEffect, useRef, useState } from "react";
import "./NotificationsBell.css";
import { API_BASE } from "../utils/auth";

type NotificationSeverity = "info" | "warning" | "success";

export type AppNotification = {
    id: string;
    title: string;
    message: string;
    severity: NotificationSeverity;
    timestamp: Date | null;
    read: boolean;
};

type Order = {
    orderID: number;
    status: string;
    customerFirstName: string;
    customerLastName: string;
    medicationName: string;
}

type Drone = {
    droneID: number;
    currentStatus: string;
    batteryLevel: number;
}

function formatTimestamp(ts: Date | null): string {
    if (!ts) return "No timestamp available";
    return ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function buildNotifications(orders: Order[], drones: Drone[]) {
    const notes: AppNotification[] = []
    const now = new Date();

    orders.forEach((order) => {
        const name = `${order.customerFirstName} ${order.customerLastName}`;

        if (order.status === "IN_TRANSIT") {
            notes.push({
                id: `order-transit-${order.orderID}`,
                title: "Order In Transit",
                message: `Order #${order.orderID} for ${name} (${order.medicationName}) is now in transit.`,
                severity: "info",
                timestamp: now,
                read: false
            });
        }

        if (order.status === "PENDING") {
            notes.push({
                id: `order-pending-${order.orderID}`,
                title: "Pending Order",
                message: `Order #${order.orderID} for ${name} is awaiting drone assignment.`,
                severity: "warning",
                timestamp: now,
                read: false
            });
        }

        if (order.status === "DELIVERED") {
            notes.push({
                id: `order-delivered-${order.orderID}`,
                title: "Order Delivered",
                message: `Order #${order.orderID} for ${name} has been successfully delivered.`,
                severity: "success",
                timestamp: now,
                read: false
            });
        }
    });
    drones.forEach((drone) => {
        if (drone.batteryLevel < 20) {
            notes.push({
                id: `drone-battery-${drone.droneID}`,
                title: "Low Battery Warning",
                message: `Drone #${drone.droneID} battery is critically low (${drone.batteryLevel}%). Charge immediately.`,
                severity: "warning",
                timestamp: now,
                read: false
            })
        }
    

        if (drone.currentStatus === "IN_TRANSIT") {
            notes.push({
                id: `drone-transit-${drone.droneID}`,
                title: "Drone Dispatched",
                message: `Drone #${drone.droneID} is currently in transit on a delivery.`,
                severity: "info",
                timestamp: now,
                read: false,
            });
        }
    });

    return notes.reverse();
}

export default function NotificationsBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const headers = {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                };

                const [ordersRes, dronesRes] = await Promise.all([
                    fetch(`${API_BASE}/orders`, { headers }),
                    fetch(`${API_BASE}/drones`, { headers }),
                ]);

                let orders: Order[] = [];
                let drones: Drone[] = [];

                try {
                    const parsed = await ordersRes.json();
                    
                    if (Array.isArray(parsed)) {
                        orders = parsed;
                    }

                    else if (parsed.orders) {
                        orders = parsed.orders;
                    }

                    else {
                        orders = [];
                    }
                }

                catch {
                    console.error("Could not parse orders");
                }

                try {
                    const parsed = await dronesRes.json();
                    
                    if(Array.isArray(parsed)) {
                        drones = parsed;
                    }

                    else if (parsed.drones) {
                        drones = parsed.drones;
                    }

                    else {
                        drones = []
                    }
                }

                catch {
                    console.error("Could not parse drones");
                }

                const dismissed = JSON.parse(localStorage.getItem("dismissedNotifications") || "[]");
                const allNotifications = buildNotifications(orders, drones);
                setNotifications(allNotifications.filter((n) => !dismissed.includes(n.id)));
            }

            catch (err) {
                console.error("Failed to load notifications", err)
            }

            finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [open]);

    const handleBellClick = () => {
        setOpen((prev) => {
            if (!prev) {
                setNotifications((n) => n.map((item) => ({ ...item, read: true})));
            }

            return !prev;
        });
    };

    const dismiss = (id: string) => {
        const dismissed = JSON.parse(localStorage.getItem("dismissedNotifications") || "[]");
        dismissed.push(id);
        localStorage.setItem("dismissedNotifications", JSON.stringify(dismissed));
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <div className="bell-wrapper" ref={dropdownRef} data-testid="notifications-bell">

        {/* Bell button */}
        <button
            className="bell-button"
            onClick={handleBellClick}
            aria-label="Open notifications"
            data-testid="bell-button"
        >
            🔔
            {unreadCount > 0 && (
            <span className="bell-badge" data-testid="bell-badge">
                {unreadCount}
            </span>
            )}
        </button>

        {/* Dropdown */}
        {open && (
            <div className="bell-dropdown" data-testid="bell-dropdown">
            <div className="bell-dropdown-header">
                <span className="bell-dropdown-title">Notifications</span>
                <button
                className="bell-close-btn"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                data-testid="bell-close"
                >
                ✕
                </button>
            </div>

            <div className="bell-dropdown-body">
                {loading ? (
                <div className="bell-state" data-testid="bell-loading">
                    Loading…
                </div>
                ) : notifications.length === 0 ? (
                <div className="bell-state" data-testid="bell-empty">
                    You're all caught up!
                </div>
                ) : (
                <ul className="bell-list" data-testid="bell-list">
                    {notifications.map((n) => (
                    <li
                        key={n.id}
                        className={`bell-item bell-item--${n.severity}`}
                        data-testid="bell-notification-item"
                    >
                        <div className="bell-item-icon">
                        {n.severity === "warning" ? "⚠️" : n.severity === "success" ? "✅" : "ℹ️"}
                        </div>

                        <div className="bell-item-body">
                        <div className="bell-item-title">{n.title}</div>
                        <div className="bell-item-message">{n.message}</div>
                        <div className="bell-item-timestamp" data-testid="bell-item-timestamp">
                            {formatTimestamp(n.timestamp)}
                        </div>
                        </div>

                        <button
                        className="bell-item-dismiss"
                        onClick={() => dismiss(n.id)}
                        aria-label="Dismiss"
                        data-testid="bell-item-dismiss"
                        >
                        ✕
                        </button>
                    </li>
                    ))}
                </ul>
                )}
            </div>
            </div>
        )}
        </div>
    );
}
