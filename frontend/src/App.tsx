import "./App.css";
import { useEffect, useRef, useState } from "react";
// API-funktioner
import type { ChatListItem } from "./api/chatsApi.js";
import ContactList from "./components/ContactList.js";
import { getHealth } from "./api/healthApi.js";
import { getMessages, sendMessage } from "./api/messagesApi.js";
import { createDM, getChats } from "./api/chatsApi.js";
import ChatList from "./components/ChatList.js";
// Komponenter
import ChatInput from "./components/ChatInput.js";
import ChatMessageComponent from "./components/ChatMessage.js";
// Typ för chattmeddelanden
import type { ChatMessage } from "./schemas/chatMessageSchema";
import { getUsers } from "./api/usersApi.js";

import { getChannels } from "./api/channelsApi.js";
import ChannelList from "./components/ChannelList.js";
// Importerar funktionen som översätter meddelanden via backend
import { translateMessage } from "./api/translationApi.js";
import LanguageSelector from "./components/LanguageSelector.js";
import ChatHeader from "./components/ChatHeader.js";
import type { Channel } from "./api/channelsApi.js";
// Pilar för att öppna och stänga 
import leftArrow from "./assets/left-arrow.svg";
import rightArrow from "./assets/right-arrow.svg";
import type { User } from "./api/usersApi.js";
import mobileOverlayClose from "./assets/mobile-overlay-close.svg";





// Exempeldata från Figma TODO
// const exampleChats: string[] = [
//   "Skadeärende – Anna Svensson",
//   "Hemförsäkring – Ahmed Hassan",
//   "Bilskada – Maria Nilsson",
//   "Ersättningsfråga – John Smith",
//   "Reseförsäkring – Sofia Andersson",
// ];

// Exempelkontakter från Figma TODO
// const exampleContacts: string[] = [
//   "Anna Lindberg – Skadereglerare",
//   "Erik Johansson – Försäkringsrådgivare",
//   "Sara Ahmed – Kundansvarig",
//   "Johan Bergström – Skadehandläggare",
//   "Emma Karlsson – Teamledare",
// ];

// // Språkval - Figma
// const languages: string[] = [
//   "Svenska",
//   "Engelska",
//   "Arabiska",
//   "Tyska",
//   "Mandarin",
// ];

type MobileOverlay = "chats" | "contacts" | "settings" | null;

