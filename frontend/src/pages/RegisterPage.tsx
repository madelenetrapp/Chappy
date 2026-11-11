import "./LoginPage.css"
import { useState } from "react"; //Hanterar värden som kan förändras
import { useNavigate } from "react-router";  // används för att navigera mellan sidor
import { login, register } from "../api/authApi";  // API-funktioner för registrering och inloggning

//visar registreringssidan
function RegisterPage() {

  const [username, setUsername] = useState<string>("");   //sparar användarnamnet som skrivs in
  const [password, setPassword] = useState<string>("");    //sparar lösenordet som skrivs in 
  const [error, setError] = useState<string>("");         // sparar ett felmeddelande om registreringen misslyckas
  const navigate = useNavigate();                          // funktion för att navigerea till en annan sida

  async function handleRegister(): Promise<void> {          //hanterar registerringen när användaren skickar formuläret
    setError("");                                           // rensar tidigare felmeddelanden

    try {

      //skickar användarnamn och lösenord till backend för att skapa kontot
      await register(username, password);

      //loggar in användaren automatiskt efter lyckad registrering 
      const { token, userId } = await login(username, password);

      sessionStorage.setItem("token", token);                         //sparar jwt-token för autentisering API-anrop
      sessionStorage.setItem("userId", userId);                        //sparar användarens ID för att identifiera den inloggade användaren 

      //skickar användaren till chattsidan
      navigate("/chat");

    } catch {
      setError("Registreringen misslyckades. Försök igen");             // visar ett felmeddelande om registreringen eller inloggningen misslyckas
    }
  }

  //Renderar registreringssidan innehåll
  return (
    <div className="login-page">
      <header className="login-header"></header>

      <main className="login-main">

        {/* formulär som använder samma stil som inloggningssidan */}
        <form className="login-card"
          onSubmit={(e) => {

            //stoppar sidan från att ladda om
            e.preventDefault();

            //Anropar funktionen som registerar användaren
            void handleRegister();
          }}
        >
          <h1>Registrera konto</h1>

          {/* inputfält för användarnamn */}
          <input
            type="text"
            placeholder="Användarnamn"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {/* inputfält för lösenord */}
          <input
            type="password"
            placeholder="Lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* visar felmeddelandet om error innehåller text */}
          {error && <p role="alert">{error}</p>}

          {/* skickar formulären när användaren klickar */}
          <button type="submit" className="login-button">
            Registrera konto
          </button>
        </form>
      </main >

      <footer className="login-footer">
        Chappy - kommunikation som för oss samman
      </footer>

    </div >
  )
}

export default RegisterPage;