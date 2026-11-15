
import React, { useState } from "react";
import { login } from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";


function LoginPage() {

  const [username, setUsername] = useState<string>("");

  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const { token, userId } = await login(username, password);
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      navigate("/chat");
    } catch {
      setError("Fel användarnamn eller lösenord");
    }
  };


  return (
    <div className="login-page">

      <header className="login-header">
      </header>

      <main className="login-main">
        <form className="login-card" onSubmit={handleSubmit}>
          <h1>Logga in</h1>

          <p className="login-description">
            Välkommen till din arbetsyta
          </p>

          {error && <p className="login-error" role="alert">{error}</p>}

          <label htmlFor="username">Användarnamn</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="password">Lösenord</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button className="login-button" type="submit">
            Logga in
          </button>

          <button
            className="login-button guest-button"
            type="button"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              navigate("/chat");
            }}
          >
            Fortsätt som gäst
          </button>

          <Link className="register-link" to="/register">
            Registrera nytt konto
          </Link>
        </form>
      </main>

      <footer className="login-footer">
        Chappy - kommunikation som för oss samman
      </footer>

    </div >
  );
}

export default LoginPage
