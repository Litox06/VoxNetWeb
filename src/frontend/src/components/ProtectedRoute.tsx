import React from "react";
import { useLocation, Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  component: React.ComponentType;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  return token ? (
    <Component />
  ) : (
    <Navigate to="/login" state={{ from: location }} />
  );
};

export default ProtectedRoute;
