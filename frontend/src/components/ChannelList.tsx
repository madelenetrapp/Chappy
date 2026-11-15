 import { Lock } from "lucide-react";
import type { Channel } from "../api/channelsApi.js";

 type ChannelListProps = {
  channels: Channel[];
  chatId: string | null;
  setChatId: (id: string) => void;
  setMessages: () => void;
};
 
 // visar alla kanaler
function ChannelList({
  channels,
  chatId,
  setChatId,
  setMessages,
}: ChannelListProps) {
  return (
      <div className="sidebar-list">
        {channels.map((channel) => (
          <button
            key={channel.chatId}
            type="button"
            // markerar den valda kanalen med css klass active, aria-pressed visar för hjälpmedel om kanalen är vald
            className={`sidbar-item ${chatId === channel.chatId ? "activ" : ""}`}
            aria-pressed={chatId === channel.chatId}
            onClick={() => {
              setChatId(channel.chatId);
              setMessages();
            }}
          >
            {/* reacts egna ikoner */}
            {channel.locked && <Lock size={14} className="channel-lock" />}
            {channel.name}
          </button>
        ))}
      </div>
    )
  }

  export default ChannelList;