import App from "../components/ChatLayout.js";
import { Link } from "react-router";

function GuestPage() {

  return (
    <div>
      <nav>
        <Link to="/login">Logga in</Link>
        <Link to="/register">Registrera konto</Link>
      </nav>
      <App />
    </div>
  )
}

export default GuestPage;
