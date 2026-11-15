
import "../App.css";
import { useEffect, useRef, useState } from "react";
import type { ChatListItem } from "../api/chatsApi.js";
import type { Channel } from "../api/channelsApi.js";
import type { User } from "../api/usersApi.js";
import ChatSidebar from "./ChatSidebar.js";
import { getHealth } from "../api/healthApi.js";
import { getMessages, sendMessage } from "../api/messagesApi.js";
import { createDM, getChats } from "../api/chatsApi.js";
import type { ChatMessage } from "../schemas/chatMessageSchema.js";
import { getUsers } from "../api/usersApi.js";
import ChatSettings from "./ChatSettings.js";
import { getChannels } from "../api/channelsApi.js";
import ChatWindow from "./ChatWindow.js";
import { translateMessage } from "../api/translationApi.js";
import ChatHeader from "./ChatHeader.js";
import MobileOverlay from "./MobileOverlay.js";

type MobileOverlay = "chats" | "contacts" | "settings" | null;

function App() {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [chatId, setChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [recipient, setRecipient] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<User[]>([]);

  const [showChats, setShowChats] = useState<boolean>(true);
  const [showContacts, setShowContacts] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(true);

  const [selectedLanguage, setSelectedLanguage] =
    useState<string>("Svenska");

  const [selectedContact, setSelectedContact] =
    useState<string | null>(null);

  const messageRef = useRef<HTMLDivElement>(null);

  const [mobileOverlay, setMobileOverlay] =
    useState<MobileOverlay>(null);

  function toggleMobileOverlay(
    overlay: Exclude<MobileOverlay, null>
  ): void {
    setMobileOverlay((current) =>
      current === overlay ? null : overlay
    );
  }

  function handleLogout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    window.location.href = "/login";
  }

  async function handleCreateDM(): Promise<void> {
    console.log("Token finns:", Boolean(token));
    console.log("Mottagare:", recipient);

    if (!token || !recipient.trim()) return;

    try {
      const chat = await createDM(recipient, token);

      setChatId(chat.chatId);

      const updatedChats = await getChats(token);
      setChats(updatedChats);

      setMessages([]);

      console.log("DM öppnad", chat.chatId);
    } catch (error) {
      console.error("Kunde inte öppna DM:", error);
    }
  }

  async function handleSend(text: string): Promise<void> {
    if (!chatId) return;

    try {
      const newMessage = await sendMessage(chatId, text, token);

      setMessages((previousMessages) => [
        ...previousMessages,
        newMessage,
      ]);
    } catch (error) {
      console.error("Kunde inte skicka meddelandet:", error);
    }
  }

  async function loadMessages(): Promise<void> {
    if (!chatId) return;

    try {
      const savedMessages = await getMessages(chatId, token);

      setMessages(savedMessages);
    } catch (error) {
      console.error("Kunde inte hämta meddelanden:", error);
    }
  }

  async function checkBackend(): Promise<void> {
    try {
      const data = await getHealth();
      console.log("Backend", data);
    } catch (error) {
      console.error("Kunde inte ansluta till backend:", error);
    }
  }

  useEffect(() => {
    checkBackend();
  }, []);

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

  useEffect(() => {
    loadMessages();
  }, [chatId]);

  useEffect(() => {
    let isActive = true;

    messages.forEach((message) => {
      if (message.senderId === currentUserId) return;

      if (!message.text.trim()) return;

      if (translations[message.id]) return;

      async function translate(): Promise<void> {
        try {
          const result = await translateMessage(
            message.text,
            selectedLanguage,
          );

          if (!isActive) return;

          setTranslations((previous) => ({
            ...previous,
            [message.id]: result.translatedText,
          }));
        } catch (error) {
          console.error("Kunde inte översätta meddelandet;", error)
        }
      }

      translate();
    });

    return () => {
      isActive = false;
    };
  }, [messages, selectedLanguage, currentUserId]);

  useEffect(() => {
    if (!messageRef.current) return;

    messageRef.current.scrollTop =
      messageRef.current.scrollHeight;
  }, [messages]);

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

  return (
    <div className="chat-layout">
      <ChatHeader
        mobileOverlay={mobileOverlay}
        toggleMobileOverlay={toggleMobileOverlay}
        handleLogout={handleLogout}
      />

      <MobileOverlay
        mobileOverlay={mobileOverlay}
        setMobileOverlay={setMobileOverlay}
        chats={chats}
        users={users}
        chatId={chatId}
        currentUserId={currentUserId}
        setChatId={setChatId}
        clearMessages={() => setMessages([])}
        selectedContact={selectedContact}
        setSelectedContact={setSelectedContact}
        recipient={recipient}
        setRecipient={setRecipient}
        handleCreateDM={handleCreateDM}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        setTranslations={setTranslations}
      />

      <div className="chat-main">
        <ChatSidebar
          channels={channels}
          chats={chats}
          users={users}
          chatId={chatId}
          currentUserId={currentUserId}
          setChatId={setChatId}
          clearMessages={() => setMessages([])}
          showChats={showChats}
          setShowChats={setShowChats}
          showContacts={showContacts}
          setShowContacts={setShowContacts}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          recipient={recipient}
          setRecipient={setRecipient}
          handleCreateDM={handleCreateDM}
        />

        <ChatWindow
          messageRef={messageRef}
          messages={messages}
          currentUserId={currentUserId}
          translations={translations}
          handleSend={handleSend}
        />

        <ChatSettings
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          setTranslations={setTranslations}
        />
      </div>
    </div>
  );
}

export default App;
