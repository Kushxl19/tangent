import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("userInfo"));

  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;