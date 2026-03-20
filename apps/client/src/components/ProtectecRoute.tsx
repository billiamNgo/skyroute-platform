import { Navigate } from "react-router-dom";
import { getRole, getToken } from "../utils/auth";

type ProtectedRouteProps = { 
    component: JSX.Element;
    allowedRole: "admin" | "pharmacist" | "technician";
};

export default function ProtectedRoute({
    component,
    allowedRole,
}: ProtectedRouteProps) { 
    const token = getToken();
    const role = getRole(); 

    if (!token || role !== allowedRole) { 
        return <Navigate to="/login" replace />
    }

    return component;
}