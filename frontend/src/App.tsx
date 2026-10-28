import { useEffect } from "react";
import { getHealth } from "./api/healthApi.js";
// import { error } from "node:console";

//useEffect låter koden köras när komponenten monteras

function App() {
  useEffect(() => {
    getHealth()
      .then((data) => console.log("Backend:", data))
      .catch((error) => console.error(error));
  }, []);
  return (
  <div>Chappy</div>
);
  
}
export default App;


//getHealth anropar backend
//.then() skriver ut svaret i console
//.catch() fångar ev. fel
// [] tom beroende lista, gör att useEffect inte körs igen vid vanliga omrenderingar

