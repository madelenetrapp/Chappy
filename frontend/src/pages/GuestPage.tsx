import App from "../App.js";
import { Link } from "react-router";

//visar den befintlga chatten för gäster
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

// Gäster kan välja att logga in eller registrera sig 
// Visar den befintliga öppna chatten
