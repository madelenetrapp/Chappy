import type { Dispatch, SetStateAction } from "react";
import type { ChatListItem } from "../api/chatsApi.js";
import type { User } from "../api/usersApi.js";

import ChatList from "./ChatList.js";
import ContactList from "./ContactList.js";
import LanguageSelector from "./LanguageSelector.js";
import mobileOverlayClose from "../assets/mobile-overlay-close.svg";




type MobileOverlayProps = {
  mobileOverlay: "chats" | "contacts" | "settings" | null;
  setMobileOverlay: Dispatch<
    SetStateAction<"chats" | "contacts" | "settings" | null>
  >;
  chats: ChatListItem[];
  users: User[];
  chatId: string | null;
  currentUserId: string | null;
  setChatId: Dispatch<SetStateAction<string | null>>;
  clearMessages: () => void;
  selectedContact: string | null;
  setSelectedContact: Dispatch<SetStateAction<string | null>>;
  recipient: string;
  setRecipient: Dispatch<SetStateAction<string>>;
  handleCreateDM: () => Promise<void>;
  selectedLanguage: string;
  setSelectedLanguage: Dispatch<SetStateAction<string>>;
  setTranslations: Dispatch<SetStateAction<Record<string, string>>>;
};

function MobileOverlay({
  mobileOverlay,
  setMobileOverlay,
  chats,
  users,
  chatId,
  currentUserId,
  setChatId,
  clearMessages,
  selectedContact,
  setSelectedContact,
  recipient,
  setRecipient,
  handleCreateDM,
  selectedLanguage,
  setSelectedLanguage,
  setTranslations,
}: MobileOverlayProps) {
  return (

mobileOverlay && (
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
                  clearMessages={clearMessages}
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
       )
  );
}

export default MobileOverlay;