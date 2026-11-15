import ChannelList from "./ChannelList.js";
import ChatList from "./ChatList.js";
import ContactList from "./ContactList.js";
import type { Channel } from "../api/channelsApi.js";
import type { ChatListItem } from "../api/chatsApi.js";
import type { User } from "../api/usersApi.js";
import leftArrow from "../assets/left-arrow.svg";
import rightArrow from "../assets/right-arrow.svg";

type ChatSidebarProps = {
  channels: Channel[];
  chats: ChatListItem[];
  users: User[];
  chatId: string | null;
  currentUserId: string | null;
  setChatId: (id: string) => void;
  clearMessages: () => void;
  showChats: boolean;
  setShowChats: (value: boolean) => void;
  showContacts: boolean;
  setShowContacts: (value: boolean) => void;
  selectedContact: string | null;
  setSelectedContact: (username: string) => void;
  recipient: string;
  setRecipient: (username: string) => void;
  handleCreateDM: () => Promise<void>;
};
        
function ChatSidebar({
  channels,
  chats,
  users,
  chatId,
  currentUserId,
  setChatId,
  clearMessages,
  showChats,
  setShowChats,
  showContacts,
  setShowContacts,
  selectedContact,
  setSelectedContact,
  recipient,
  setRecipient,
  handleCreateDM,
}: ChatSidebarProps) {

  
  return (
  <aside className="chat-sidebar">
    {/* vänster sidopanel */}

          <section className="sidebar-section">
            <h2>Kanaler</h2>
            <ChannelList
              channels={channels}
              chatId={chatId}
              setChatId={setChatId}
          setMessages={clearMessages}
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
                  clearMessages={clearMessages}
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
          );
}

export default ChatSidebar;