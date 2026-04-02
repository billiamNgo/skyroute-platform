import { Navigate } from "react-router-dom";
import { getRole, getToken } from "../utils/auth";
import type { ReactElement } from "react";

type ProtectedRouteProps = { 
    component: ReactElement;
    allowedRole: "admin" | "pharmacist" | "technician";
};

export default function ProtectedRoute({
    component,
    allowedRole,
}: ProtectedRouteProps) { 
    const token = getToken();
    const role = getRole(); 

    if (!token || role !== allowedRole) { 
        return <Navigate to="/" replace />
    }

    return component;
}