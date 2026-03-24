import { Navigate } from "react-router-dom";
import { getCurrentUser, handleSessionExpiry } from "../services/AuthService";

const PrivateRoute = ({ children }) => {
  const user = getCurrentUser();

  if (!user) {
    handleSessionExpiry(); // cleanup only
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