function App() {
  // Hämtar JWT och användar-ID från sessionStorage  TODO: använd inte session storage //local
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  // Sparar den valda konversationens ID
  const [chatId, setChatId] = useState<string | null>(null);

  //sparar användarens konversationer från dynamoDB
  const [chats, setChats] = useState<ChatListItem[]>([]);

  // spara kanalerna som hämtas från DynamoDB
  const [channels, setChannels] = useState<Channel[]>([]);

  // Sparar användarnamnet för en ny DM
  const [recipient, setRecipient] = useState<string>("");

  // Sparar meddelandena i den aktuella chatten
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // sparar översatta meddelnaden med emddelande-id som nyckel
  const [translations, setTranslations] = useState<Record<string, string>>({});

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
  // const [selectedChat, setSelectedChat] =
  //   useState<string | null>(null);

  // Sparar markerad kontakt
  const [selectedContact, setSelectedContact] =
    useState<string | null>(null);



  // Referens för automatisk scrollning
  const messageRef = useRef<HTMLDivElement>(null);


  // Styr vilken overlay som visas på mobil och surfplatta
  const [mobileOverlay, setMobileOverlay] =
    useState<MobileOverlay>(null);

  // Öppnar eller stänger en mobiloverlay
  function toggleMobileOverlay(
    overlay: Exclude<MobileOverlay, null>
  ): void {
    setMobileOverlay((current) =>
      current === overlay ? null : overlay
    );
  }

  // Loggar ut användaren
  function handleLogout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    window.location.href = "/login";
  }

  // Skapar eller öppnar en DM med angiven användare
  async function handleCreateDM(): Promise<void> {
    console.log("Token finns:", Boolean(token));
    console.log("Mottagare:", recipient);
    // Avbryter om JWT eller användarnamn saknas
    if (!token || !recipient.trim()) return;

    try {
      // Skapar eller hämtar konversationen från backend
      const chat = await createDM(recipient, token);

      // Sparar konversationens ID
      setChatId(chat.chatId);

      // uppdaaterar listan med konversationer
      const updatedChats = await getChats(token);
      setChats(updatedChats);

      //Tömmer tidigare meddelanden
      setMessages([]);


      console.log("DM öppnad", chat.chatId);
    } catch (error) {
      console.error("Kunde inte öppna DM:", error);
    }
  }

  // Skickar ett meddelande till den aktuella chatten
  async function handleSend(text: string): Promise<void> {
    // Avbryter om JWT eller vald chatt saknas
    if (!chatId) return;

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
    if (!chatId) return;

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
    checkBackend();
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

    loadUsers();
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

    loadChats();
  }, [token]);

  // Hämtar meddelanden när användaren byter chatt
  useEffect(() => {
    loadMessages();
  }, [chatId]);

  // Hanterar översättning när meddelanden eller språkval ändras
  useEffect(() => {

    // Visar om denna översättning fortfarande är aktuell
    let isActive = true;

    // Går igenom alla meddelanden
    messages.forEach((message) => {
      // Hoppar över egna meddelanden
      if (message.senderId === currentUserId) return;

      // hoppar över meddelnaden som saknar text
      if (!message.text.trim()) return;

      // Hoppar över meddelanden som redan översatts
      if (translations[message.id]) return;

      // Skickar meddelandet till backend för översättning
      async function translate(): Promise<void> {

        try {
          // hämtar översättningen från backend 
          const result = await translateMessage(
            message.text,
            selectedLanguage,
          );

          // Avbryter om översättningen inte längre är aktuell
          if (!isActive) return;

          // Sparar översättningen med meddelandets ID som nyckel
          setTranslations((previous) => ({
            ...previous,
            [message.id]: result.translatedText,
          }));
        } catch (error) {
          // hanterar fel om översättningen misslyckades
          console.error("Kunde inte översätta meddelandet;", error)
        }
      }

      // startar översättningen
      translate();
    });

    // markerar tidigare översättningar som inaktuella när meddelnadene eller språkval ändras
    return () => {
      isActive = false;
    };

  }, [messages, selectedLanguage, currentUserId]);
  // Scrollar längst ner när meddelandelistan uppdateras
  useEffect(() => {
    if (!messageRef.current) return;

    messageRef.current.scrollTop =
      messageRef.current.scrollHeight;
  }, [messages]);

  // hämtar alla kanaler när sidan öppnas
  useEffect(() => {
    async function loadChannels(): Promise<void> {
      try {
        const data = await getChannels();
        setChannels(data);
      } catch (error) {
        console.error("Kunde inte hämta kanaler:", error)
      }
    }

    loadChannels();
  }, []);

  // visar alla kanaler
  // function renderChannels() {
  //   return (
  //     <div className="sidebar-list">
  //       {channels.map((channel) => (
  //         <button
  //           key={channel.chatId}
  //           type="button"
  //           // markerar den valda kanalen med css klass active, aria-pressed visar för hjälpmedel om kanalen är vald
  //           className={`sidbar-item ${chatId === channel.chatId ? "activ" : ""}`}
  //           aria-pressed={chatId === channel.chatId}
  //           onClick={() => {
  //             setChatId(channel.chatId);
  //             setMessages([]);
  //           }}
  //         >
  //           {/* reacts egna ikoner */}
  //           {channel.locked && <Lock size={14} className="channel-lock" />}
  //           {channel.name}
  //         </button>
  //       ))}
  //     </div>
  //   )
  // }


  // // Visar användarens sparade konversationer
  // function renderChats() {
  //   return (
  //     <div className="sidebar-list">
  //       {chats.map((chat) => (
  //         <button
  //           key={chat.chatId}
  //           type="button"
  //           className={`sidebar-item ${chatId === chat.chatId ? "active" : ""
  //             }`}
  //           aria-pressed={chatId === chat.chatId}
  //           onClick={() => {
  //             setChatId(chat.chatId);
  //             setMessages([]);
  //           }}
  //         >
  //           {users.find((user) =>
  //             user.userId !== currentUserId &&
  //             chat.chatId.includes(user.userId)
  //           )?.username ?? chat.chatId}
  //         </button>
  //       ))}
  //     </div>
  //   );
  // }


  // // Återanvändbar kontaktlista med DM-funktion
  // function renderContacts() {
  //   return (
  //     <div className="sidebar-list contacts-container">
  //       <div className="contacts-scroll">
  //         {users.map((user) => (
  //           <button
  //             key={user.userId}
  //             type="button"
  //             className={`sidebar-item contact-item ${selectedContact === user.username ? "active" : ""
  //               }`}
  //             aria-pressed={selectedContact === user.username}
  //             onClick={() => {
  //               // Markerar kontakten och fyller i användarnamnet
  //               setSelectedContact(user.username);
  //               setRecipient(user.username);
  //             }}
  //           >
  //             {/* Kontaktikon */}
  //             <img
  //               src={contactIcon}
  //               className="contact-icon"
  //               alt=""
  //               aria-hidden="true"
  //             />

  //             <span className="contact-name">
  //               {user.username}
  //             </span>

  //           </button>
  //         ))}
  //       </div>

  {/* funktion för att starta DM */ }
  //       <input
  //         type="text"
  //         value={recipient}
  //         onChange={(e) => setRecipient(e.target.value)}
  //         placeholder="Användarnamn"
  //         aria-label="Användarnamn"
  //       />

  //       <button
  //         type="button"
  //         onClick={() => handleCreateDM()}
  //       >
  //         Starta DM
  //       </button>
  //     </div>
  //   );
  // }

  //  språkval med radioknappar
  // function renderLanguages(groupName: string) {
  //   return (
  //     <div className="language-list">
  //       {languages.map((language) => (
  //         <label
  //           className="language-option"
  //           key={language}
  //         >
  //           {/* Radioknapp för valt språk */}
  //           <input
  //             type="radio"
  //             name={groupName}
  //             value={language}
  //             checked={selectedLanguage === language}
  //             onChange={() => {
  //               // Uppdaterar användarens valda språk
  //               setSelectedLanguage(language);

  //               // Tömmer gamla översättningar
  //               setTranslations({});
  //             }}
  //           />

  //           <span>{language}</span>
  //         </label>
  //       ))}
  //     </div>
  //   );
  // }

  // Renderar chattsidan
  return (
    <div className="chat-layout">

      <ChatHeader
        mobileOverlay={mobileOverlay}
        toggleMobileOverlay={toggleMobileOverlay}
        handleLogout={handleLogout}
      />

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
                <ChatList
                  chats={chats}
                  users={users}
                  chatId={chatId}
                  currentUserId={currentUserId}
                  setChatId={setChatId}
                  clearMessages={() => setMessages([])}
                />
              </section>
            )}

            {/* Kontakter */}
            {mobileOverlay === "contacts" && (
              <section className="sidebar-section">
                <h2>Kontakter</h2>
                <ContactList
                  users={users}
                  selectedContact={selectedContact}
                  setSelectedContact={setSelectedContact}
                  recipient={recipient}
                  setRecipient={setRecipient}
                  handleCreateDM={handleCreateDM}
                />
              </section>
            )}

            {/* Språkinställningar */}
            {mobileOverlay === "settings" && (
              <section className="settings-section">
                <h2>Språkinställningar</h2>
                <LanguageSelector
                  groupName="mobile-language"
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                  setTranslations={setTranslations}
                />
              </section>
            )}
          </div>
        </div>
      )}

      {/* layout */}
      <div className="chat-main">

        {/* vänster sidopanel */}
        <aside className="chat-sidebar">

          <section className="sidebar-section">
            <h2>Kanaler</h2>
            <ChannelList
              channels={channels}
              chatId={chatId}
              setChatId={setChatId}
              setMessages={() => setMessages([])}
            />
          </section>

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
                <ChatList
                  chats={chats}
                  users={users}
                  chatId={chatId}
                  currentUserId={currentUserId}
                  setChatId={setChatId}
                  clearMessages={() => setMessages([])}
                />
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
                <ContactList
                  users={users}
                  selectedContact={selectedContact}
                  setSelectedContact={setSelectedContact}
                  recipient={recipient}
                  setRecipient={setRecipient}
                  handleCreateDM={handleCreateDM}
                />
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
                currentUserId={currentUserId ?? ""}
                translatedText={translations[message.id]}
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
                <LanguageSelector
                  groupName="desktop-language"
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                  setTranslations={setTranslations}
                />
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default App;
