
import { Lock } from "lucide-react";
import type { Channel } from "../api/channelsApi.js";

type ChannelListProps = {
  channels: Channel[];
  chatId: string | null;
  setChatId: (id: string) => void;
  setMessages: () => void;
};

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
          className={`sidbar-item ${chatId === channel.chatId ? "activ" : ""}`}
          aria-pressed={chatId === channel.chatId}
          onClick={() => {
            setChatId(channel.chatId);
            setMessages();
          }}
        >
          {channel.locked && <Lock size={14} className="channel-lock" />}
          {channel.name}
        </button>
      ))}
    </div>
  )
}

export default ChannelList;
