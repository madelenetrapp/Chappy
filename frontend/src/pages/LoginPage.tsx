import React, { useState } from "react";
import { login } from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";


//visa inloggningssidan
function LoginPage() {

  //Spararanvändarnamnet som användaren skriver.
  const [username, setUsername] = useState<string>("");

  //Sparar lösenordet som användaren skriver.
  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  //Hanterar formulärets submit (skickar in)
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const { token } = await login(username, password);
      // Sparar JWT-token under webbläsarsessionen.
      sessionStorage.setItem("token", token);
      // Skickar användaren till chatten.
      navigate("/chat");
    } catch {
      // Visar ett felmeddelande om inloggningen misslyckas.
      setError("Fel användarnamn eller lösenord");
    }
  };


  //kör funktionen när formuläret skickas.
  //e.preventDefault() förhindrar att webbsidan laddas om
  return (
    <div className="login-page">

      {/* Sidhuvud med Chappylogga*/}
      <header className="login-header">
        {/*TODO:  logga */}
      </header>

      {/* Centrerar formuläret på sidan */}
      <main className="login-main">
        <form className="login-card" onSubmit={handleSubmit}>
          <h1>Logga in</h1>

          <p className="login-description">
            Välkommen till din arbetsyta
          </p>

          {/* Visar felmeddelande vid misslyckad inloggning */}
          {error && <p className="login-error" role="alert">{error}</p>}

          {/* Användarnamn */}
          <label htmlFor="username">Användarnamn</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          {/* Lösenord */}
          <label htmlFor="password">Lösenord</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {/* Skikcar formuläret och anropar handleSubmit */}
          <button className="login-button" type="submit">
            Logga in
          </button>

          {/* Navigerar till registreringssidan */}
          <Link className="register-link" to="/register">
            Registrera nytt konto
          </Link>
        </form>
      </main>

      {/* Sidfot */}
      <footer className="login-footer">
        Chappy - kommunikation som för oss samman
      </footer>

    </div >
  );
}

export default LoginPage