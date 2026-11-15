import type { ChatListItem } from "../api/chatsApi.js";
import type { User } from "../api/usersApi.js";


type ChatListProps = {
  chats: ChatListItem[];
  users: User[];
  chatId: string | null;
  currentUserId: string | null;
  setChatId: (id: string) => void;
  clearMessages: () => void;
};

  function ChatList({
  chats,
  users,
  chatId,
  currentUserId,
  setChatId,
  clearMessages,
}: ChatListProps) {
    return (
      <div className="sidebar-list">
        {chats.map((chat) => (
          <button
            key={chat.chatId}
            type="button"
            className={`sidebar-item ${chatId === chat.chatId ? "active" : ""
              }`}
            aria-pressed={chatId === chat.chatId}
            onClick={() => {
              setChatId(chat.chatId);
              clearMessages();
            }}
          >
            {users.find((user) =>
              user.userId !== currentUserId &&
              chat.chatId.includes(user.userId)
            )?.username ?? chat.chatId}
          </button>
        ))}
      </div>
    );
  }

  export default ChatList;