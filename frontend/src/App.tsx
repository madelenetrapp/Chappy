import "./App.css";
import { useEffect, useRef, useState } from "react";
// API-funktioner
import { getHealth } from "./api/healthApi.js";
import { getMessages, sendMessage } from "./api/messagesApi.js";
import { createDM, getChats } from "./api/chatsApi.js";
import type { ChatListItem } from "./api/chatsApi.js";
// Komponenter
import ChatInput from "./components/ChatInput.js";
import ChatMessageComponent from "./components/ChatMessage.js";
// Typ för chattmeddelanden
import type { ChatMessage } from "./schemas/chatMessageSchema";
import { getUsers } from "./api/usersApi.js";
import type { User } from "./api/usersApi.js";
// Pilar för att öppna och stänga 
import leftArrow from "./assets/left-arrow.svg";
import rightArrow from "./assets/right-arrow.svg";
import contactIcon from "./assets/contact-icon.svg";
import mobileOverlayClose from "./assets/mobile-overlay-close.svg";

// Typ för panelerna på mobil och surfplatta
type MobileOverlay = "chats" | "contacts" | "settings" | null;

// Exempeldata från Figma TODO
const exampleChats: string[] = [
  "Skadeärende – Anna Svensson",
  "Hemförsäkring – Ahmed Hassan",
  "Bilskada – Maria Nilsson",
  "Ersättningsfråga – John Smith",
  "Reseförsäkring – Sofia Andersson",
];

// Exempelkontakter från Figma TODO
// const exampleContacts: string[] = [
//   "Anna Lindberg – Skadereglerare",
//   "Erik Johansson – Försäkringsrådgivare",
//   "Sara Ahmed – Kundansvarig",
//   "Johan Bergström – Skadehandläggare",
//   "Emma Karlsson – Teamledare",
// ];

// Språkval - Figma
const languages: string[] = [
  "Svenska",
  "Engelska",
  "Arabiska",
  "Tyska",
  "Mandarin",
];

