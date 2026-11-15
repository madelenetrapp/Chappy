
import "./LoginPage.css"
import { useState } from "react";
import { useNavigate } from "react-router";
import { login, register } from "../api/authApi";

function RegisterPage() {

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  async function handleRegister(): Promise<void> {
    setError("");

    try {

      await register(username, password);

      const { token, userId } = await login(username, password);

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("userId", userId);

      navigate("/chat");

    } catch {
      setError("Registreringen misslyckades. Försök igen");
    }
  }

  return (
    <div className="login-page">
      <header className="login-header"></header>

      <main className="login-main">

        <form className="login-card"
          onSubmit={(e) => {

            e.preventDefault();

            void handleRegister();
          }}
        >
          <h1>Registrera konto</h1>

          <input
            type="text"
            placeholder="Användarnamn"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p role="alert">{error}</p>}

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
