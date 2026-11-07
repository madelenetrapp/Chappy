import { Navigate, Outlet } from "react-router-dom";

// Kontrollerar om användaren har en sparad token.
function ProtectedRoute() {
  const token = sessionStorage.getItem("token");

  //Skickar användaren till inloggning om token saknas.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  //Visar den skyddande sidan.
  return <Outlet />;
}

export default ProtectedRoute;