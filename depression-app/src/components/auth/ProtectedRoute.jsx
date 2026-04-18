import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated, isUserAuthenticated } from "../../utils/userSession";

const ProtectedRoute = ({ children, role = "user" }) => {
  const location = useLocation();
  const allowed = role === "admin" ? isAdminAuthenticated() : isUserAuthenticated();

  if (!allowed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