function App() {
  // Hämtar JWT och användar-ID från sessionStorage  TODO: använd inte session storage //local
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  // Sparar den valda konversationens ID
  const [chatId, setChatId] = useState<string | null>(null);

  //sparar användarens konversationer från dynamoDB
  const [chats, setChats] = useState<ChatListItem[]>([]);

  // Sparar användarnamnet för en ny DM
  const [recipient, setRecipient] = useState<string>("");

  // Sparar meddelandena i den aktuella chatten
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  //sparar registrerade användare från dynamoDB
  const [users, setUsers] = useState<User[]>([]);

  // Styr vilka sektioner som visas på desktop
  const [showChats, setShowChats] = useState<boolean>(true);
  const [showContacts, setShowContacts] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(true);

  // Sparar det valda språket
  const [selectedLanguage, setSelectedLanguage] =
    useState<string>("Svenska");

  // Sparar markerad exempelchatt
  const [selectedChat, setSelectedChat] =
    useState<string | null>(null);

  // Sparar markerad kontakt
  const [selectedContact, setSelectedContact] =
    useState<string | null>(null);

  // Styr vilken overlay som visas på mobil och surfplatta
  const [mobileOverlay, setMobileOverlay] =
    useState<MobileOverlay>(null);

  // Referens för automatisk scrollning
  const messageRef = useRef<HTMLDivElement>(null);

  // Öppnar eller stänger en mobiloverlay
  function toggleMobileOverlay(
    overlay: Exclude<MobileOverlay, null>
  ): void {
    setMobileOverlay((current) =>
      current === overlay ? null : overlay
    );
  }

  //loggar ut användaren
  function handleLogout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    //laddar om appen utan inloggning
    window.location.reload();
  }

  // Skapar eller öppnar en DM med angiven användare
  async function handleCreateDM(): Promise<void> {
    // Avbryter om JWT eller användarnamn saknas
    if (!token || !recipient.trim()) return;

    try {
      // Skapar eller hämtar konversationen från backend
      const chat = await createDM(recipient, token);

      // Sparar konversationens ID
      setChatId(chat.chatId);

      // Tömmer tidigare meddelanden när chatt med ny person startas
      setMessages([]);


      console.log("DM öppnad", chat.chatId);
    } catch (error) {
      console.error("Kunde inte öppna DM:", error);
    }
  }

  // Skickar ett meddelande till den aktuella chatten
  async function handleSend(text: string): Promise<void> {
    // Avbryter om JWT eller vald chatt saknas
    if (!token || !chatId) return;

    try {
      // Skickar meddelandet till backend
      const newMessage = await sendMessage(chatId, text, token);

      // Lägger till meddelandet i listan
      setMessages((previousMessages) => [
        ...previousMessages,
        newMessage,
      ]);
    } catch (error) {
      console.error("Kunde inte skicka meddelandet:", error);
    }
  }

  // Hämtar meddelanden för den aktuella chatten
  async function loadMessages(): Promise<void> {
    // Avbryter om JWT eller chatt-ID saknas
    if (!token || !chatId) return;

    try {
      // Hämtar sparade meddelanden från backend
      const savedMessages = await getMessages(chatId, token);

      // Uppdaterar meddelandelistan
      setMessages(savedMessages);
    } catch (error) {
      console.error("Kunde inte hämta meddelanden:", error);
    }
  }

  // Kontrollerar att backend svarar
  async function checkBackend(): Promise<void> {
    try {
      const data = await getHealth();
      console.log("Backend", data);
    } catch (error) {
      console.error("Kunde inte ansluta till backend:", error);
    }
  }

  // Kontrollerar backend när komponenten monteras
  useEffect(() => {
    void checkBackend();
  }, []);

  //hämtar registrerade användare när sidan öppnas
  useEffect(() => {
    async function loadUsers(): Promise<void> {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Kunde inte hämta användare:", error);
      }
    }

    void loadUsers();
  }, []);
  //när app öppnas anropas getUsers(), backend hämtar användarna från backend, setUsers(data) sparar användarna i react state

  //hämtar den inloggade användarens sparade konversationer
  useEffect(() => {
    if (!token) return;

    async function loadChats(): Promise<void> {
      try {
        const data = await getChats(token!);
        setChats(data);
      } catch (error) {
        console.error("Kunde inte hämta chattar:", error);
      }
    }

    void loadChats();
  }, [token]);

  // Hämtar meddelanden när användaren byter chatt
  useEffect(() => {
    void loadMessages();
  }, [chatId]);

  // Scrollar längst ner när meddelandelistan uppdateras
  useEffect(() => {
    if (!messageRef.current) return;

    messageRef.current.scrollTop =
      messageRef.current.scrollHeight;
  }, [messages]);

 
  // Visar användarens sparade konversationer
  function renderChats() {
    return (
      <div className="sidebar-list">
        {chats.map((chat) => (
          <button
            key={chat.chatId}
            type="button"
            className={`sidebar-item ${
              chatId === chat.chatId ? "active" : ""
            }`}
            aria-pressed={chatId === chat.chatId}
            onClick={() => {
              setChatId(chat.chatId);
              setMessages([]);
            }}
          >
            {chat.chatId}
          </button>
        ))}
      </div>
    );
  }


  // Återanvändbar kontaktlista med DM-funktion
  function renderContacts() {
    return (
      <div className="sidebar-list contacts-container">
        <div className="contacts-scroll">
        {users.map((user) => (
          <button
            key={user.userId}
            type="button"
            className={`sidebar-item contact-item ${selectedContact === user.username ? "active" : ""
              }`}
            aria-pressed={selectedContact === user.username}
            onClick={() => {
              // Markerar kontakten och fyller i användarnamnet
              setSelectedContact(user.username);
              setRecipient(user.username);
            }}
          >
            {/* Kontaktikon */}
            <img
              src={contactIcon}
              className="contact-icon"
              alt=""
              aria-hidden="true"
            />

            <span className="contact-name">
              {user.username}
            </span>

          </button>
        ))}
        </div>

        {/* funktion för att starta DM */}
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Användarnamn"
          aria-label="Användarnamn"
        />

        <button
          type="button"
          onClick={() => void handleCreateDM()}
        >
          Starta DM
        </button>
      </div>
    );
  }

  //  språkval med radioknappar
  function renderLanguages(groupName: string) {
    return (
      <div className="language-list">
        {languages.map((language) => (
          <label
            className="language-option"
            key={language}
          >
            {/* Radioknapp för valt språk */}
            <input
              type="radio"
              name={groupName}
              value={language}
              checked={selectedLanguage === language}
              onChange={() =>
                setSelectedLanguage(language)
              }
            />

            <span>{language}</span>
          </label>
        ))}
      </div>
    );
  }

  // Renderar chattsidan
  return (
    <div className="chat-layout">

      {/* header */}
      <header className="chat-header">
        

        {/* Tre knappar för mobil och tablett */}
        <nav
          className="mobile-nav"
          aria-label="Chattmeny"
        >
          <button
            type="button"
            className={
              mobileOverlay === "chats" ? "active" : ""
            }
            onClick={() =>
              toggleMobileOverlay("chats")
            }
            aria-expanded={mobileOverlay === "chats"}
            aria-controls="mobile-overlay-panel"
          >Chattar
          </button>

          <button
            type="button"
            className={
              mobileOverlay === "contacts" ? "active" : ""
            }
            onClick={() =>
              toggleMobileOverlay("contacts")
            }
            aria-expanded={mobileOverlay === "contacts"}
            aria-controls="mobile-overlay-panel"
          >Kontakter
          </button>

          <button
            type="button"
            className={
              mobileOverlay === "settings" ? "active" : ""
            }
            onClick={() =>
              toggleMobileOverlay("settings")
            }
            aria-expanded={mobileOverlay === "settings"}
            aria-controls="mobile-overlay-panel"
          >
            Språk
          </button>
        </nav>
<h1>Chappy</h1>
        
        <button
        type="button"
        onClick={handleLogout}
        >
          Logga ut
        </button>

      </header>

      {/* mobil-tablet layout */}
      {mobileOverlay && (
        <div className="mobile-overlay">

          {/* Stänger overlayen */}
          <button
            type="button"
            className="mobile-overlay-close"
            onClick={() => setMobileOverlay(null)}
            aria-label="Stäng panel"
          >
            <img
              src={mobileOverlayClose}
              alt=""
              aria-hidden="true"
            />
          </button>

          {/* Vit container - Figma */}
          <div
            id="mobile-overlay-panel"
            className="mobile-overlay-card"
          >

            {/* Tillgängliga chattar */}
            {mobileOverlay === "chats" && (
              <section className="sidebar-section">
                <h2>Tillgängliga chattar</h2>
                {renderChats()}
              </section>
            )}

            {/* Kontakter */}
            {mobileOverlay === "contacts" && (
              <section className="sidebar-section">
                <h2>Kontakter</h2>
                {renderContacts()}
              </section>
            )}

            {/* Språkinställningar */}
            {mobileOverlay === "settings" && (
              <section className="settings-section">
                <h2>Språkinställningar</h2>
                {renderLanguages("mobile-language")}
              </section>
            )}
          </div>
        </div>
      )}

      {/* layout */}
      <div className="chat-main">

        {/* vänster sidopanel */}
        <aside className="chat-sidebar">

          {/* Tillgängliga chatar */}
          <section className="sidebar-section">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() =>
                setShowChats(!showChats)
              }
              aria-expanded={showChats}
              aria-controls="available-chats"
            >
              <span>Tillgängliga chattar</span>

              <img
                className="sidebar-arrow"
                src={
                  showChats ? leftArrow : rightArrow
                }
                alt=""
              />
            </button>

            {/* Visar chattlistan */}
            {showChats && (
              <div id="available-chats">
                {renderChats()}
              </div>
            )}
          </section>

          {/* Kontakter */}
          <section className="sidebar-section">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() =>
                setShowContacts(!showContacts)
              }
              aria-expanded={showContacts}
              aria-controls="contacts"
            >
              <span>Kontakter</span>

              <img
                className="sidebar-arrow"
                src={
                  showContacts ? leftArrow : rightArrow
                }
                alt=""
              />
            </button>

            {/* Visar kontaktlistan */}
            {showContacts && (
              <div id="contacts">
                {renderContacts()}
              </div>
            )}
          </section>
        </aside>

        {/* chatt */}
        <main className="chat-content">

          {/* Meddelandeområdet */}
          <div
            className="chat-messages"
            ref={messageRef}
          >
            {/* Renderar varje meddelande */}
            {messages.map((message) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                currentUserId={
                  currentUserId ?? ""
                }
              />
            ))}
          </div>

          {/* skrivfältet längst ner */}
          <div className="chat-input-area">
            <ChatInput onSend={handleSend} />
          </div>
        </main>

        {/* höger panell */}
        <aside className="chat-settings">

          {/* Ljusblå container för språkval */}
          <section className="settings-section">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() =>
                setShowSettings(!showSettings)
              }
              aria-expanded={showSettings}
              aria-controls="language-settings"
            >
              <span>Språkinställningar</span>

              <img
                className="sidebar-arrow"
                src={
                  showSettings ? leftArrow : rightArrow
                }
                alt=""
                aria-hidden="true"
              />
            </button>

            {/* visar språkvaln */}
            {showSettings && (
              <div id="language-settings">
                {renderLanguages("desktop-language")}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default App;
