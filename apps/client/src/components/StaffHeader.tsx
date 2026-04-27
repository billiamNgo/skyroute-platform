import { useNavigate } from "react-router-dom";
import { getRole, logoutUser } from "../utils/auth";
import NotificationsBell from "./NotificationsBell";

type StaffHeaderProps = {
    activeTab: "orders" | "fleet" | "tracking" | "dashboard";
};

export default function StaffHeader({ activeTab }: StaffHeaderProps) {
    const navigate = useNavigate();
    const role = getRole();

    const handleLogout = async () => {
        await logoutUser();
        navigate("/login");
    };

    const dashboardPath = role === "pharmacist" ? "/pharmacist" : "/technician";

    return (
        <div className="orders-topbar">
            <button
                className="orders-tab"
                onClick={() => navigate(dashboardPath)}
            >
                Back
            </button>

            <div className="orders-nav">
                <button 
                    className={`orders-tab ${activeTab === "orders" ? "active-tab" : ""}`}
                    onClick={() => navigate("/orders")}
                >
                    Orders
                </button>
                {role === "technician" && (
                    <button 
                        className={`orders-tab ${activeTab === "fleet" ? "active-tab" : ""}`}
                        onClick={() => navigate("/fleet")}
                    >
                        Drones
                    </button>
                )}
                <button 
                    className={`orders-tab ${activeTab === "tracking" ? "active-tab" : ""}`}
                    onClick={() => navigate("/fleet/track")}
                >
                    Tracking
                </button>
                <NotificationsBell />
            </div>

            <button className="dashboard-danger-button" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}
