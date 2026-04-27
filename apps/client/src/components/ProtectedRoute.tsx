import { Navigate } from "react-router-dom";
import { getRole, getToken } from "../utils/auth";
import type { ReactElement } from "react";

type ProtectedRouteProps = { 
    component: ReactElement;
    allowedRole: string | string[];
};

export default function ProtectedRoute({
    component,
    allowedRole,
}: ProtectedRouteProps) { 
    const token = getToken();
    const role = getRole(); 

    if (!token) { 
        return <Navigate to="/" replace />
    }

    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (!roles.includes(role as string)) {
        return <Navigate to="/" replace />
    }

    return component;
}