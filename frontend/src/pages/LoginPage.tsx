import React, { useState } from "react";
import { login } from "../api/authApi";
import { useNavigate } from "react-router-dom";


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
    <form onSubmit={handleSubmit}>
      <h1>Logga in</h1>

      {error && <p role="alert">{error}</p>}

      <input
        type="text"
        placeholder="Användarnamn"
        value={username}                                                   // visar värdet
        autoComplete="username"
        onChange={(e) => setUsername(e.target.value)}                      //e= event, onChange uppdaterar värdet (som skrivs in i inputfältet)
      />

      <input
        type="password"
        placeholder="Lösenord"
        value={password}                                                     // visar värdet
        autoComplete="current-password"
        onChange={(e) => setPassword(e.target.value)}                        //e= event, onChange uppdaterar värdet (som skivs in i inputfältet)
      />

      <button type="submit"> Logga in </button>

    </form>
  );
}

export default LoginPage