import GuestPage from "./pages/GuestPage.js";
import LoginPage from "./pages/LoginPage.js";
import RegisterPage from "./pages/RegisterPage.js";
import ChatPage from "./pages/ChatPage.js";

//definierar vilka komponenter som visas på olika adresser
const routerConfig = [
  {
    path: "/",
    element: <GuestPage  />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
{
  path: "/chat",
  element: <ChatPage />,
},
];

export { routerConfig };