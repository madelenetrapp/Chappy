import App from "./App.js";

//definierar vilka komponenter som visas på olika adresser
const routerConfig = [
  {
    path: "/",
    element: <App />,
  },
];

export { routerConfig };